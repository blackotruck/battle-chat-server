const messages = []

const addMessage = (message) => messages.push(message)
const getMessages = () => messages

module.exports = {
  addMessage,
  getMessages
}