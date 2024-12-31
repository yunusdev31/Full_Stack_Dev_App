import express from 'express';
const router = express.Router();
import {authMiddleware} from '../models/middleware'
import {uploadData} from '../controllers/dataControllers'

router.post('/upload', authMiddleware(['admin']), uploadData)

router.post('')

export = router