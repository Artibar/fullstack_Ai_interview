import mongoose from "mongoose"

const connectToDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB, {})
        console.log("MongoDb connection successful");
    } catch (error) {
        console.log("MongoDb connection failed", error.message);
        process.exit(1);
    }
}

export default connectToDB;