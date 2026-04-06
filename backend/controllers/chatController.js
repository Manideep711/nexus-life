import Chat from "../models/Chat.js";

// ✅ Get all chats for logged-in user
export const getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "fullName email isVerified verificationStatus")
      .populate("messages.sender", "fullName email isVerified verificationStatus")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Send message in a chat
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user._id;

    if (!text || !chatId) {
      return res.status(400).json({ message: "Missing chatId or text" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Push message
    const newMessage = {
      sender: senderId,
      text,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Repopulate sender info including verification
    const populatedChat = await Chat.findById(chatId)
      .populate("participants", "fullName email isVerified verificationStatus")
      .populate("messages.sender", "fullName email isVerified verificationStatus");

    // Emit via Socket.IO
    const io = req.app.get("io");
    io.to(chatId).emit("newMessage", populatedChat.messages.at(-1));

    res.status(201).json(populatedChat.messages.at(-1));
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single chat by ID
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId, // ensure authorized access
    })
      .populate("participants", "fullName email isVerified verificationStatus")
      .populate("messages.sender", "fullName email isVerified verificationStatus");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or unauthorized" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: error.message });
  }
};
