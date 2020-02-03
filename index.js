const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const {
  addUser,
  disconnectUser,
  getUser,
  getUsersInRoom,
  usersExcept,
  userInRoom
} = require('./users')

const { addMessage, getMessages } = require('./messages')

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

function Message (user, text) {
  return {
    timestamp: Date.now(),
    user: user,
    text: text,
  }
}

io.on('connection', (socket) => {
  console.log('New connection')
  socket.on('join', ({profile, room = 'lobby'}) => {

    const {id, name, picture} = profile    
    //if(error) return cb(error)
    if(!userInRoom(id, 'lobby')) {
      const {error, user} = addUser({
        socketId: socket.id,
        id,
        name,
        picture,
        room
      })

      socket.join(room)
      socket.broadcast.to(room)
        .emit('NEW_CONNECTION', {id, name, picture})
      socket.emit('message', new Message('BattleChat', `${profile.name}, Welcome to BattleChat`))
      console.log(`${profile.name} (${profile.id}) joined room:"${room}" on socket ${socket.id}`)
      socket.broadcast.to(room)
        .emit('message', new Message('BattleChat', `${profile.name}, has joined`))
    } else {
      socket.emit('PREV_MESSAGES', getMessages())
    }
    socket.emit('USERS_LIST', usersExcept(id))
    console.log('**************')
  })

  socket.on('sendMessage', (id, message, room, cb) => {
    const user = getUser(id)
    const newMessage = new Message (user.name, message)
    io.to(room).emit('message', newMessage)
    addMessage(newMessage)

    if(cb){
      cb()
    }
  })

  socket.on('leave', ({id}) => {
    const user = getUser(id)
    disconnectUser(id, socket.id, () => {
      socket.broadcast.to('lobby').emit('USER_DISCONNECTED', {id})
      socket.broadcast.to('lobby').emit('message', new Message('BattleChat', `${user.name} left`))
      console.log('Leave**************')
    })
  })
})

app.use(router)
server.listen(PORT, () => {
  console.log(`Chat server running on port:${PORT}`)
})