const express = require('express')
const router = express.Router()
const path = require('../controllers/controller.js') 

router.post('/auth/register', path.register)

router.get('/api/login', path.login)

module.exports = router

