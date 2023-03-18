import { RequestHandler } from 'express'
import { writeFile } from 'fs'
import dotenv from 'dotenv'

// Models
import { Picture } from '../models/Picture'

// Mailer
import mailer from '../services/mailer'

// Utils
import { getPictureUrl, getPicturePath } from '../helpers'

// Load env variables
dotenv.config()
const { SMTP_FROM } = process.env

class PicturesController {
  public static random: RequestHandler = (req, res, next) => {
    Picture.estimatedDocumentCount().exec().then(((count) => {
      const random = Math.floor(Math.random() * count)
      Picture.findOne({ approved: true }).skip(random).lean().exec().then((picture) => {
        if (!picture) return next()
        res.send({
          ...picture,
          picture: getPictureUrl(picture),
        })
      }).catch(next)
    })).catch(next)
  }

  public static all: RequestHandler = (req, res, next) => {
    Picture.find({ }).lean().exec().then((pictures) => {
      res.render('all', {
        pictures: pictures.map((picture) => {
          return {
            ...picture,
            url: getPictureUrl(picture),
          }
        })
      })
    }).catch(next)
  }

  public static post: RequestHandler = (req, res, next) => {
    const { name, link, location, pictures } = req.body
    if ((!location) || (!pictures) || (!pictures.length)) return res.sendStatus(422)
    const promises: Promise<any>[] = []
    for (const picture of pictures) {
      const pic = new Picture({ user: { name, link }, location })
      promises.push(pic.save().then((pic) => {
        return { path: getPicturePath(pic), data: picture }
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
