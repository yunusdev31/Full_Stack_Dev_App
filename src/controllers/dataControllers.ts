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
    queue.process(async (job, done)=>{
      const {filePath} = job.data
      const stocksFolder = fs.readdirSync(filePath)
      console.log("stocks file==>", stocksFolder)
      let stocks: stocksType[] = [];
      let cnt = 0;
      stocksFolder.map((file) => {
        cnt++;
        console.log("cnt-==--=-==", cnt)
        let filePath = path.join(dirPath, file)
        let readStream = fs.createReadStream(filePath).pipe(csv.parse({delimiter: ",", from_line: 2 }))

        readStream.on('data', (row) => {
          console.log("row data------", row)
          console.log("file ----", file)
          let stockData: stocksType = {
            date: row[0],
            open: parseFloat(row[1]),
            high: parseFloat(row[2]),
            low: parseFloat(row[3]),
            close: parseFloat(row[4]),
            volume: parseFloat(row[5]),
            openInt: parseInt(row[6]),
          }
          console.log("stockData====", stockData)
          stocks.push(stockData)
          if(stocks.length == batch_size) { 
            // readStream.pause();
            // Data.insertMany(stocks)
            // .then(()=>{
            //   console.log('Data inserted successfully ! New data is being loaded[[[[]]]]')
            //   stocks = []
            //   readStream.resume();
            // })
            // .catch((error: Error)=>{
            //   console.log(`Some error occured in uploading data to DB ${error}`)
            // })             
          }
        })
        readStream.on('end', async () => {
          try{
            if(stocks.length > 0){
              await Data.insertMany(stocks);
              done();
            }
          }
          catch(err: any){
            return res.status(500).json({message: err.message})
          }
        })
      })
    })
  } catch(error: any){
    return res.status(500).json({message: error.message})
  }
}



