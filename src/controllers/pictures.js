const ssh = require('ssh2')

// Models
const Picture = require('../models/Picture')

// Mailer
const mailer = require('../mailer')

// Utils
const { getPictureUrl, getPicturePath } = require('../utils')

// Load env variables
require('dotenv').config()
const {
  SSH_HOST,
  SSH_PORT,
  SSH_USER,
  SSH_PASS,
  SMTP_FROM,
} = process.env

const random = (req, res, next) => {
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
}

const all = (req, res, next) => {
  Picture.find({ }).lean().exec((error, pictures) => {
    if (error) return next(error)
    res.render('all', {
      pictures: pictures.map((picture) => {
        return {
          ...picture,
          url: getPictureUrl(picture),
        }
      })
    })
  })
}

const post = (req, res, next) => {
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
          mailer.sendMail({
            from: SMTP_FROM,
            subject: 'Nuevas fotos',
            text: 'Nuevas fotos pendientes de revisión.',
          }, error => {
            if (error) return next(error)
            return res.json({ success: true })
          })
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

module.exports = { random, all, post }
