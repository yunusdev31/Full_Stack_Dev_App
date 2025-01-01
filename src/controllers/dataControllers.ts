import csv from 'csv-parse';
import {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'
import Queue from 'bull'
import {Data} from '../models/dataSchema'
const queue = new Queue('dataUpload', {redis: {port: 6379, host: '127.0.0.1'}})
const batch_size = 1000;

type stocksType = {
  date: string, 
  open: number, 
  high: number, 
  low: number, 
  close: number, 
  volume: number, 
  openInt: number
};

const readStreamFun = async (filePath: string, stocks: stocksType[], res: Response, done: any): Promise<void> => {
  console.log("filePath 111----", filePath)
  let readStream = fs.createReadStream(filePath).pipe(csv.parse({delimiter: ",", from_line: 2 }))
  console.log("filePath 222----", filePath)
  return new Promise((resolve, reject) => {
    readStream.on('data', (row) => {
      //console.log("row data------", row)
      let stockData: stocksType = {
        date: row[0],
        open: parseFloat(row[1]),
        high: parseFloat(row[2]),
        low: parseFloat(row[3]),
        close: parseFloat(row[4]),
        volume: parseFloat(row[5]),
        openInt: parseInt(row[6]),
      }
      //console.log("stockData====", stockData)
      stocks.push(stockData)
      if(stocks.length == batch_size) { 
        readStream.pause();
        console.log('Reading paused ! Data is being uploaded to DB !')
        Data.insertMany(stocks)
        .then(()=>{
          console.log('Data inserted successfully ! New data is being loaded !')
          stocks = []
          readStream.resume();
          console.log('Reading resumed !')
        })
        .catch((error: Error)=>{
          console.log(`Some error occured in uploading data to DB ${error}`)
        })             
      }
    })
    readStream.on('end', async () => {
      try{
        if(stocks.length > 0){
          await Data.insertMany(stocks);
          console.log('All data inserted successfully !')
          resolve()
        }
      }
      catch(err: any){
        return res.status(500).json({message: `Some error occured in inserting last batch of data ${err.message}`})
      }
    })
    readStream.on('error', (error) => {
      console.log("Error in reading file", error)
      reject(error)
    })
  })
}

// Function to upload data to the database
export const uploadData = async(req: Request, res: Response): Promise<any> => {
  try{
    console.log("Inside upload data fxn")
    console.log("dir path-----", req.body.path)
    const dirPath = req.body.path
    if(!dirPath){
      return res.status(400).json({message: "File address missing !"})
    }
    const data = {
      filePath: dirPath
    }
    queue.add(data)
    queue.process(async (job, done) => {
      const {filePath} = job.data
      const stocksFolder = fs.readdirSync(filePath)
      console.log("stocks file==>", stocksFolder)
      let stocks: stocksType[] = [];

      for(let file of stocksFolder){
        console.log("file name===", file)
        let filePath = path.join(dirPath, file)
        await readStreamFun(filePath, stocks, res, done)
      }
      done();
    })
  } catch(error: any){
    return res.status(500).json({message: error.message})
  }
}



