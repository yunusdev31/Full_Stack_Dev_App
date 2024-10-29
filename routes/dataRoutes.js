const express = require('express');
const router = express.Router();
const authMiddleware = require('../models/middleware')
const path = require('../controllers/dataController')

router.post('/upload', authMiddleware(['admin']), path.uploadData)


module.exports = router