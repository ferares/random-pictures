const mongoose = require('mongoose')
const ssh = require('ssh2')

// Utils
const { getPicturePath } = require('../utils')

// Load env variables
require('dotenv').config()
const {
  SSH_HOST,
  SSH_PORT,
  SSH_USER,
  SSH_PASS,
} = process.env

const pictureSchema = new mongoose.Schema({
  user: {
    name: String,
    link: String,
  },
  location: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
}, { timestamps: true })

pictureSchema.pre('deleteOne', async function(next) {
  const picture = { _id: this._conditions._id.toString() }
  const sshClient = new ssh.Client()
  sshClient.on('ready', () => {
    sshClient.sftp((error, sftp) => {
      if (error) return next(error)
      sftp.unlink(getPicturePath(picture), (error) => {
        if (error) return next(error)
        next()
      })
    })
  }).on('error', next).connect({
    host: SSH_HOST,
    port: SSH_PORT,
    username: SSH_USER,
    password: SSH_PASS,
  })
})

module.exports = mongoose.model('Picture', pictureSchema)
