import express, { Router } from 'express'
import Tournament from '../models/tournament.js';
import verifyToken from '../middlewares/authMiddlewares.js';
import authorizeRoles from '../middlewares/roleMiddleware.js';
import redis from '../config/redisClient.js';

export const touRouter = express.Router();

const statePriority = {
    Started: 1,
    Upcoming: 2,
    Outdated: 3
}

const CACHE_TTL_SECONDS = 120;
const TOURNAMENTS_ALL_KEY = "tournaments:all";
const tournamentByIdKey = (id) => `tournaments:id:${id}`;
const myTournamentsKey = (userId) => `tournaments:my:${userId}`;

const safeGetCache = async (key) => {
    try {
        const payload = await redis.get(key);
        return payload ? JSON.parse(payload) : null;
    } catch {
        return null;
    }
};

const safeSetCache = async (key, value, ttlSeconds = CACHE_TTL_SECONDS) => {
    try {
        await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch {
        // Ignore cache failures and keep request flow healthy.
    }
};

const safeDeleteKeys = async (...keys) => {
    try {
        const compactKeys = keys.filter(Boolean);
        if (compactKeys.length > 0) {
            await redis.del(compactKeys);
        }
    } catch {
        // Ignore cache failures and keep request flow healthy.
    }
};

touRouter.post('/create', verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const tournament = new Tournament({ ...req.body, createdBy: req.user.id })
        await tournament.save();

        await safeDeleteKeys(
            TOURNAMENTS_ALL_KEY,
            myTournamentsKey(req.user.id)
        );

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
        const cached = await safeGetCache(TOURNAMENTS_ALL_KEY);
        if (cached) {
            return res.status(200).json(cached);
        }

        const tournaments = await Tournament.find();
        const sortedTour = tournaments.sort((a, b) => {
            return (
                statePriority[a.computedState] - statePriority[b.computedState]
            );
        });

        const response = {
            success: true,
            data: sortedTour
        };

        await safeSetCache(TOURNAMENTS_ALL_KEY, response);

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


touRouter.delete(
  "/deleteTournament/:id",
  verifyToken,
  authorizeRoles("me"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found"
        });
      }

      await Tournament.findByIdAndDelete(id);

            await safeDeleteKeys(
                TOURNAMENTS_ALL_KEY,
                tournamentByIdKey(id),
                myTournamentsKey(tournament.createdBy?.toString())
            );

      res.status(200).json({
        success: true,
        message: "Tournament removed successfully"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);



touRouter.get('/my-tournaments', verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const cacheKey = myTournamentsKey(req.user.id);
        const cached = await safeGetCache(cacheKey);

        if (cached) {
            return res.status(200).json(cached);
        }

        const tournaments = await Tournament.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

        const response = {
            success: true,
            count: tournaments.length,
            data: tournaments
        };

        await safeSetCache(cacheKey, response);

        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

touRouter.post('/update', verifyToken, authorizeRoles("admin"), async(req, res) => {
    
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

        await safeDeleteKeys(
            TOURNAMENTS_ALL_KEY,
            tournamentByIdKey(req.params.id),
            myTournamentsKey(tournament.createdBy?.toString())
        );

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
        const cacheKey = tournamentByIdKey(req.params.id);
        const cached = await safeGetCache(cacheKey);

        if (cached) {
            return res.status(200).json(cached);
        }

        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found " });
        }

        const response = { success: true, data: tournament };

        await safeSetCache(cacheKey, response);

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
})

