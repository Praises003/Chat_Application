const express = require('express')
const dotenv = require("dotenv")
const http = require("http")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const { Server } = require("socket.io")
const {notFound, errorHandler} = require('./middleware/error')
dotenv.config()
const connectDb = require('./config/db')
const fileUpload = require("express-fileupload")
const userRoute = require("./routes/userRoute")
const chatRoute = require("./routes/chatRoute")
const messageRoute = require("./routes/messageRoute")
const uploadRoute = require("./routes/uploadRoute")
const testRoute = require("./routes/testRoute")
const { deleteUpload } = require('./controllers/deleteUploadController')



connectDb()

const allowedOrigins = ['http://localhost:3000', 'https://chat-app-frontend-b4kq.onrender.com'];

const corsOptions = {
    origin: ['http://localhost:3000', 'https://chat-app-frontend-b4kq.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
  };
  


const app = express()
app.use(cors(corsOptions))
// app.options('*', cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",

}))
app.use(cookieParser())
app.use('/api/user', userRoute)
app.use('/api/chat', chatRoute)
app.use('/api/message', messageRoute)
app.use('/', testRoute)
app.use('/api/upload', uploadRoute)
app.use('/api/destroy', deleteUpload)
app.get('/', (req, res) => {

    res.send("Hello World")
})


const PORT = process.env.PORT || 5000
app.use(notFound)
app.use(errorHandler)
const server = http.createServer(app)
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log(socket.id)

    socket.on("initt", (userData) => {
        if(!userData) {console.log("no user")} else {socket.join(userData._id)}
        socket.emit("connected");
        if(!userData){console.log("no id")} else {console.log(userData._id)}
    })

    socket.on("join_chat", (room) => {
        socket.join(room)
        console.log(`User Joined Room: ${room}`)
    })

    socket.on("new_message", (newMessage) => {
        console.log(newMessage)
        let chat  = newMessage.chat

        if(!chat.users) return console.log("users undefined")

        chat.users.forEach(user => {
            if(user._id === newMessage.sender._id) return
            console.log(user._id)
            socket.in(user._id).emit("message_received", newMessage)
        })
    })

    socket.on("disconnect", () => {
        console.log("User disconnected")
    })
})

//  app.listen(PORT, (req, res) => {
//      console.log(`Listening on port ${PORT}`)
    
// })
server.listen(PORT, (req, res) => {
       console.log(`Listening on port ${PORT}`)
        
     })