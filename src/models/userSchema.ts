import mongoose from 'mongoose'

interface IUser {
    username: string,
    password: string,
    role: string
}

export const allowedRoles = ['manager', 'admin', 'user']

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: allowedRoles,
        required: true
    }
})

export const User = mongoose.model<IUser>('User', userSchema)