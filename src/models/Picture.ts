import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { rm } from 'fs'
import path from 'path'

// Load env variables
dotenv.config()
const { PICTURES_FOLDER, PICTURES_URL } = process.env

interface IPictureDocument extends mongoose.Document {
  author: { name: string, link: string }
  location: string
  approved: boolean
}

interface IPicture extends IPictureDocument {
  getPictureName(): string
  getPicturePath(): string
  getPictureUrl(): string
}

type PictureModel = mongoose.Model<IPicture>

const pictureSchema = new mongoose.Schema<IPicture, PictureModel>({
  author: {
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

pictureSchema.method('getPictureName', function getPictureName(): string {
  return `${this._id}.webp`
})

pictureSchema.method('getPicturePath', function getPicturePath(): string {
  return path.resolve(PICTURES_FOLDER || '', this.getPictureName())
})

pictureSchema.method('getPictureUrl', function getPictureUrl(): string {
  return `${PICTURES_URL}/${this.getPictureName()}`
})

pictureSchema.pre('deleteOne', async function() {
  const picture = await this.model.findOne(this.getQuery())
  rm(picture.getPicturePath(), () => {})
})

const Picture: PictureModel = mongoose.model<IPicture, PictureModel>('picture', pictureSchema)

export default Picture
