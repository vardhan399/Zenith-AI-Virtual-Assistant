import express from "express";
import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";  // <-- ADD THIS

const UserRouter = express.Router();

UserRouter.get("/current", isAuth, getCurrentUser);

UserRouter.post("/update",isAuth,upload.single("assistantImage"),updateAssistant );

UserRouter.post("/asktoassistant", isAuth, askToAssistant);



export default UserRouter;
