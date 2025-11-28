// import Razorpay from "razorpay";
// import crypto from "crypto";
// import Enrollment from "../models/Enrollment.js";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// // 1️⃣ Create Order
// export const createOrder = async (req, res) => {
//   const { amount, tournamentId, userId, teamName } = req.body;

//   try {
//     const options = {
//       amount: amount * 100,
//       currency: "INR",
//       receipt: `order_${Date.now()}`
//     };

//     const order = await razorpay.orders.create(options);

//     res.json({ order });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "Order creation failed" });
//   }
// };


// // 2️⃣ Verify payment + Save registration
// export const verifyPayment = async (req, res) => {
//   const {
//     razorpay_payment_id,
//     razorpay_order_id,
//     razorpay_signature,
//     tournamentId,
//     userId,
//     teamName
//   } = req.body;

//   try {
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {

//       await Enrollment.create({
//         tournamentId,
//         userId,
//         teamName,
//         paymentId: razorpay_payment_id,
//         status: "paid"
//       });

//       return res.json({ success: true, msg: "Payment verified & team registered!" });
//     }

//     res.status(400).json({ success: false, msg: "Invalid Signature" });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "Verification failed" });
//   }
// };
