const mongoose = require('mongoose')

const pictureSchema = new mongoose.Schema({
  user: {
    name: String,
    link: String,
  },
  location: String,
  picture: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true })

module.exports = mongoose.model('Picture', pictureSchema)
