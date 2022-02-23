const mongoose = require('mongoose')

// Load env variables
require('dotenv').config()
const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_NAME,
} = process.env

const connect = () => {
  const dbUri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`
  const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  mongoose.connect(dbUri, connectionParams).catch((err) => {
    console.error(`Error connecting to the database. \n${err}`)
  })
}

module.exports = { connect }
