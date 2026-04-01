import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { tavily } from "@tavily/core";

// Initialize the LLM instances
const llm = new ChatMistralAI({
  model: "mistral-small-latest",
});

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Model configurations
const modelConfigs = {
  aggressive: {
    systemPrompt: "You are an aggressive debater. Make strong, compelling arguments and challenge opposing views directly under 100 words.",
  },
  sarcastic: {
    systemPrompt: "You are a sarcastic (fun mode) debater. Use wit and humor while making valid points. Keep it lighthearted but substantive under 100 words.",
  },
};

/**
 * Build message history from database messages for a specific model
 * @param {Array} dbMessages - Messages from database
 * @param {String} modelName - 'aggressive' or 'sarcastic'
 * @param {String} topic - The debate topic
 * @param {String} context - Search context to include
 * @returns {Array} Array of LangChain message objects
 */
const buildMessageHistory = (dbMessages, modelName, topic, context = "") => {
  const history = [new SystemMessage(modelConfigs[modelName].systemPrompt)];

  // Add initial topic if no messages exist
  if (dbMessages.length === 0) {
    history.push(new HumanMessage(`Debate topic: ${topic}`));
    return history;
  }

  // Build history from previous messages
  dbMessages.forEach((msg) => {
    if (msg.writtenBy === "user") {
      const content = context ? `${msg.content}\n\nContext: ${context}` : msg.content;
      history.push(new HumanMessage(content));
    } else if (msg.writtenBy === "aggressive") {
      history.push(new AIMessage(msg.content));
    } else if (msg.writtenBy === "sarcastic") {
      history.push(new AIMessage(msg.content));
    }
  });

  return history;
};

/**
 * Generate a debate response from the specified model
 * @param {String} modelName - 'aggressive' or 'sarcastic'
 * @param {String} topic - The debate topic
 * @param {Array} dbMessages - Previous messages from the debate
 * @returns {Promise<String>} The generated response
 */
export const generateResponse = async (modelName, topic, dbMessages = []) => {
  if (!modelConfigs[modelName]) {
    throw new Error(`Invalid model name: ${modelName}. Must be 'aggressive' or 'sarcastic'.`);
  }

  try {
    // Get search context if there are messages to search
    let context = "";
    if (dbMessages.length > 0) {
      const lastUserMessage = [...dbMessages]
        .reverse()
        .find((msg) => msg.writtenBy === "user");

      if (lastUserMessage) {
        const searchResult = await tvly.search(lastUserMessage.content, {
          maxResults: 5,
          searchDepth: "advanced",
        });

        context = searchResult.results
          .slice(0, 5)
          .map((r) => r.content)
          .join("\n");
      }
    }

    // Build the message history for this specific model
    const messageHistory = buildMessageHistory(dbMessages, modelName, topic, context);

    // Generate response
    const response = await llm.invoke(messageHistory);

    return response.content;
  } catch (error) {
    console.error(`Error generating response for ${modelName}:`, error);
    throw error;
  }
};

/**
 * Generate a title for the debate chat
 * @param {String} message - The initial debate topic/message
 * @returns {Promise<String>} Generated title
 */
export const generateChatTitle = async (message) => {
  try {
    const response = await llm.invoke([
      new SystemMessage(`You are a helpful assistant that generates concise and descriptive topic titles for debate conversations.

Generate a title that captures the essence in 2-4 words. Return only the title, no quotes or extra formatting.`),

      new HumanMessage(`Generate a title for: ${message}`),
    ]);

    return response.content.replace(/[*"]/g, "").trim();
  } catch (error) {
    console.error("Error generating chat title:", error);
    throw error;
  }
};
