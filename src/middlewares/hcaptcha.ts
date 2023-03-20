import https from 'https'
import dotenv from 'dotenv'
import { RequestHandler } from 'express'

dotenv.config()
const { HCAPTCHA_SECRET } = process.env

class Captcha {
  public static verify: RequestHandler = (req, res, next) => {
    const { 'h-captcha-response': response } = req.body
    if (!response) return res.sendStatus(422)
    const captchaData = (new URLSearchParams({ secret: HCAPTCHA_SECRET, response } as any)).toString()
    const captchaReq = https.request(
      {
        hostname: 'hcaptcha.com',
        path: '/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(captchaData),
        }
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
    captchaReq.write(captchaData)
    captchaReq.end()
  }
}

export default Captcha
