require("dotenv").config(); //m.hasan

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const rentalRoutes = require("./routes/rentalRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

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

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/"); // landing page
});

// ================= ERROR =================
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});