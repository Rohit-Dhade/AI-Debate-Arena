import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

/**
 * Determine which model should respond next based on message history
 * @param {Array} messages - Previous messages in the debate
 * @returns {String} 'aggressive' or 'sarcastic'
 */
const getNextModel = (messages) => {
  // Count AI responses from each model
  const aggressiveCount = messages.filter((m) => m.writtenBy === "aggressive").length;
  const sarcasticCount = messages.filter((m) => m.writtenBy === "sarcastic").length;

  // Alternate: if equal, start with aggressive; if aggressive has more, use sarcastic
  return aggressiveCount > sarcasticCount ? "sarcastic" : "aggressive";
};

export const setTopic = async (req, res) => {
  const { DetailedTopic, chat: chatId } = req.body;

  let topic = null,
    chat = null;

  if (!chatId) {
    topic = await generateChatTitle(DetailedTopic);
    chat = await chatModel.create({
      user: req.user.id,
      topic,
    });
  }

  const userMessage = await messageModel.create({
    chat: chatId || chat._id,
    content: DetailedTopic,
    writtenBy: "user",
  });

  res.status(200).json({
    success: true,
    chat: chat || { _id: chatId },
    userMessage,
  });
};

export const DebateMessages = async (req, res) => {
  try {
    const { topic, chat: chatId } = req.body;

    if (!chatId && !topic) {
      return res.status(400).json({
        success: false,
        message: "Topic or chat ID is required",
      });
    }

    let chat = null;

    if (!chatId) {
      const generatedTitle = await generateChatTitle(topic);
      chat = await chatModel.create({
        user: req.user.id,
        topic: generatedTitle,
      });
    }

    const actualChatId = chatId || chat._id;

    // Get all messages for this chat
    const allMessages = await messageModel.find({ chat: actualChatId });

    // Determine which model should respond next
    const nextModel = getNextModel(allMessages);

    // Generate response from the appropriate model
    const aiResponse = await generateResponse(
      nextModel,
      topic || (chat ? chat.topic : ""),
      allMessages
    );

    // Store the AI response
    const aiMessage = await messageModel.create({
      chat: actualChatId,
      content: aiResponse,
      writtenBy: nextModel,
    });

    res.status(200).json({
      success: true,
      message: aiResponse,
      model: nextModel,
      aiMessage,
      chat: chat || { _id: chatId },
    });
  } catch (error) {
    console.error("Error in DebateMessages:", error);
    res.status(500).json({
      success: false,
      message: "Error generating debate response",
      error: error.message,
    });
  }
};

export const getChats = async (req, res) => {
  const user = req.user;

  const chats = await chatModel.find({ user: user.id });

  res.status(200).json({
    message: "Chats retrieved Successfully",
    chats,
  });
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  const messages = await messageModel.find({
    chat: chatId,
  });

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages,
  });
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  await messageModel.deleteMany({
    chat: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  res.status(200).json({
    message: "Chat deleted Successfully",
  });
};
