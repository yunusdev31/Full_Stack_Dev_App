const express = require('express')
require('./models/db.js')
const PORT = 8000;
const user = require('./routes/userRoutes.js')
const data = require('./routes/dataRoutes.js')
const app = express();
app.use(express.json());


app.use('/user', user)
app.use('/data', data)

app.listen(PORT, ()=>{
    console.log(`Server listening on PORT ${PORT}`)
})