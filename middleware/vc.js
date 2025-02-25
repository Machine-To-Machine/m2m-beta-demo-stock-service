import { VerifiableCredential } from "@web5/credentials";

export const verifyToken = async (req, res, next) => {
  try {
    const { vcJwt, timestamp } = req.body;

    // Check for missing token
    if (!vcJwt) {
      return res.status(401).json({ message: "Machine verification failed: Missing verification credentials" });
    }

    // Check request timestamp
    const now = new Date().getTime();
    if (timestamp && now - timestamp > 300000) { // 5 minutes
      return res.status(401).json({ message: "Request timeout: Timestamp expired" });
    }

    // Verify the JWT token
    try {
      const vc = await VerifiableCredential.verify({ vcJwt });

      if (!vc) {
        return res.status(401).json({ message: "Machine verification failed: Invalid credentials" });
      }

      // Store verification result for later use
      req.verifiedCredential = vc;
      next();
    } catch (verificationError) {
      // Only log minimal error info, not the full error object
      console.error("Verification error:", verificationError.message);
      return res.status(401).json({ message: "Machine verification failed: Invalid credentials" });
    }
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(500).json({ message: "Internal server error during verification" });
  }
};
