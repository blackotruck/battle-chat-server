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
    console.log(`${users[id].name} is leaving`)
    delete users[id]
    console.log(users)
  }
}

const usersExcept = (id) => {
  const filteredUsers = {...users}
  delete filteredUsers[id]
  return filteredUsers
}

const disconnectUser =(id, socketId) => {
  console.log('Disconnect ', socketId)
  console.log(id)
  if(users[id]) {
    console.log(`Disconnecting ${users[id].name} on socket ${socketId}`)
    users[id].sockets = users[id].sockets.filter(ids => ids !== socketId)
    console.log(users[id])
    if(users[id].sockets.length == 0) {
      removeUser(id)
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