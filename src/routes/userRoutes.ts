import express from 'express';
const router = express.Router()
import {register, login} from '../controllers/userControllers'

router.post('/register', register)

router.get('/login', login)

export = router

