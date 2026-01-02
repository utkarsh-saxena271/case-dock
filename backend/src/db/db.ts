import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_DB_URI

const connectDB = async() => {
    try {
        if(!MONGO_URI){
            throw new Error("Mongo URI is missing")
        }
        await mongoose.connect(MONGO_URI)
    } catch (error) {
        console.error(error)
    }
}

export default connectDB;

