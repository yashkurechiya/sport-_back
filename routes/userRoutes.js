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
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const users = await User.find()
                .select("-password")
                .sort({ createdAt: -1 });

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

usRouter.patch(
    "/:id/role",
    verifyToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { role } = req.body;

            if (!["admin", "user", "me"].includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { role },
                { new: true }
            ).select("-password");

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({
                message: "Role updated successfully",
                user: updatedUser,
            });
        } catch (error) {
            res.status(500).json({ message: error.message || "Server error" });
        }
    }
);

export default usRouter;