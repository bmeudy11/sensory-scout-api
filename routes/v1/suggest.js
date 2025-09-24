const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

//imports needed for chatbot
const { GoogleGenerativeAI } = require('@google/generative-ai');

//strategy for recaptcha
const { GoogleRecaptchaV2Strategy } = require('../../interfaces/recaptchaStrategies');

//init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash",
    "generationConfig" : {"responseMimeType": "application/json"}
});

const pool = require('../../utilities/pool');

router.post('/suggest', async(req, res) => {
    const { message } = req.body;
    if(!message){
        return res.status(400).json({ error: "Message is required."});
    }

    try{
        const prompt=`
            You are a helpful assistant for the SensoryScout application.  You goal is to suggest 
            locations based on user requests related to sensory needs: (ex. "quiet", "not crowded", "dimly lit").

            Based on the user's message: "${message}", provide 2-3 location suggestions.

            VERY IMPORTANT:  Respond ONLY with valid JSON object.  Do not include any text before or after the JSON.

            The JSON object should follow this structure, with no prefixes:
            {
                "suggestions" : [
                    {
                        "name" : "Location Name",
                        "type" : "ex, Cafe, Park, Library",
                        "reason" : "A brief explanation of why this location fits the user's request."
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("Response: ", responseText);

        const parsedResponse = JSON.parse(responseText);

        res.json(parsedResponse);
    }catch(err){
        console.log("Error calling gemini api: ", err);
        res.status(500).json({error: "Failed to get suggestions.", err});
    }
});


module.exports = router;