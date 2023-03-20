import { RequestHandler } from 'express'
import { writeFile } from 'fs'
import dotenv from 'dotenv'

// Models
import Picture from '../models/Picture'

// Mailer
import mailer from '../services/mailer'

// Load env variables
dotenv.config()
const { SMTP_FROM, HCAPTCHA_SITE_KEY } = process.env

class PicturesController {
  public static random: RequestHandler = (req, res, next) => {
    Picture.estimatedDocumentCount().exec().then(((count) => {
      const random = Math.floor(Math.random() * count)
      Picture.findOne({ approved: true }).skip(random).exec().then((picture) => {
        if (!picture) return next()
        res.send({
          author: picture.author,
          location: picture.location,
          url: picture.getPictureUrl(),
        })
      }).catch(next)
    })).catch(next)
  }

  public static all: RequestHandler = (req, res, next) => {
    Picture.find({ approved: true }).exec().then((pictures) => {
      res.render('all', {
        pictures: pictures.map((picture) => {
          return {
            author: picture.author,
            location: picture.location,
            url: picture.getPictureUrl(),
          }
        })
      })
    }).catch(next)
  }

  public static uploadForm: RequestHandler = (req, res, next) => {
    const hcaptchaSiteKey = HCAPTCHA_SITE_KEY
    res.render('upload', { hcaptchaSiteKey })
  }

  public static uploadPost: RequestHandler = (req, res, next) => {
    const { name, link, location, pictures } = req.body
    if ((!location) || (!pictures) || (!pictures.length)) return res.sendStatus(422)
    const promises: Promise<any>[] = []
    for (const picture of pictures) {
      const pic = new Picture({ author: { name, link }, location })
      promises.push(pic.save().then((pic) => {
        return { path: pic.getPicturePath(), data: picture }
      }))
    }
    Promise.all(promises).then((pictures) => {
      const promises: Promise<void>[] = []
      for (const picture of pictures) {
        promises.push(new Promise((resolve, reject) => {
          writeFile(picture.path, picture.data, (err) => {
            if (err) return reject(err)
            resolve()
          })
        }))
      }
      Promise.all(promises).then(() => {
        mailer.sendMail({
          from: SMTP_FROM,
          subject: 'Nuevas fotos',
          text: 'Nuevas fotos pendientes de revisión.',
        }, error => {
          if (error) return next(error)
          return res.json({ success: true })
        })
      }).catch(next)
    }).catch(next)
  }
}

export default PicturesController
