import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Tournament from "../models/tournament.js";

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    return res.status(200).json(order);

  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order"
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tournamentId
    } = req.body;

    // 🔐 Auth safety
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    // 🔐 Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // ✅ Fetch tournament
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // ✅ Business rule (single source of truth)
    if (tournament.computedState !== "Started") {
      return res.status(400).json({
        message: `Tournament is ${tournament.computedState}`
      });
    }

    // Ensure participants array
    if (!tournament.participants) {
      tournament.participants = [];
    }

    // 🛑 Prevent double enrollment
    const alreadyEnrolled = tournament.participants.some(
      (p) => p.userId.toString() === userId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // ✅ Enroll user
    tournament.participants.push({
      userId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    tournament.enrolled += 1;
    await tournament.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified & enrolled"
    });

  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};

