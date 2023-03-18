import mongoose from 'mongoose'
import ssh from 'ssh2'
import dotenv from 'dotenv'

// Utils
import { getPicturePath } from '../helpers'


// Load env variables
dotenv.config()
const {
  SSH_HOST,
  SSH_PORT,
  SSH_USER,
  SSH_PASS,
} = process.env

interface IPicture extends mongoose.Document {
  user: { name: string, link: string }
  location: string
  approved: boolean
}

const pictureSchema = new mongoose.Schema<IPicture>({
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
  const picture = await this.model.findOne(this.getQuery())
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
    port: Number(SSH_PORT) || 22,
    username: SSH_USER,
    password: SSH_PASS,
  })
})

const Picture = mongoose.model<IPicture>('picture', pictureSchema)

export { IPicture, Picture }
