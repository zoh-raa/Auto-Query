const express = require('express');
const router = express.Router();
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { Delivery, DeliveryProduct } = require('../models');
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
  const { stage, message, brand, model, deliveryId, user } = req.body;
  const msg = message?.trim().toLowerCase() || '';
  let reply = '';
  let handledLocally = false;
  let showButton = false;
  let buttonText = '';
  let buttonLink = '';

  try {
    // ==== LOCAL HANDLING FIRST ====
    switch (stage) {
      case 'general':
        if (!msg || /hello|hi|hey/.test(msg)) {
          reply = `👋 Hello ${user?.name || 'Guest'}! How can I assist you today?`;
        } else if (/hours|open|close|time/.test(msg)) {
          reply = "⏰ Our operating hours are 9am–6pm, Monday to Saturday.";
        } else {
          reply = "I'm here to help! You can ask about deliveries, request quotes, or report site issues.";
        }
        handledLocally = true;
        break;

      case 'partFinder':
        if (!msg || !(brand && model)) {
          reply = "Please provide your vehicle's brand and model so I can help you find parts.";
        } else {
          reply = `🔧 Based on your vehicle (${brand} ${model}), you can view compatible parts.`;
          showButton = true;
          buttonText = "View Products";
          buttonLink = "/product";
        }
        handledLocally = true;
        break;

      case 'rfq':
        reply = "To request a quote, click the button below to go to the RFQ form. But need add item to cart first.";
        showButton = true;
        buttonText = "Request a Quote";
        buttonLink = "/rfq-form";
        handledLocally = true;
        break;

      case 'delivery':
        if (!deliveryId) {
          reply = "Please provide a Delivery ID to get details, or click below to view all your deliveries.";
          showButton = true;
          buttonText = "Go to My Deliveries";
          buttonLink = "/delivery-management";
        } else {
          const numericId = Number(deliveryId);
          const delivery = await Delivery.findOne({
            where: user?.id ? { id: numericId, customerId: user.id } : { id: numericId },
            include: [{ model: DeliveryProduct, as: 'products' }]
          });

          if (delivery) {
            const items = delivery.products
              .map(p => `• ${p.quantity}x ${p.item}${p.remarks ? ` (${p.remarks})` : ''}${p.status ? ` (${p.status})` : ''}`)
              .join('\n');

            reply = `📦 Delivery #${delivery.id} ${user?.name ? `for ${user.name}` : ''}:\n` +
              `${items}\nOverall Status: ${delivery.status}\n\n` +
              `Click below to see all your deliveries or check details.`;

            showButton = true;
            buttonText = "Go to My Deliveries";
            buttonLink = "/delivery-management";
          } else {
            reply = `❌ No delivery found with ID ${numericId}. You can check all your deliveries below.`;
            showButton = true;
            buttonText = "Go to My Deliveries";
            buttonLink = "/delivery-management";
          }
        }
        handledLocally = true;
        break;



      default:
        reply = "I'm here to help! Please select a valid option.";
        handledLocally = true;
        break;
    }

    // ==== RETURN IF HANDLED LOCALLY ====
    if (handledLocally) {
      return res.json({ reply, showButton, buttonText, buttonLink });
    }

    // ==== FALLBACK AI ====
    const prompt = `
You are a helpful assistant for an auto parts website.
Stage: ${stage}
User: ${user?.name || 'Guest'}
Message: "${message}"
Vehicle: Brand=${brand || 'N/A'}, Model=${model || 'N/A'}
Delivery ID: ${deliveryId || 'N/A'}
If this is a site issue, provide friendly and clear troubleshooting steps.
Always give a specific answer to the user's issue.
If relevant, suggest buttons for deliveries, products, or quotes.
`;

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-instant-v1",
      inferenceConfiguration: { stopSequences: ["\n\nHuman:"], maxTokens: 500, temperature: 0.7 },
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }], max_tokens_to_sample: 1024 }),
      inferenceProfileArn: process.env.INFERENCE_PROFILE_ARN,
    });

    const response = await bedrockClient.send(command);
    const bodyString = new TextDecoder().decode(response.body);
    const bodyJson = JSON.parse(bodyString);
    const aiReply = bodyJson?.content?.[0]?.text?.trim() || "Sorry, I couldn't generate a response.";

    // AI can trigger buttons
    if (/delivery/i.test(aiReply)) {
      showButton = true;
      buttonText = "Go to My Deliveries";
      buttonLink = "/delivery-management";
    } else if (/product/i.test(aiReply)) {
      showButton = true;
      buttonText = "View Products";
      buttonLink = "/product";
    } else if (/quote|quotation/i.test(aiReply)) {
      showButton = true;
      buttonText = "Request a Quote";
      buttonLink = "/rfq-form";
    }

    return res.json({ reply: aiReply, showButton, buttonText, buttonLink });

  } catch (err) {
    console.error("Chatbot route error:", err);
    return res.status(500).json({
      reply: "Something went wrong. Please try again later.",
      showButton: false,
      buttonText: '',
      buttonLink: ''
    });
  }
});

module.exports = router;