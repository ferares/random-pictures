import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_TO,
  DEBUG,
} = process.env

// SMTP Server
const debug = (DEBUG || '').toLowerCase() === 'true'
const mailer = nodemailer.createTransport(
  {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    logger: false,
    debug,
  },
  {
    to: SMTP_TO,
  },
)

export default mailer
