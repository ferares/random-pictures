import { Request, RequestHandler } from 'express'
import multer, { FileFilterCallback } from 'multer'
import sharp from 'sharp'

const imageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    return cb(new Error('Only image files are allowed!'))
  }
  cb(null, true)
}

const upload = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter })
const resizeImages: RequestHandler = (req, res, next) => {
  if ((!req.files) || (!req.files.length) || (!req.body)) return next()
  const promises: Promise<Buffer>[] = []
  const files = (req.files as Express.Multer.File[])
  files.map((file: Express.Multer.File) => {
    promises.push(
      sharp(file.buffer).resize(1500).toFormat('jpeg').jpeg({ quality: 90 }).toBuffer()
    )
  })
  Promise.all(promises).then((buffers) => {
    const pictures: Buffer[] = []
    for (const buffer of buffers) {
      pictures.push(buffer)
    }
    req.body['pictures'] = pictures
    next()
  }).catch(next)
}

export {
  upload,
  resizeImages,
}
