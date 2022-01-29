const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

// Storage & processing for photos
const { upload, resizeImages } = require('./middlewares/uploads')

// Models
const Picture = require('./models/Picture')

// Load env variables
require('dotenv').config()
const {
  PORT,
  DB_USER,
  DB_PASS,
  DB_URL,
  DB_NAME,
} = process.env

const dbUri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority`
const connectionParams={
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect(dbUri, connectionParams).catch((err) => {
  console.error(`Error connecting to the database. \n${err}`)
})

// Server
const httpServer = express()

// Body parser
httpServer.use(bodyParser.urlencoded({ extended: true }))
httpServer.use(bodyParser.json())

// CORS
httpServer.use(cors())

const getRandom = (req, res, next) => {
  Picture.estimatedDocumentCount().exec((error, count) => {
    if (error) return next(error)
    const random = Math.floor(Math.random() * count)
    Picture.findOne().skip(random).lean().exec((error, picture) => {
      if (error) return next(error)
      req.randomPicture = picture
      next()
    })
  })
}

httpServer.get('/random', getRandom, (req, res) => {
  res.send(JSON.stringify(req.randomPicture))
})

// httpServer.get('/random/picture', getRandom, (req, res) => {
//   return res.send(`<meta http-equiv="Refresh" content="0; URL=${req.randomPicture.picture}">`)
// })

// httpServer.get('/new', (req, res, next) => {
//   res.sendFile(path.join(__dirname, 'views/form.html'))
// })

// httpServer.post(
//   '/new',
//   upload.single('picture'),
//   resizeImages,
//   (req, res, next) => {
//     if (req.fileValidationError) return next(req.fileValidationError)
//     const { name, link, location, picture } = req.body
//     if (!picture) return res.sendStatus(422)
//     const pic = new Picture({ user: { name, link }, location, picture })
//     pic.save((error, picture) => {
//       if (error) return next(error)
//       return res.sendFile(path.join(__dirname, 'views/form.html'))
//     })
//   }
// )

// Start server
httpServer.listen(PORT, () => console.log(`Listening on ${PORT}`))
