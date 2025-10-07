import { RequestHandler } from 'express'
import dotenv from 'dotenv'

// Models
import Picture from '../models/Picture'

// Load env variables
dotenv.config({ quiet: true })
const { ADMIN_PASSWORD } = process.env

class AdminController {
  public static get: RequestHandler = (req, res, next) => {
    Picture.find({ approved: false }).exec().then((pictures) => {
      res.render('admin', {
        pictures: pictures.map((picture) => {
          return {
            id: picture._id,
            author: picture.author,
            location: picture.location,
            url: picture.getPictureUrl(),
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
          const location = req.body.location?.[picture._id.toString()]
          const author = req.body.author?.[picture._id.toString()]
          const link = req.body.link?.[picture._id.toString()]
          if (location) picture.location = location
          if (author) picture.author.name = author
          if (link) picture.author.link = link
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
