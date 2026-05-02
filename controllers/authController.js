const User = require("../models/User");
const bcrypt = require("bcrypt");


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing user
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


// ================= LOGIN (USER) =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Wrong password");

    // 🔥 REGENERATE SESSION (CRITICAL FIX)
    req.session.regenerate(err => {
      if (err) {
        console.log(err);
        return res.send("Session error");
      }

      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      // Role-based redirect
      if (user.role === "owner") {
        return res.redirect("/rentals/owner/dashboard");
      }

      if (user.role === "tenant") {
        return res.redirect("/rentals");
      }

      res.redirect("/rentals");
    });

  } catch (err) {
    console.error(err);
    res.send("Login failed");
  }
};

// ================= ADMIN LOGIN =================
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

    // 🔥 Redirect to admin dashboard
    return res.redirect("/admin/dashboard");
  }

  res.send("Invalid admin credentials");
};


// ================= LOGOUT =================
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);

    res.clearCookie("connect.sid"); // 🔥 REQUIRED
    res.redirect("/login");
  });
};