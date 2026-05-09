const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const Rental = require("../models/Rental");

const { isLoggedIn } = require("../middleware/auth");


// Chat page
router.get("/:rentalId", isLoggedIn, async (req, res) => {

  const rental = await Rental.findById(req.params.rentalId)
    .populate("owner");

  const messages = await Message.find({
    rental: rental._id
  })
  .populate("sender")
  .sort({ createdAt: 1 });

  res.render("chat/chatRoom", {
    rental,
    messages,
    currentUser: req.session.user
  });

});

router.post("/save", isLoggedIn, async (req, res) => {

  await Message.create(req.body);

  res.json({ success: true });

});

module.exports = router;