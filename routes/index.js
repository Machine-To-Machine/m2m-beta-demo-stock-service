import express from "express";
import { clearLog, fetchLog, stockFunc, testFunc } from "../controller/stock.js";
import { chatWithAI } from "../controller/openai.js";
import { verifyToken } from "../middleware/vc.js";

const router = express.Router();

// Test and diagnostics
router.post("/test", testFunc);

// Protected endpoints
router.post("/stock", verifyToken, stockFunc);
router.post("/chat", verifyToken, chatWithAI);

// Log management
router.get("/log", fetchLog);
router.delete("/log", clearLog);

export default router;