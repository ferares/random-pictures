const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const ssh = require('ssh2')

// Utils
const { getPictureUrl, getPicturePath } = require('./utils')

// Middlewares
const { upload, resizeImages } = require('./middlewares/uploads')
const { hcaptcha } = require('./middlewares/hcaptcha')

// Models
const Picture = require('./models/Picture')

// Load env variables
require('dotenv').config()
const {
  PORT,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_NAME,
  SSH_HOST,
  SSH_PORT,
  SSH_USER,
  SSH_PASS,
  ADMIN_PASSWORD,
} = process.env

const dbUri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`
const connectionParams={
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect(dbUri, connectionParams).catch((err) => {
  console.error(`Error connecting to the database. \n${err}`)
})

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

httpServer.get('/random', (req, res, next) => {
  Picture.estimatedDocumentCount().exec((error, count) => {
    if (error) return next(error)
    const random = Math.floor(Math.random() * count)
    Picture.findOne({ approved: true }).skip(random).lean().exec((error, picture) => {
      if (error) return next(error)
      if (!picture) return next()
      res.send({
        ...picture,
        picture: getPictureUrl(picture),
      })
    })
  })
})

// httpServer.get('/all', (req, res, next) => {
//   Picture.find({ }).lean().exec((error, pictures) => {
//     if (error) return next(error)
//     res.render('all', {
//       pictures: pictures.map((picture) => {
//         return {
//           ...picture,
//           url: getPictureUrl(picture),
//         }
//       })
//     })
//   })
// })
//
// httpServer.get('/admin', (req, res, next) => {
//   Picture.find({ approved: false }).lean().exec((error, pictures) => {
//     if (error) return next(error)
//     res.render('admin', {
//       pictures: pictures.map((picture) => {
//         return {
//           ...picture,
//           url: getPictureUrl(picture),
//         }
//       })
//     })
//   })
// })
//
// httpServer.post('/admin', (req, res, next) => {
//   const { password } = req.body
//   if ((!password) || (password !== ADMIN_PASSWORD)) return res.sendStatus(422)
//   Picture.find({ approved: false }).exec((error, pictures) => {
//     if (error) return next(error)
//     const promises = []
//     const approved = req.body.approved || []
//     for (const picture of pictures) {
//       if (approved.includes(picture._id.toString())) {
//         picture.approved = true
//         promises.push(picture.save())
//       } else {
//         promises.push(Picture.deleteOne({ _id: picture._id }))
//       }
//     }
//     Promise.all(promises).then(() => res.redirect('admin')).catch(next)
//   })
// })

httpServer.post(
  '/new',
  upload.array('pictures[]'),
  resizeImages,
  hcaptcha,
  (req, res, next) => {
    if (req.fileValidationError) return next(req.fileValidationError)
    const { name, link, location, pictures } = req.body
    if ((!location) || (!pictures) || (!pictures.length)) return res.sendStatus(422)
    const promises = []
    for (const picture of pictures) {
      const pic = new Picture({ user: { name, link }, location })
      promises.push(pic.save().then((pic) => {
        return { path: getPicturePath(pic), data: picture }
      }))
    }
    Promise.all(promises).then((pictures) => {
      const sshClient = new ssh.Client()
      sshClient.on('ready', () => {
        sshClient.sftp((error, sftp) => {
          if (error) return next(error)
          const promises = []
          for (const picture of pictures) {
            const writeStream = sftp.createWriteStream(picture.path)
            writeStream.on('error', next)
            promises.push(new Promise((resolve, reject) => {
              writeStream.write(picture.data, (error) => {
                if (error) reject(error)
                resolve()
              })
            }))
          }
          Promise.all(promises).then(() => {
            sshClient.end()
            return res.json({ success: true })
          }).catch(next)
        })
      }).on('error', next).connect({
        host: SSH_HOST,
        port: SSH_PORT,
        username: SSH_USER,
        password: SSH_PASS,
      })
    }).catch(next)
  }
)

// Start server
httpServer.listen(PORT, () => console.log(`Listening on ${PORT}`))
