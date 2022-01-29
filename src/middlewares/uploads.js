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
  if (!req.file) return next()
  sharp(req.file.buffer).resize(1500).toFormat('jpeg').jpeg({ quality: 90 }).toBuffer((error, buff) => {
    if (error) return next(error)
    req.body.picture = `data:image/jpeg;base64,${buff.toString('base64')}`
    next()
  })
}

module.exports = {
  upload,
  resizeImages,
}
