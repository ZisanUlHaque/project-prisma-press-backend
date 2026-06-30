import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { userRoutes } from "./module/user/user.route";
import { authRoutes } from "./module/auth/auth.route";
import { postRoutes } from "./module/posts/post.route";
import { commentRoutes } from "./module/comments/comment.route";


const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/users", userRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/comments",commentRoutes)
app.use("/api/posts",postRoutes)

app.use((req: Request,res : Response)=>{
  res.status(404).json({
    message : "Route not found",
    path : req.originalUrl
  })
})

export default app;
