import mongoose from 'mongoose'

interface IData {
    date: Date,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    openInt: number
}

const dataSchema = new mongoose.Schema<IData>({
    date: {
        type: Date,
    },
    open: {
        type: Number,
    },
    high: {
        type: Number,
    },
    low: {
        type: Number,
    },
    close: {
        type: Number,
    },
    volume: {
        type: Number,
    },
    openInt: {
        type: Number,
    }
})

export const Data = mongoose.model<IData>('Data', dataSchema)