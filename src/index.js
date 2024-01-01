import dotenv from 'dotenv'
import connetDb from './db/index.js'

dotenv.config({
    path :"./.env"
})


connetDb()