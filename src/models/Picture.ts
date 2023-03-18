import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { rmSync } from 'fs'

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

pictureSchema.pre('deleteOne', async function() {
  const picture = await this.model.findOne(this.getQuery())
  rmSync(getPicturePath(picture))
})

const Picture = mongoose.model<IPicture>('picture', pictureSchema)

export { IPicture, Picture }
