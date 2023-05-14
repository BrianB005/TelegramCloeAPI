require("dotenv").config();
require("express-async-errors");
const http = require("http");
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const connectDB = require("./db/connect");
const server = http.createServer(app);

const socketIO = require("socket.io");
const io = socketIO(server);
const morgan = require("morgan");

const User = require("./models/User");
const Message = require("./models/Message");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");

const authRouter = require("./routes/authRoutes");
const channelsRouter = require("./routes/channelRoutes");
const usersRouter = require("./routes/userRoutes");
const messagesRouter = require("./routes/messageRoutes");
const postsRouter = require("./routes/channelPostRoutes");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(morgan("tiny"));

app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/channels", channelsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/messages", messagesRouter);
app.use("/api/v1/posts", postsRouter);

io.on("connection", (socket) => {
  socket.on("userConnected", async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { online: true });
      socket.userId = userId;
      io.emit("userOnline", userId);
      console.log(`User with ID ${userId} just joined`);
    } catch (error) {
      console.error("Error updating user online status:", error);
    }
  });
  socket.on("newMessage", async (message) => {
    socket.join(socket.id);

    Message.create(message)
      .then((createdMessage) => {
        return createdMessage.populate("sender recipient", {
          online: 1,
          lastSeen: 1,
          _id: 1,
          phoneNumber: 1,
          profilePic: 1,
          username: 1,
        });
      })
      .then((populatedMsg) => {
        io.to(socket.id).emit("messageReceived", populatedMsg);
        io.to(getRecipientSocketId(message.recipient)).emit(
          `messageReceived`,
          populatedMsg
        );
      });
  });

  socket.on("disconnect", async () => {
    const user = await User.findById(socket.userId);
    console.log(`User with ID ${socket.userId} just left`);
    if (user) {
      await user.updateOne({ online: false, lastSeen: Date.now() });
      io.emit("userOffline", socket.userId);
    }
  });
});
// error middlewares
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, () => {
      console.log(`Server is currently listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
const getRecipientSocketId = (recipientUserId) => {
  for (const [socketId, socket] of io.sockets.sockets) {
    if (socket.userId === recipientUserId) {
      return socketId;
    }
  }

  return null;
};

start();
