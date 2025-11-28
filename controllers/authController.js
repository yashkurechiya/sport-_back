import User from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Check if user already exists
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();

        // Generate token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send correct response
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

        const token = jwt.sign(
            { id: user._id, role: user.role }, process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.status(200).json({ message: "successful", token, user : { id: user._id, username: user.username, role: user.role } })

    } catch (error) {
        res.status(500).json({ message: "Login error" })
    }
};

export { register, login };