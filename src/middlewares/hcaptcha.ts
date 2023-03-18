import https from 'https'
import dotenv from 'dotenv'
import { RequestHandler } from 'express'

dotenv.config()
const { HCAPTCHA_SECRET } = process.env

class Captcha {
  public static verify: RequestHandler = (req, res, next) => {
    const { captcha } = req.body
    if (!captcha) return res.sendStatus(422)
    const captchaData = `secret=${HCAPTCHA_SECRET}&response=${captcha}`
    const captchaReq = https.request(
      {
        hostname: 'hcaptcha.com',
        path: `/siteverify?${captchaData}`,
        method: 'POST',
      },
      captchaRes => {
        if (captchaRes.statusCode !== 200) return res.sendStatus(500)
        captchaRes.on('data', data => {
          const captchaResJson = JSON.parse(data)
          if (!captchaResJson.success) return res.sendStatus(422)
          next()
        })
      }
    )
    captchaReq.on('error', _ => res.sendStatus(500))
    captchaReq.write('')
    captchaReq.end()
  }
}

export default Captcha
