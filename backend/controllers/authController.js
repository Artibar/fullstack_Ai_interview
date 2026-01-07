

import User  from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
const generateToken = (userId) =>{
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
    
}
export const signup = async (req, res) => {
    try {
        const { username, email, password, profileImageUrl=null } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const existsUser = await User.findOne({ email })
        if (existsUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            profileImageUrl
        })
        res.status(201).json({
            success: true,
            message: "account created successfully",
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        })
    } catch (error) {
       res.status(500).json({message:"Internal server error"})
       console.log("Error in signup controller", error.message)
    }
}
export const login = async (req, res) => {
    try {
       const {email, password} = req.body;
       const user = await User.findOne({email})
       if(!user){
        return res.status(400).json({message:"Invalid email or password"})
       }
       if(password.length<6){
         return res.status(400).json({message:"password must be at least 6 characters"})
       }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"})
        }
        res.json({
            _id:user._id,
            username:user.username,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        })
    } catch (error) {
       res.status(500).json({message:"Internal server error"})
       console.log("Error in login controller", error.message)
    }
}

export const getProfile = async (req, res) => {
    try {
       const user = await User.findById(req.user.id).select('-password');
       if(!user){
        return res.status(404).json({message:"user not found", error:error.message})
       }
       res.json(user)
    } catch (error) {
       res.status(500).json({message:"Internal server error", error:error.message})
       console.log("Error in profile controller", error.message)
    }
}