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
    async (req, res) => {

        const user = await User.findById(req.user.id).select("-password");

        const tournaments = await Tournament.find({
            "participants.userId": req.user.id
        });

        res.json({
            user,
            tournaments,
            message: "Welcome User "
        });
    })

usRouter.get(
    "/me",
    verifyToken,
    authorizeRoles("me"),
    async (req, res) => {
        try {
            // all registered users (users + admins)
            const users = await User.find()
                .select("-password")
                .sort({ createdAt: -1 });

            // all tournaments
            const tournaments = await Tournament.find()
                .populate("createdBy", "name email role")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "Admin dashboard data",
                stats: {
                    totalUsers: users.length,
                    totalTournaments: tournaments.length
                },
                users,
                tournaments
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

export default usRouter;