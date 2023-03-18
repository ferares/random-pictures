import { RequestHandler } from 'express'
import dotenv from 'dotenv'

// Models
import { Picture } from '../models/Picture'

// Utils
import { getPictureUrl } from '../helpers'

// Load env variables
dotenv.config()
const { ADMIN_PASSWORD } = process.env

class AdminController {
  public static get: RequestHandler = (req, res, next) => {
    Picture.find({ approved: false }).lean().exec().then((pictures) => {
      res.render('admin', {
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
    const { password } = req.body
    if ((!password) || (password !== ADMIN_PASSWORD)) return res.sendStatus(422)
    Picture.find({ approved: false }).exec().then((pictures) => {
      const promises: Promise<any>[] = []
      const approved = req.body.approved || []
      for (const picture of pictures) {
        if (approved.includes(picture._id.toString())) {
          picture.approved = true
          promises.push(picture.save())
        } else {
          promises.push(Picture.deleteOne({ _id: picture._id }))
        }
      }
      Promise.all(promises).then(() => res.redirect('admin')).catch(next)
    }).catch(next)
}

}

export default AdminController
