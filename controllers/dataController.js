const csv = require('csv-parser')
const fs = require('fs')
const path = require('path')
const Queue = require('bull')
const queue = new Queue('dataUpload', {redis: {port: 6379, host: '127.0.0.1'}})
const Data = require ('../models/dataSchema')
const batch_size = 1000;

async function uploadData(req, res) {
  try{
    console.log("Inside upload data fxn")
    console.log("file path-----", req.body.path)
    const dirPath = req.body.path
    if(!dirPath){
      res.status(400).json({message: "File address missing !"})
    }
    const data = {
      filePath: dirPath
    }
    queue.add(data)
    queue.process(async (job, done)=>{
      const {filePath} = job.data
      const stocksFolder = fs.readdirSync(filePath)
      console.log("stocks file==>", stocksFolder)
      let stocks = [];
      stocksFolder.map((file) => {
        let filePath = path.join(dirPath, file)
        let readStream = fs.createReadStream(filePath).pipe(csv({delimiter: ",", from_line: 2 }))

        readStream.on('data', (row) => {
          console.log("row data------", row)
          let stockData = {
            date: row.Date,
            open: parseFloat(row.Open),
            high: parseFloat(row.High),
            low: parseFloat(row.Low),
            close: parseFloat(row.Close),
            volume: parseFloat(row.Volume),
            openInt: parseInt(row.OpenInt),
          }
          console.log("stockData====", stockData)
          stocks.push(stockData)
          if(stocks.length == batch_size) { 
            readStream.pause();
            Data.insertMany(stocks)
            .then(()=>{
              console.log('Data inserted successfully ! New data is being loaded[[[[]]]]')
              stocks = []
            readStream.resume();
          })
          .catch((error)=>{
              console.log(`Some error occured in uploading data to DB ${error}`)
            })             
          }
        })
        readStream.on('end', async () => {
          try{
            if(stocks.length > 0){
              await Data.insertMany(stocks);
              done();
            }
          }
          catch(err){
            return res.status(500).json({message: err.message})
          }
        })
      })
    })
  } catch(error){
    return res.status(500).json({message: error.message})
  }
}

async 

module.exports = {
  uploadData
}


