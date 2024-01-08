import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app = express()
app.use(cors({
    origin: `${process.env.CORS_ORIGIN}`
}))


app.use(express.json({limit : '16kb'}))
app.use(express.urlencoded({limit :"16kb" , extended: true}))
app.use(express.static('public'))
app.use(cookieParser())

// import Routes
import router from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'

app.use('/api/v1/users' , router)
app.use('/api/v1/video' , videoRouter)


export {app}