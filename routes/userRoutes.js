import express from 'express'
import verifyToken from '../middlewares/authMiddlewares.js';
import authorizeRoles from '../middlewares/roleMiddleware.js';
const usRouter = express.Router();

usRouter.get("/admin", verifyToken, authorizeRoles("admin"),
    (req, res) => {
        res.json({ message: "Welcom Admin" });
    })


usRouter.get("/user", verifyToken, authorizeRoles("admin", "user"),
    (req, res) => {
        res.json({ message: "Welcome User " });
    })

export default usRouter;