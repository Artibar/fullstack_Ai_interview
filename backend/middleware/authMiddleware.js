
import jwt from "jsonwebtoken"
import  User  from "../models/User.js"
const protectRoute = async(req, res, next) =>{
    try {
        console.log("req.headers.authorization:", req.headers.authorization);
        console.log("Authorization headers received:, req.headers.authorization");
        
    const authHeader = req.headers?.authorization || req.get("authorization")
    console.log("authHeader:", authHeader);
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "Authorization header missing or malformed"})
    }
    const token = authHeader.split(" ")[1]
    console.log("token", token?.slice(0, 10) + (token?.length > 10 ? "...": ""));
    
    if(!token){
        return res.status(404).json({message: "token- unauthorized"})
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if(!decoded){
        return res.status(404).json({message:"invalid token"})
    }
    const user = await User.findById(decoded.id).select('-password')
    if(!user){
        res.status(404).json({message:"User not found"})
    }
    req.user = user
    next()
    } catch (error) {
        res.status(500).json({message:"internal server error"})
        console.log("Error in authMiddleware", error.message)
    }
}
export default protectRoute;