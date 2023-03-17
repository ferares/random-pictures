// Models
const Picture = require('../models/Picture')

// Utils
const { getPictureUrl } = require('../utils')

// Load env variables
require('dotenv').config()
const { ADMIN_PASSWORD } = process.env

const get = (req, res, next) => {
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

const post = (req, res, next) => {
  const { password } = req.body
  if ((!password) || (password !== ADMIN_PASSWORD)) return res.sendStatus(422)
  Picture.find({ approved: false }).exec().then((pictures) => {
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
  }).catch(next)
}

module.exports = { get, post }
