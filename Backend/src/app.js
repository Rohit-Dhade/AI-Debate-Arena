import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import Chatrouter from "./routes/chat.routes.js";

const app = express();

// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);


app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", Chatrouter);

export default app;
