import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import { promisify } from "util";

const API = axios.create({
  baseURL: process.env.YAHOO_LINK,
  timeout: 10000 // Add timeout
});

// Use async/await with promises for file operations
const appendFileAsync = promisify(fs.appendFile);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Log file path - consider moving to a dedicated logs directory
const LOG_FILE = "log.txt";

export const testFunc = (req, res) => {
  const { name } = req.body;
  // Sanitize input - prevent injection
  const sanitizedName = name ? String(name).substring(0, 50).replace(/[^\w\s]/gi, '') : "World";

  res.send({
    message: `Hello ${sanitizedName}`
  });
};

export const stockFunc = async (req, res) => {
  try {
    const { info } = req.body;

    // Input validation
    if (!info || !info.symbol || !info.period1 || !info.period2) {
      return res.status(400).json({ message: "Missing required stock information" });
    }

    const { symbol, period1, period2 } = info;

    // Validate symbol format
    if (!/^[A-Za-z0-9.]{1,10}$/.test(symbol)) {
      return res.status(400).json({ message: "Invalid stock symbol format" });
    }

    // Validate period format (timestamps)
    if (!/^\d+$/.test(period1) || !/^\d+$/.test(period2)) {
      return res.status(400).json({ message: "Invalid time period format" });
    }

    // Avoid excessive date ranges
    if (Number(period2) - Number(period1) > 63072000) { // ~2 years in seconds
      return res.status(400).json({ message: "Time period too large" });
    }

    const { data } = await API.get(
      `${symbol}?symbol=${symbol}&period1=${period1}&period2=${period2}&interval=1d&events=history%7Csplit`
    );

    if (!data || !data.chart || !data.chart.result || !data.chart.result[0] ||
        !data.chart.result[0].indicators || !data.chart.result[0].indicators.adjclose) {
      return res.status(404).json({ message: "Stock data not found or incomplete" });
    }

    const adjClosePrices = data.chart.result[0].indicators.adjclose[0].adjclose;

    // Calculate the 9-day Moving Average
    const movingAverage9Day = calculateEMA(adjClosePrices, 9);

    // Calculate the MACD
    const macdValues = calculateMACD(adjClosePrices);

    // Store log
    await storeLog(symbol, period1, period2);

    res.send({
      message: "Stock data analysis complete",
      vcJwt: process.env.VC_JWT,
      data: {
        movingAverage9Day,
        macdValues,
      },
    });
  } catch (error) {
    console.error("Stock data error:", error.message);

    // Provide appropriate error response based on error type
    if (error.response) {
      // API responded with an error
      return res.status(error.response.status).json({
        message: "Error fetching stock data",
        details: error.response.statusText
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to calculate the Exponential Moving Average (EMA)
const calculateEMA = (prices, period) => {
  if (!Array.isArray(prices) || prices.length === 0) {
    return [];
  }

  const k = 2 / (period + 1);
  let ema = [prices[0]];

  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  }

  return ema;
};

// Function to calculate the Moving Average Convergence Divergence (MACD)
const calculateMACD = (prices) => {
  if (!Array.isArray(prices) || prices.length === 0) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((value, index) => value - ema26[index]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((value, index) => value - signalLine[index]);

  return { macdLine, signalLine, histogram };
};

const storeLog = async (symbol, period1, period2) => {
  try {
    const log = {
      symbol,
      period1,
      period2,
      createdAt: new Date().toISOString(),
    };

    await appendFileAsync(LOG_FILE, JSON.stringify(log) + '**');
    return log;
  } catch (error) {
    console.error("Error writing log file:", error.message);
    // Continue execution even if logging fails
    return null;
  }
};

export const fetchLog = async (req, res) => {
  try {
    // Check if file exists first
    if (!fs.existsSync(LOG_FILE)) {
      return res.send({
        message: "No logs available",
        data: [],
      });
    }

    const logContent = await readFileAsync(LOG_FILE, "utf8");
    const logs = logContent.split("**")
      .filter(log => log !== "")
      .map(log => {
        try {
          return JSON.parse(log);
        } catch (e) {
          return null;
        }
      })
      .filter(log => log !== null);

    res.send({
      message: "Log data retrieved",
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching logs:", error.message);
    res.status(500).json({ message: "Error retrieving log data" });
  }
};

export const clearLog = async (req, res) => {
  try {
    await writeFileAsync(LOG_FILE, "");
    res.send({
      message: "Log data cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing logs:", error.message);
    res.status(500).json({ message: "Error clearing log data" });
  }
};
