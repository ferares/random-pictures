// Models
const Picture = require('../models/Picture')

// Utils
const { getPictureUrl } = require('../utils')

// Load env variables
require('dotenv').config()
const { ADMIN_PASSWORD } = process.env

const get = (req, res, next) => {
  Picture.find({ approved: false }).lean().exec((error, pictures) => {
    if (error) return next(error)
    res.render('admin', {
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
  const { password } = req.body
  if ((!password) || (password !== ADMIN_PASSWORD)) return res.sendStatus(422)
  Picture.find({ approved: false }).exec((error, pictures) => {
    if (error) return next(error)
    const promises = []
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
  })
}

module.exports = { get, post }
