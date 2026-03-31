import readline from "readline/promises";
import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  createAgent,
  HumanMessage,
  tool,
  SystemMessage,
  AIMessage,
} from "langchain";
// import { sendEmail } from "./mail.service.js";
import * as z from "zod";
import { tavily } from "@tavily/core";

// const emailTool = tool(sendEmail, {
//   name: "emailTool",
//   description: "Send an email to a recipient",
//   schema: z.object({
//     to: z.string().describe("The recipient's email address"),
//     subject: z.string().describe("The subject of the email"),
//     html: z.string().describe("The HTML content of the email"),
//   }),
// });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const llm = new ChatMistralAI({
  model: "mistral-small-latest",
});

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const agent = createAgent({
  model: llm,
});

const messages = [];

export const generateResponse = async (messages) => {
  const query = messages[messages.length - 1].content;

  const searchResult = await tvly.search(query, {
    maxResults: 5,
    searchDepth: "advanced",
  });

  const context = searchResult.results
    .slice(0, 5)
    .map((r) => r.content)
    .join("\n");

  // inject context into last user message
  const formattedMessages = messages.map((msg, index) => {
    if (msg.role === "user") {
      // only modify LAST user message
      if (index === messages.length - 1) {
        return new HumanMessage(`
Use the following real-time context to answer:

${context}

Question: ${msg.content}
        `);
      }
      return new HumanMessage(msg.content);
    } else if (msg.role === "ai") {
      return new AIMessage(msg.content);
    }
  });

  const response = await agent.invoke({
    messages: formattedMessages,
  });

  return response.messages[response.messages.length - 1].content;
};

export const generateChatTitle = async (message) => {
  const response = await llm.invoke({
    messages: [
      new SystemMessage(`You are a helpful assistant that generates concise and descriptive topic titles for chat conversations.

User will provide you with the first message of a debate topic and you will generate a title that captures the essence of the conversation in 2-4 words.`),

      new HumanMessage(`
Generate a topic title for a chat conversation based on the following first message:

${message}
`),
    ],
  });

  const res = response.messages[response.messages.length - 1].content;

  return res.replace(/[*"]/g, "");
};
