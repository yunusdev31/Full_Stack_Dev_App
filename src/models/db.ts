import mongoose from 'mongoose'
export const connectDB = async () =>{
    try{
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/Dashboard')
        console.log('Connected to database')
    } catch(error: any) {
        console.log('Error connecting to database', error)
    }
}
