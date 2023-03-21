import { Request, RequestHandler } from 'express'
import { FileFilterCallback } from 'multer'
import sharp from 'sharp'

class Uploads {
  public static imageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|webp|WEBP)$/)) {
      return cb(new Error('Only image files are allowed!'))
    }
    cb(null, true)
  }
  
  public static resizeImages: RequestHandler = (req, res, next) => {
    if ((!req.files) || (!req.files.length) || (!req.body)) return next()
    const promises: Promise<Buffer>[] = []
    const files = (req.files as Express.Multer.File[])
    files.map((file: Express.Multer.File) => {
      promises.push(
        sharp(file.buffer).resize(1500).webp({}).toBuffer()
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
}


export default Uploads
