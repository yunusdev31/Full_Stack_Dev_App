const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/user')
.then(()=>{
    console.log('Connected to database')
}).catch((error)=>{
    console.log('Error connecting to database', error)
})