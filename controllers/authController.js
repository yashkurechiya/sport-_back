import User from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateToken } from "../utils/generatetoken.js";


const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role: "user",
            provider: "local",
        });
        await newUser.save();

        /**
         * Generates a signed JSON Web Token (JWT) for a newly created user.
         *
         * The token payload includes:
         * - `id`: the user's unique identifier
         * - `role`: the user's authorization role
         *
         * The token is signed using the secret from `process.env.JWT_SECRET`
         * and is configured to expire after 1 hour, enabling short-lived
         * authenticated sessions.
         *
         * @type {string}
         * 
         */

        const token =  generateToken(newUser);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
            },
        });

    } catch (error) {
        res.status(500).json({ message: error.message || "Error Registering" });
    }
};

const login = async (req, res) => {

    try {

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: `User with ${username} not found go register first` })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Credentials"
            })
        }

        const token = generateToken(user)

        res.status(200).json({ message: "successful", token, user : { id: user._id, username: user.username, role: user.role } })

    } catch (error) {
        res.status(500).json({ message: "Login error" })
    }
};

export { register, login };