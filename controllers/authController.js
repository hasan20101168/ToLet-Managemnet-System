const User = require("../models/User");
const bcrypt = require("bcrypt");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.send("Email already registered");

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role
    });

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("Registration failed");
  }
};

// LOGIN (User)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Wrong password");

    req.session.user = user;

    res.redirect("/rentals");
  } catch (err) {
    console.error(err);
    res.send("Login failed");
  }
};

// ADMIN LOGIN
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.user = {
      role: "admin",
      email
    };

    return res.redirect("/rentals"); // better than /admin (unless you have that route)
  }

  res.send("Invalid admin credentials");
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};