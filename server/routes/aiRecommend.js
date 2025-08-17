// routes/aiRecommend.js
const express = require('express');
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { Product } = require('../models');
const router = express.Router();

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

// Helper: Format product info for Claude prompt (include image URL)
function formatProducts(products) {
	return products.map(p => `- ${p.name} ($${p.price}): ${p.description || ''} [Image: ${p.image || p.imageUrl || 'N/A'}]`).join('\n');
}

router.post('/recommend', async (req, res) => {
	const user = req.body.user || null; // {name, email, ...} or null
	const cart = req.body.cart || [];

	// Get all products (or top N)
	const products = await Product.findAll({ limit: 20 });
	const productList = formatProducts(products);

	let prompt = `You are an expert motorcycle parts recommender.\n`;
	if (user) {
		prompt += `The user is: ${user.name || user.email}.`;
	} else {
		prompt += `The user is a guest.`;
	}
	if (cart && cart.length > 0) {
		prompt += `\nTheir cart contains: ` + cart.map(item => `${item.name} (x${item.quantity})`).join(', ') + '.';
	}
	prompt += `\nHere is a list of available products:\n${productList}\n`;
	prompt += `\nRecommend 3 products for this user. Reply as a JSON array of objects with name, reason, and image fields. Example: [{"name": "...", "reason": "...", "image": "..."}]`;

	const command = new InvokeModelCommand({
		modelId: "amazon.titan-text-express-v1",
		contentType: "application/json",
		accept: "application/json",
		body: JSON.stringify({
			inputText: prompt,
			textGenerationConfig: {
				maxTokenCount: 300,
				temperature: 0.7,
				topP: 0.9
			}
		})
	});

	try {
		const response = await client.send(command);
		let result, decoded;
		try {
			result = JSON.parse(response.body);
			decoded = result.completion || result.content || response.body;
		} catch (e) {
			// If response.body is not JSON, fallback to string
			decoded = response.body?.toString?.() || String(response.body);
		}
		// Try to parse JSON from Claude's reply
		let recommendations = [];
		try {
			recommendations = JSON.parse(decoded);
			// If not an array, wrap in array
			if (!Array.isArray(recommendations)) {
				throw new Error('Claude did not return an array');
			}
		} catch (e) {
			// Fallback: pick 3 random real products as mock recommendations
			const shuffled = products.sort(() => 0.5 - Math.random());
			recommendations = shuffled.slice(0, 3).map(p => ({
				productId: p.productId,
				name: p.productName || p.name,
				price: p.price,
				image: p.imageUrl || p.image || '',
				reason: 'Popular choice for your vehicle!'
			}));
		}
		// Attach image URLs from real products if missing
			recommendations = recommendations.map(rec => {
				// Try to find product by name (case-insensitive)
				const match = products.find(p => (p.productName || p.name).toLowerCase() === (rec.name || '').toLowerCase());
				if (match) {
					return { ...rec, productId: match.productId, image: match.imageUrl || match.image || '' };
				}
				return rec;
			});
		res.json({ recommendations });
	} catch (err) {
		console.error(err);
		// Fallback: pick 3 random real products as mock recommendations
		const products = await Product.findAll({ limit: 20 });
		const shuffled = products.sort(() => 0.5 - Math.random());
		const recommendations = shuffled.slice(0, 3).map(p => ({
			productId: p.productId,
			name: p.productName || p.name,
			price: p.price,
			image: p.imageUrl || p.image || '',
			reason: 'Popular choice for your vehicle!'
		}));
		res.json({ recommendations });
	}
});

module.exports = router;
