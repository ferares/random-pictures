// Load env variables
require('dotenv').config()
const { SSH_FOLDER, PICTURES_HOST } = process.env

function getPictureName(picture) {
  return `${picture._id}.jpg`
}

function getPicturePath(picture) {
  return `${SSH_FOLDER}/${getPictureName(picture)}`
}

function getPictureUrl(picture) {
  return `${PICTURES_HOST}/${getPictureName(picture)}`
}

module.exports = {
  getPictureName,
  getPicturePath,
  getPictureUrl,
}
