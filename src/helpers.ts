import dotenv from 'dotenv'

import { IPicture } from './models/Picture'

// Load env variables
dotenv.config()
const { PICTURES_FOLDER, PICTURES_URL } = process.env

function getPictureName(picture: IPicture): string {
  return `${picture._id}.webp`
}

function getPicturePath(picture: IPicture): string {
  return `${PICTURES_FOLDER}/${getPictureName(picture)}`
}

function getPictureUrl(picture: IPicture): string {
  return `${PICTURES_URL}/${getPictureName(picture)}`
}

export {
  getPictureName,
  getPicturePath,
  getPictureUrl,
}
