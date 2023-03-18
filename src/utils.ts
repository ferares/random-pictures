import dotenv from 'dotenv'

import { IPicture } from './models/Picture'

// Load env variables
dotenv.config()
const { SSH_FOLDER, PICTURES_HOST } = process.env

function getPictureName(picture: IPicture): string {
  return `${picture._id}.webp`
}

function getPicturePath(picture: IPicture): string {
  return `${SSH_FOLDER}/${getPictureName(picture)}`
}

function getPictureUrl(picture: IPicture): string {
  return `${PICTURES_HOST}/${getPictureName(picture)}`
}

export {
  getPictureName,
  getPicturePath,
  getPictureUrl,
}
