const express = require('express');
const router = express.Router();
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config();

// AWS Bedrock client setup
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/', async (req, res) => {
  const { stage, message, brand, model, year } = req.body;
  const msg = message?.trim().toLowerCase();
  let reply = "";
  let handledLocally = false;

  const greetingKeywords = ['hello', 'hi', 'hey', 'hi there'];
  const hoursKeywords = [
    'how many hours', 'opening hours', 'what time', 'operating hours',
    'when do you close', 'when do you open', 'working hours', 'closing time',
    'business hours', 'time you open', 'time you close', 'are you open now',
    'what time do you open', 'what time do you close'
  ];

  // Local logic
  switch (stage) {
    case 'general':
      if (greetingKeywords.some(k => msg.includes(k))) {
        reply = "👋 Welcome to our page! How can I assist you today?";
        handledLocally = true;
      } else if (hoursKeywords.some(k => msg.includes(k))) {
        reply = "⏰ We operate 9am–6pm, Monday to Saturday.";
        handledLocally = true;
      }
      break;

    case 'partFinder':
  if (brand && model && year) {
    reply = `Got it! Based on your vehicle (${brand} ${model}, ${year}), we'll show compatible parts.`;
    handledLocally = true;
    return res.json({
      reply,
      showButton: true,          // show button in frontend
      buttonText: "View Products",
      buttonLink: "/product"     // navigate straight to ProductPage
    });
  } else {
    reply = "Please provide your vehicle's brand, model, and year.";
    handledLocally = true;
  }
  break;
      

    case 'rfq':
      if (msg.includes('quote') || msg.includes('quotation') || msg.includes('request')) {
        reply = "To request a quote, please go to your cart and click the 'Request Quote' button.";
        handledLocally = true;
      } else {
        reply = "You can request a quote for items in your cart. Just let me know!";
        handledLocally = true;
      }
      break;

    case 'siteIssue':
      if (msg.includes('error') || msg.includes('not working') || msg.includes('issue') || msg.includes('bug') || msg.includes('problem')) {
        reply = "Sorry about that! Please describe the issue and we’ll notify our support team.";
        handledLocally = true;
      } else {
        reply = "If you're facing an issue, let me know what’s wrong.";
        handledLocally = true;
      }
      break;
  }

  // If matched logic, send reply
  if (handledLocally) {
    return res.json({ reply });
  }

  // If not matched, use Claude
  const prompt = `
You are a helpful assistant for an auto parts website.
User message: "${message}"
Vehicle: Brand=${brand || 'N/A'}, Model=${model || 'N/A'}, Year=${year || 'N/A'}

Respond politely and accurately.`;

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      inferenceConfiguration: {
        stopSequences: ["\n\nHuman:"],
        maxTokens: 500,
        temperature: 0.7,
      },
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        max_tokens_to_sample: 1024,
      }),
      // ❗️ Required to avoid "on-demand throughput" error
      inferenceProfileArn: process.env.INFERENCE_PROFILE_ARN,
    });

    const response = await bedrockClient.send(command);
    const bodyString = new TextDecoder().decode(response.body);
    const bodyJson = JSON.parse(bodyString);
    const aiReply = bodyJson?.content?.[0]?.text?.trim();

    return res.json({ reply: aiReply || "Sorry, I couldn't generate a response." });

  } catch (err) {
    console.error("Claude API Error:", err);
    return res.status(500).json({ error: "Claude API Error" });
  }
});

module.exports = router;
