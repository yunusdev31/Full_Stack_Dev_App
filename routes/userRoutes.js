const express = require('express')
const router = express.Router()
const path = require('../controllers/userController.js') 

router.post('/register', path.register)

router.get('/login', path.login)

module.exports = router

