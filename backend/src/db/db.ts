import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI

const connectDB = async() => {
    try {
        if(!MONGO_URI){
            throw new Error("Mongo URI is missing")
        }
        await mongoose.connect(MONGO_URI)
        console.log('connected to mongodb')
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

export default connectDB;

