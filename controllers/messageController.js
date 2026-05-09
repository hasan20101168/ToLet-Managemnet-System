const Message = require("../models/Message");

// Owner inbox
exports.ownerInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.session.user._id
    })
      .populate("sender", "name")
      .populate("rental", "name")
      .sort({ createdAt: -1 });

    res.render("messages/inbox", { messages });

  } catch (err) {
    console.log(err);
    res.send("Error loading inbox");
  }
};


// Chat room
exports.chatRoom = async (req, res) => {
  try {
    const messages = await Message.find({
      rental: req.params.rentalId,
      $or: [
        { sender: req.session.user._id },
        { receiver: req.session.user._id }
      ]
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.render("messages/chat", {
      messages,
      rentalId: req.params.rentalId,
      receiverId: req.params.receiverId,
      currentUser: req.session.user
    });

  } catch (err) {
    console.log(err);
    res.send("Chat error");
  }
};