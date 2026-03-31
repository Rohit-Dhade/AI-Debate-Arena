import { Router } from "express";
import { setTopic , getChats , getMessages , deleteChat , DebateMessages } from "../controller/chat.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const Chatrouter = Router();

Chatrouter.post("/set-topic", authUser, setTopic);
Chatrouter.post("/debate", authUser, DebateMessages);
Chatrouter.get('/',authUser,getChats)
Chatrouter.get("/:chatId/messages" , authUser,getMessages);
Chatrouter.delete('/delete/:chatId',authUser,deleteChat);

export default Chatrouter;