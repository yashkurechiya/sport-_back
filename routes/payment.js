import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import verifyToken from '../middlewares/authMiddlewares.js';

const Prouter = express.Router();
Prouter.post("/create-order", createOrder);
Prouter.post("/verify",  verifyToken,verifyPayment);

export default Prouter;