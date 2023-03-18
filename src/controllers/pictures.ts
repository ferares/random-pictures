import { RequestHandler } from 'express'
import ssh from 'ssh2'
import dotenv from 'dotenv'

// Models
import { Picture } from '../models/Picture'

// Mailer
import mailer from '../mailer'

// Utils
import { getPictureUrl, getPicturePath } from '../utils'

// Load env variables
dotenv.config()
const {
  SSH_HOST,
  SSH_PORT,
  SSH_USER,
  SSH_PASS,
  SMTP_FROM,
} = process.env

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
      const sshClient = new ssh.Client()
      sshClient.on('ready', () => {
        sshClient.sftp((error, sftp) => {
          if (error) return next(error)
          const promises: Promise<void>[] = []
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
        port: Number(SSH_PORT) || 22,
        username: SSH_USER,
        password: SSH_PASS,
      })
    }).catch(next)
  }
}

export default PicturesController
