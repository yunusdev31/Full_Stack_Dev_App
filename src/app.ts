import express from 'express'
import {connectDB} from './models/db'
import user from './routes/userRoutes'
import data from './routes/dataRoutes'
const PORT = 8000;
connectDB()

const app = express();
app.use(express.json());


app.use('/user', user)
app.use('/data', data)

app.listen(PORT, ()=>{
    console.log(`Server listening on PORT ${PORT}`)
})