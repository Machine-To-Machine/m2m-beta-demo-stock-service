import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv/config";
import path from "path";

import mainRoutes from "./routes/index.js";

const app = express();

// Use specific origin from environment instead of wildcard
const corsConfig = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: "GET, POST, PATCH, DELETE",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

const PORT = process.env.PORT || 8002;

// Set request size limits to prevent abuse
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors(corsConfig));

// Set basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Router config
app.use("/", mainRoutes);

// Front end serving
app.use(express.static(path.join("client/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.resolve("client/dist/index.html"))
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err.message);
  res.status(err.status || 500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});
