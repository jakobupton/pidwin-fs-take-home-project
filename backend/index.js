import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from 'dotenv';

import userRouter from "./src/api/user.js";
import lucky7init from "./lucky7init.js";
import betRouter from "./src/api/bet.js";
import winstreak from "./src/api/winstreak.js";



dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.use(cors());
app.use("/api/user", userRouter);
app.use("/api", betRouter);
app.use("/api", winstreak);


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() =>{
    app.listen(PORT, () => console.log(`Server Started On Port ${PORT}`));
    lucky7init(); // Start the lucky7 game loop
  }).catch((error) => console.log(error.message));
