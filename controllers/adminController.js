const User = require("../models/User");
const Rental = require("../models/Rental");

exports.adminDashboard = async (req, res) => {
  const users = await User.find();
  const rentals = await Rental.find();

  res.render("dashboard/admin", { users, rentals });
};