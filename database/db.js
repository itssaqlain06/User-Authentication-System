import mongoose from "mongoose"

const connectDB = async (MONGODB_URL) => {
    try {
        await mongoose.connect(MONGODB_URL)
        console.log('Database connected successfully...✅')
    } catch (error) {
        console.log(`Database connection is failed...❌ ${error}`)
    }
}
export default connectDB;