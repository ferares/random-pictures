const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const path = require('path')

// Middlewares
const { upload, resizeImages } = require('./middlewares/uploads')
const { hcaptcha } = require('./middlewares/hcaptcha')

// Models
const Picture = require('./models/Picture')

// Controllers
const AdminController = require('./controllers/admin')
const PicturesController = require('./controllers/pictures')

// Load env variables
require('dotenv').config()
const { PORT } = process.env

// DB
require('./db').connect()

// Server
const httpServer = express()

// Template engine config
httpServer.set('views', path.join(__dirname, 'views'))
httpServer.set('view engine', 'pug')

// Body parser
httpServer.use(bodyParser.urlencoded({ extended: true }))
httpServer.use(bodyParser.json())

// CORS
httpServer.use(cors())

// httpServer.get('/admin', AdminController.get)
// httpServer.post('/admin', AdminController.post)

httpServer.get('/random', PicturesController.random)
// httpServer.get('/all', PicturesController.all)
/*httpServer.post(
  '/new',
  upload.array('pictures[]'),
  resizeImages,
  hcaptcha,
  PicturesController.post
)*/

// Start server
httpServer.listen(PORT, () => console.log(`Listening on ${PORT}`))
