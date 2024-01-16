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
import tweetRouter from './routes/tweet.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import commentRouter from './routes/comment.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'

app.use('/api/v1/users' , router)
app.use('/api/v1/videos' , videoRouter)
app.use('/api/v1/tweets' , tweetRouter)
app.use('/api/v1/playlist' ,  playlistRouter)
app.use('/api/v1/comments' , commentRouter)
app.use('/api/v1/dashboard', dashboardRouter)

export {app}