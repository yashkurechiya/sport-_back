import express from 'express'
import verifyToken from '../middlewares/authMiddlewares.js';
import authorizeRoles from '../middlewares/roleMiddleware.js';
import User from '../models/userModel.js';
import Tournament from '../models/tournament.js';
const usRouter = express.Router();

usRouter.get("/admin", verifyToken, authorizeRoles("admin"),
    (req, res) => {
        res.json({ message: "Welcom Admin" });
    })


usRouter.get("/user", verifyToken, authorizeRoles("admin", "user"),
  async  (req, res) => {

        const user = await User.findById(req.user.id).select("-password");

        const tournaments = await Tournament.find({
            "participants.userId" : req.user.id
        });

        res.json({ 
            user,
            tournaments,
            message: "Welcome User " });
    })

export default usRouter;