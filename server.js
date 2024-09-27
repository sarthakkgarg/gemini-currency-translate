const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const path = require('path')


const app = express();
const port = process.env.PORT || 3000;

// const key = require(path.join(__dirname, './gkey.json'));

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.use(express.json());

async function convertLanguageToNumber(input) {
  const prompt = `Convert the following text to a number: "${input}". 
  Please respond with only the number, without any additional text or explanation.`;

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const number = parseFloat(text.trim());
  return isNaN(number) ? null : number;
}

app.post('/convert', async (req, res) => {
  const { input } = req.body;
  
  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const result = await convertLanguageToNumber(input);
    if (result !== null) {
      res.json({ input, result });
      console.log('result', result)
    } else {
      res.status(400).json({ error: 'Failed to convert input to a number' });
    }
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});