import express from 'express';
const router = express.Router();
import {authMiddleware} from '../models/middleware'
import {getAvgValues, getDetailedData, getLimitedData, uploadData} from '../controllers/dataControllers'

router.post('/upload', authMiddleware(['admin']), uploadData)

router.get('/getDetailedData', authMiddleware(['admin']), getDetailedData)

router.get('/getLimitedData', authMiddleware(['admin', 'manager']), getLimitedData)

router.get('/getAvgValues', authMiddleware(['admin', 'manager']), getAvgValues)

export = router