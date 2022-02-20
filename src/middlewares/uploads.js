const multer = require('multer')
const sharp = require('sharp')

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    req.fileValidationError = 'Only image files are allowed!'
    return cb(new Error('Only image files are allowed!'), false)
  }
  cb(null, true)
}

const upload = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter })
const resizeImages = (req, res, next) => {
  if ((!req.files) || (!req.files.length)) return next()
  const promises = []
  req.body.pictures = []
  req.files.map((file) => {
    promises.push(
      sharp(file.buffer).resize(1500).toFormat('jpeg').jpeg({ quality: 90 }).toBuffer()
    )
  })
  Promise.all(promises).then((buffers) => {
    for (const buffer of buffers) {
      req.body.pictures.push(buffer)
    }
    next()
  }).catch(next)
}

module.exports = {
  upload,
  resizeImages,
}
