import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load env variables
dotenv.config()
const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_NAME,
} = process.env

class DB {
  public static connect = () => {
    const dbUri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`
    mongoose.set('strictQuery', false).connect(dbUri).catch((err) => {
      console.error(`Error connecting to the database. \n${err}`)
    })
  }
}

export default DB
