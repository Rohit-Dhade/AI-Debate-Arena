import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { HumanMessage } from "langchain";

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

  // const messages = await messageModel.find({ chat: chatId || chat._id });

  // const aiResponse = await generateResponse(messages);

  // const aiMessage = await messageModel.create({
  //   chat: chatId || chat._id,
  //   content: aiResponse,
  //   role: "ai",
  // });

  // console.log(messages);

  res.status(200).json({
    success: true,
    // message: aiResponse,
    // title: title,
    // chat,
    // aiMessage,
    // userMessage,
  });
};

export const DebateMessages = async (req, res) => {
  const { topic , chat: chatId , ModelName } = req.body;

  let chat = null;

  if (!chatId) {
    chat = await chatModel.create({
      user: req.user.id,
      topic,
    });
  }

  const messages = await messageModel.find({ chat: chatId || chat._id });

  const aiResponse = await generateResponse(messages);

  const aiMessage = await messageModel.create({
    chat: chatId || chat._id,
    content: aiResponse,
    role: ModelName,
  });


  res.status(200).json({
    success: true,
    message: aiResponse,
    topic: topic,
    // chat,
    // aiMessage,
    // userMessage,
  });
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
