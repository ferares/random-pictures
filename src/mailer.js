const nodemailer = require('nodemailer')

require('dotenv').config()
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_TO,
  DEBUG,
} = process.env

// SMTP Server
const mailer = nodemailer.createTransport(
  {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: 1,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    logger: false,
    debug: DEBUG,
  },
  {
    to: SMTP_TO,
  },
)

module.exports = mailer
