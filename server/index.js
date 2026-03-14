const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

const rooms = new Map()

app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size })
})

io.on('connection', (socket) => {
  socket.on('disconnect', () => {})
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {})
