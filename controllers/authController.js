import User from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const register = async (req, res) => {
    try {

        const { username, password, role } = req.body;
        const hasedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hasedPassword, role })
        await newUser.save();

        res
            .status(201)
            .json({ message: `User registered with username ${username}` })

    } catch (error) {
        res.status(500).json({ message: "Error Registring" })
    }
};

const login = async (req, res) => {

    try {
    
        const {username, password} = req.body;
    const user = await User.findOne({ username });

    if(!user){
        return res.status(404).json({ message : `User with ${username} not found go register first`})
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
    {
        return res.status(400).json({
            message:"Invalid Credentials"
        })
    }

    const token = jwt.sign(
        {id : user._id, role: user.role}, process.env.JWT_SECRET,
        {expiresIn : "1h"}
    )

    res.status(200).json({message : "successful", token})

    } catch (error) {
        res.status(500).json({message : "Login error"})
    }
    

 };

export { register, login };