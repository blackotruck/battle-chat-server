const users = {}

const userInRoom = (id, room) =>
  users[id] && users[id].rooms.includes(room)

const addUser = ({socketId, id, name, picture, room }) => {
  const existingUser = userInRoom(id, room)

  if(existingUser) {
    return {error: 'User already in Room'}
  }
  if(users[id]) {
    users[id].rooms.push(room)
    users[id].sockets.push(socketId)
  } else {
    users[id] = {name, picture, id, rooms: [room], sockets: [socketId]}
  }

  return { user: users[id] }
}

const removeUser = (id) => {
  if(users[id]) { 
    delete users[id]
  }
}

const usersExcept = (id) => {
  const filteredUsers = {...users}
  delete filteredUsers[id]
  return filteredUsers
}

const disconnectUser =(id, socketId, cb) => {
  console.log(`Disconnecting ${users[id].name} on socket ${socketId}`)
  if(users[id]) {
    users[id].sockets = users[id].sockets.filter(ids => ids !== socketId)
    if(users[id].sockets.length == 0) {
      console.log(`${users[id].name} Disconnected`)
      removeUser(id)
      console.log(Object.keys(users))
      cb()
    }
  }
}

const getUser = id => users[id]

const getUsersInRoom = room =>
  Object.keys(users).filter(id => users[id].rooms.includes(room))

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  usersExcept,
  disconnectUser,
  userInRoom
}