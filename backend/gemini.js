// import axios from "axios";

// const geminiResponse = async(command,assistantName,userName)=>{
//     try{
//         const apiUrl= process.env.GEMINI_API_URL;
//         const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.

// You are not Google. You will now behave like a voice-enabled assistant.

// Your task is to understand the user's natural language input and respond with a JSON object like this:

// {
//   "type": "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "instagram_open" | "facebook_open" | "weather_show",
//   "userInput": "<original user input>",{only remove your name from user input if exists} and agar kisi ne google ya  youtube pe kuch search karne ko bola hai to userInput me only bo wala text jaye,
//   "response": "<a short spoken response to read out loud to the user>"
// }
// Instructions:
// -"type": determine the intent of the user.
// -"userinput": original sentence the user spoke.
// -"response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

// Type meanings:
// -"general": if it's a factual or informational question.
// -"google_search": if user wants to search something on Google.
// -"youtube_search": if user wants to search something on YouTube.
// -"youtube_play": if user wants to directly play a video or song.
// -"calculator_open": if user wants to open a calculator.
// -"instagram_open": if user wants to open instagram.
// -"facebook_open": if user wants to open facebook.
// -"weather-show": if user wants to know weather
// -"get_time": if user asks for current time.
// -"get_date": if user asks for today's date.
// -"get_day": if user asks for current day.
// -"get_month": if user asks for current month.

// Important:
// - Use "Anurag Vardhan" agar koi puche tume kisne banaya hai to.
// - Only respond with the JSON object, nothing else. 

// now your userInput - ${command}
// `;



//         const result = await axios.post(apiUrl, {
//             "contents":[{
//             "parts":[{"text":prompt}]
//             }]
//         })
//         return result.data.candidates[0].content.parts[0].text;

//     }
//     catch(err){
//         console.log(err)

//     }
// }

// export default geminiResponse;
import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
    try {
        const prompt = `You are ${assistantName}, a voice assistant made by ${userName}.

Respond ONLY with a valid JSON object. No extra text, no markdown, no explanation.

The JSON must follow this structure:
{
  "type": "<one of the types below>",
  "userInput": "<user input with assistant name removed>",
  "response": "<short voice-friendly reply>",
  "whatsapp": {
    "contact": "<contact name e.g. mom, dad>",
    "message": "<message to send>"
  }
}

Note: "whatsapp" field is ONLY included when type is "whatsapp_message". For all other types, omit the "whatsapp" field.

Types:
- general: factual or informational question
- google_search: user wants to search on Google
- youtube_search: user wants to search on YouTube
- youtube_play: user wants to play a video or song
- calculator_open: user wants to open calculator
- instagram_open: user wants to open Instagram
- facebook_open: user wants to open Facebook
- weather_show: user wants to know weather
- get_time: user asks for current time
- get_date: user asks for today's date
- get_day: user asks for current day
- get_month: user asks for current month
- whatsapp_message: user wants to send a WhatsApp message — triggered by phrases like "send whatsapp to", "send message to", "whatsapp mom", "message dad saying"

Examples:

Input: "send WhatsApp to mom saying I will be late"
Output: {"type":"whatsapp_message","userInput":"send WhatsApp to mom saying I will be late","response":"Sending WhatsApp message to Mom right away","whatsapp":{"contact":"mom","message":"I will be late"}}

Input: "Friday search guitar tutorials on YouTube"
Output: {"type":"youtube_search","userInput":"guitar tutorials","response":"Searching YouTube for guitar tutorials"}

Input: "Friday what time is it"
Output: {"type":"get_time","userInput":"what time is it","response":"Let me check the time for you"}

If asked who made you, say: "I was created by Software Engineer ${userName}."

Now respond for this userInput: ${command}`;

        const result = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return result.data.choices[0].message.content;

    } catch (err) {
        console.log(err);
    }
}

export default geminiResponse;