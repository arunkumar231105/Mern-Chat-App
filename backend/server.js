const express = require('express');
const dotenv = require('dotenv');
const { chats } = require("./data/data");
const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const messageRoutes = require('./routes/messageRoutes');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // to support JSON-encoded bodies


app.get('/', (req, res) => {
  res.send('API is running Sussessfully');
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/message", messageRoutes);

// -------------Depoloyment----------------

// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname1, '/frontend/build')));
  
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname1, 'frontend', 'build', 'index.html'));

//   });

// }  else { 
//   app.get('/', (req, res) => {
//     res.send("API is running Sussessfully");
//   });
//   }

  

// -------------Depoloyment----------------

app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT || 5000;

const servser = app.listen(5000, console.log('Server is running on port 5000'));

const io = require('socket.io')(servser, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});


io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('Connected');
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieve) => {
    var chat = newMessageRecieve.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach(user => {
      if (user._id == newMessageRecieve.sender._id) return;
      socket.in(user._id).emit('message recieved', newMessageRecieve);
    });
  });
  
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

