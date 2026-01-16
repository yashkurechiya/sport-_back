import express, { Router } from 'express'
import Tournament from '../models/tournament.js';
import verifyToken from '../middlewares/authMiddlewares.js';
import authorizeRoles from '../middlewares/roleMiddleware.js';

export const touRouter = express.Router();

const statePriority = {
    Started : 1,
    Upcoming : 2,
    Outdated : 3
}

touRouter.post('/create', verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const tournament = new Tournament({ ...req.body, createdBy: req.user.id })
        await tournament.save();

        console.log("BACKEND RECEIVED:", req.body);


        res.status(201).json({
            success: true,
            message: "Tournament created successfully",
            data: tournament
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

touRouter.get("/getTournament", async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    const sortedTour = tournaments.sort((a,b) => {
        return (
            statePriority[a.computedState] - statePriority[b.computedState]
        );
    });

    res.status(200).json({
      success: true,
      data: sortedTour
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


touRouter.get('/my-tournaments', verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const tournaments = await Tournament.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tournaments.length,
            data: tournaments
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

touRouter.post("/enroll/:id", verifyToken, authorizeRoles("user"), async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found " });
        }

        const already = tournament.participants.some(
            (p) => p.userId.toString() === req.user.id
        );

        if (already) {
            return res.status(400).json({ message: "You are already enrolled " });
        }

        tournament.participants.push({ userId: req.user.id });
        tournament.enrolled += 1;

        await tournament.save();

        res.status(200).json({
            message: "Enrolled succesfully",
            data: tournament
        });

    } catch (error) {

        console.log("ENROLL ERROR:", error);  // 👈 IMPORTANT
        res.status(500).json({ message: error.message });


    }
})

touRouter.get("/:id/participants", verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate("participants.userId", "username role createAt");

        if (!tournament) {
            return res.status(404).json({ message: "TOurnament not found " });
        }

        if (tournament.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied " });
        }

        res.status(200).json({
            success: true,
            participants: tournament.participants
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

touRouter.get("/:id", async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found " });
        }

        res.status(200).json({ success: true, data: tournament });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
})