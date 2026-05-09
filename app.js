require("dotenv").config(); //m.hasan

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const http = require("http");
const { Server } = require("socket.io");

const rentalRoutes = require("./routes/rentalRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const Message = require("./models/Message");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

global.io = io;

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= SESSION =================
app.use(session({
  secret: process.env.SESSION_SECRET || "secretkey",
  resave: false,
  saveUninitialized: false,
  unset: "destroy", // 🔥 ADD THIS
  store: MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/toletDB"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

//  Make user available in all EJS views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= DATABASE =================
mongoose.connect("mongodb://127.0.0.1:27017/toletDB")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("DB Error:", err));

// ================= ROUTES =================
app.use("/", authRoutes);          // auth routes (login/register)
app.use("/rentals", rentalRoutes); // rental routes
app.use("/", adminRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", messageRoutes);

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/"); // landing page
});

// ================= SOCKET.IO =================

io.on("connection", (socket) => {
  // console.log("User connected");

  // Join personal room
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // Send message
  socket.on("sendMessage", async (data) => {
    try {
      const savedMessage = await Message.create({
        rental: data.rentalId,
        sender: data.senderId,
        receiver: data.receiverId,
        text: data.text,
      });

      const populated = await Message.findById(savedMessage._id)
        .populate("sender", "name role")
        .populate("receiver", "name role");

      // send to receiver
      io.to(data.receiverId).emit("receiveMessage", populated);

      // send back to sender
      io.to(data.senderId).emit("receiveMessage", populated);

    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected");
  });
});

// ================= ERROR =================
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ================= SERVER =================
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});