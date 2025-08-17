// utils/openai.js
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a polite message for the customer
 */
async function generatePoliteMessage(deliveryText, tone = 'friendly') {
  const companyName = 'AutoQuery';
  const prompt = `Write a ${tone} message to update the customer about their delivery.
End the message with:
Best regards,
${companyName}
Contact Information: support@autoquery.com

Delivery Details:
${deliveryText}`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Unable to generate message.';
  } catch (err) {
    console.error('AI polite message error:', err);
    return 'Unable to generate message at this time.';
  }
}

/**
 * Convert risk level to a color
 */
function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case "High": return "red";
    case "Medium": return "orange";
    case "Low": return "green";
    default: return "#555";
  }
}

/**
 * Fallback summary if AI fails
 */
function fallbackSummary(delivery) {
  const items = (delivery.products || [])
    .map(p => `${p.quantity}x ${p.item}${p.remarks ? ` (${p.remarks})` : ""}`)
    .join(", ") || "N/A";

  return `Delivery for PO ${delivery.poNumber} is currently "${delivery.status}". 
Scheduled on ${delivery.deliveryDate ?? "N/A"} at ${delivery.timing ?? "N/A"}. 
Location: ${delivery.location}. 
Items: ${items}.`;
}

/**
 * Call OpenAI to summarize delivery
 */
async function callAI({ delivery, systemPrompt, maxTokens = 600, temperature = 0.4 }) {
  const safeDelivery = JSON.parse(JSON.stringify(delivery)); // avoid circular refs
  const prompt = systemPrompt ||
    `You are a smart, concise assistant for delivery management.
Summarize this delivery, highlighting key details and suggested actions:
${JSON.stringify(safeDelivery, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    return text || fallbackSummary(delivery);
  } catch (err) {
    console.error("callAI error:", err);
    return fallbackSummary(delivery);
  }
}

/**
 * Format delivery for readable prompt
 */
function formatDeliveryForPrompt(d) {
  const items = (d.products || [])
    .map(p => `${p.quantity}x ${p.item}${p.remarks ? ` (${p.remarks})` : ""}`)
    .join(", ");
  return `
PO Number: ${d.poNumber}
RFQ: ${d.rfqId ?? "N/A"}
Status: ${d.status}
Date: ${d.deliveryDate ?? "N/A"}  Time: ${d.timing ?? "N/A"}
Location: ${d.location}
Assigned To: ${d.assignedTo ?? "N/A"}
Provider: ${d.deliveryProvider ?? "N/A"}
Phone: ${d.phone ?? d?.Customer?.phone ?? "N/A"}
Items: ${items || "N/A"}
Description: ${d.description || "N/A"}
Customer: ${d?.Customer?.name ?? "N/A"} (${d?.Customer?.email ?? "N/A"})
`.trim();
}

/**
 * Heuristic delay risk estimation
 */
function heuristicDelayRisk(d) {
  const now = new Date();
  const date = d.deliveryDate ? new Date(d.deliveryDate) : null;
  let score = 0;

  switch (d.status) {
    case "Cancelled":
      score = 100; // always high risk
      break;
    case "Delivered":
      score = 0;
      break;
    case "In Progress":
      score = 50;
      break;
    case "Pending":
      score = 80;
      break;
    default:
      score = 30;
  }

  if (date && date < new Date(now.toDateString())) score += 10;
  if (!d.timing) score += 10;
  const itemsCount = (d.products || []).reduce((acc, p) => acc + (p.quantity || 0), 0);
  if (itemsCount >= 10) score += 10;
  if ((d.description || "").length > 120) score += 5;
  if (score > 100) score = 100;

  let riskLevel;
  if (score >= 70) riskLevel = "High";
  else if (score >= 35) riskLevel = "Medium";
  else riskLevel = "Low";

  return {
    riskScore: score,
    riskLevel,
    color: getRiskColor(riskLevel),
    signals: {
      overdue: !!(date && date < new Date(now.toDateString())),
      missingTiming: !d.timing,
      largeOrder: itemsCount >= 10,
    },
  };
}

module.exports = {
  callAI,
  formatDeliveryForPrompt,
  heuristicDelayRisk,
  fallbackSummary,
  generatePoliteMessage,
};
