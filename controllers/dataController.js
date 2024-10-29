const csv = require('csv-parser')
const fs = require('fs')
const Queue = require('bull')
const queue = new Queue('dataUpload', {redis: {port: 6379, host: '127.0.0.1'}})
const Data = require ('../models/dataSchema')

async function uploadData(req, res) {
    try{
        console.log("Inside upload data fxn")
        console.log("req.file-----", req.file)
       if(!req.body.file){
        res.status(400).json({message: "File address missing !"})
       }
       const data = {
        filePath: req.file.path
       }
       queue.add(data)

       queue.process(async (job, done)=>{
        const {filePath} = job.data
        const stocks = []
        fs.createReadStream(filePath)
        .pipe(csv({delimiter: ",", from_line: 2 }))
        .on('data', (row)=>{
           stocks.push({
            open: parseFloat(row.open),
            high: parseFloat(row.high),
            low: parseFloat(row.low),
            close: parseFloat(row.close),
            volume: parseFloat(row.volume),
            openInt: parseInt(row.OpenInt),
           })
        })
        .on('end',async ()=>{
            try{
              await Data.insertMany(stocks);
              done();
            }
           catch(err){
              return res.status(500).json({message: err.message})
           }
        })
       })
    } catch(error){
        return res.status(500).json({message: error.message})
    }
}

module.exports = {
    uploadData
}


