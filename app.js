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

// ================= DATABASE =================

const dbUrl = process.env.DB_URL;
// local db: "mongodb://127.0.0.1:27017/toletDB"

mongoose.connect(dbUrl)
.then(() => {
  console.log("MongoDB Atlas Connected");
})
.catch((err) => {
  console.log("DB Error:", err);
});

// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= SESSION =================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET
  },
  touchAfter: 24 * 3600
});

store.on("error", () => {
  console.log("Mongo Session Store Error");
});

app.use(session({
  secret: process.env.SESSION_SECRET || "secretkey",
  resave: false,
  saveUninitialized: false,
  store: store, // ✅ reuse the store created above
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  }
}));

// ================= GLOBAL USER =================

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

// ================= VIEW ENGINE =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= ROUTES =================

app.use("/", authRoutes);
app.use("/rentals", rentalRoutes);
app.use("/", adminRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", messageRoutes);

// ================= ROOT =================

app.get("/", (req, res) => {
  res.redirect("/rentals");
});

// ================= SOCKET.IO =================

io.on("connection", (socket) => {

  socket.on("join", (userId) => {
    socket.join(userId);
  });

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

      io.to(data.receiverId).emit("receiveMessage", populated);

      io.to(data.senderId).emit("receiveMessage", populated);

    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    // disconnected
  });
});

// ================= ERROR =================

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ================= SERVER =================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});