import bodyParser from 'body-parser'
import cors, { CorsOptions } from 'cors'
import express from 'express'
import path from 'path'
import dotenv from 'dotenv'

// Middlewares
import Uploads from './middlewares/uploads'
import Captcha from './middlewares/hcaptcha'

// Controllers
import AdminController from './controllers/admin'
import PicturesController from './controllers/pictures'

// DB
import DB from './services/database'
import multer from 'multer'

// Load env variables
dotenv.config()
const { PORT } = process.env

// DB
DB.connect()

// Server
const httpServer = express()

// Template engine config
httpServer.set('views', path.join(__dirname, 'views'))
httpServer.set('view engine', 'pug')

// Body parser
httpServer.use(bodyParser.urlencoded({ extended: true }))
httpServer.use(bodyParser.json())

// CORS
const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => callback(null, true),
}
httpServer.use(cors(corsOptions))

// Static files
httpServer.use(express.static('public'))

httpServer.get('/admin', AdminController.get)
httpServer.post('/admin', AdminController.post)

httpServer.get('/random', PicturesController.random)
httpServer.get('/all', PicturesController.all)
httpServer.get('/upload', PicturesController.uploadForm)
httpServer.post(
  '/upload',
  multer({ storage: multer.memoryStorage(), fileFilter: Uploads.imageFilter }).array('pictures[]'),
  Uploads.resizeImages,
  Captcha.verify,
  PicturesController.uploadPost
)

// Start server
httpServer.listen(PORT, () => console.log(`Listening on ${PORT}`))
