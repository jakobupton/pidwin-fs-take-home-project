import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from 'dotenv';
import http from "http";
import { Server } from "socket.io";


import userRouter from "./src/api/user.js";
import Lucky7 from "./lucky7.js";
import betRouter from "./src/api/bet.js";
import winstreak from "./src/api/winstreak.js";



dotenv.config();

const app = express();


app.use(bodyParser.json({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.use(cors());
app.use("/api/user", userRouter);


const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server);



mongoose
  .connect(process.env.MONGODB_URL)
  .then(() =>{
    server.listen(PORT, () => console.log(`Server Started On Port ${PORT}`));
  }).catch((error) => console.log(error.message));


const lucky7 = new Lucky7(io);
lucky7.init();
app.use("/api", betRouter(lucky7));
app.use("/api", winstreak);