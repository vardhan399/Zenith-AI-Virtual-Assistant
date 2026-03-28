import User from '../models/user.model.js';
import uploadOnCloudinary from "../config/cloudinary.js";
import { response } from 'express';
import geminiResponse from '../gemini.js';
import dotenv from 'dotenv';
import axios from 'axios';
import moment from "moment"

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;

        let assistantImage;

        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path);
        } else {
            assistantImage = imageUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { assistantName, assistantImage },
            { new: true }
        ).select('-password');

        res.status(200).json(user);
    }
    catch (err) {
        res.status(400).json({ message: 'Update assistant error' });
    }
};

export const askToAssistant = async (req, res) => {
    try{
        const { command } = req.body;
        const user = await User.findById(req.userId);
        const userName = user.name;
        const assistantName = user.assistantName || "Zenith";
        const result = await geminiResponse(command,assistantName,userName);
        const jsonMatch = result.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            return res.status(400).json({ response: 'Sorr, i can\'t understand that.' });
        }
        const gemResult = JSON.parse(jsonMatch[0]);
        const type=gemResult.type;

        switch(type){
            case "get_date" :
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today's date is ${moment().format('MMMM Do YYYY')}`
                })
            case "get_time" :
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current time is ${moment().format('hh:mm:ss a')}`
                })
            case "get_day" :
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today is ${moment().format('dddd')}`  
                })
            case "get_month" :
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `This month is ${moment().format('MMMM')}`
                })
            case 'google_search':
            case 'youtube_search':
            case 'youtube_play':
            case 'calculator_open':
            case 'instagram_open':
            case 'facebook_open':
            case 'weather_show':
            case "general" :
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response
                })
                default:
                    return res.json({
                        type: "unknown",
                        response: "I'm not sure how to handle that request."
            })
        }
    }
    catch(err){
        res.status(500).json({ message: 'Error asking assistant' });
    }
}