// utils/anomalyClassifier.js
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Small helper: normalize any model output to exactly Low | Medium | High
function normalize(label) {
  const t = String(label || "").trim().toLowerCase();
  if (t.startsWith("low")) return "Low";
  if (t.startsWith("medium")) return "Medium";
  if (t.startsWith("high")) return "High";
  return "Low"; // safe default
}

async function classifyAnomaly({ sameDevice, sameIP, sameLocation, hasBaseline }) {
  // Prevent first-login false positives
  if (!hasBaseline) return "Low";

  const prompt = `
Classify the anomaly score for this login attempt. Output exactly one word: Low, Medium, or High.

Same device as usual: ${sameDevice ? "Yes" : "No"}
Same IP address as usual: ${sameIP ? "Yes" : "No"}
Same location as usual: ${sameLocation ? "Yes" : "No"}

Rules:
- High if all 3 are different.
- Medium if 2 are different.
- Low if 1 or 0 are different.
`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 10,
    temperature: 0,
    messages: [
      { role: "user", content: [{ type: "text", text: prompt }] }
    ]
  });

  const cmd = new InvokeModelCommand({
    // Check your Bedrock console for the exact modelId suffix; this form is widely used:
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body
  });

  try {
    const res = await bedrock.send(cmd);
    const json = JSON.parse(new TextDecoder().decode(res.body));
    const text = json?.content?.[0]?.text || "";
    return normalize(text);
  } catch (err) {
    console.error("🧠 Bedrock classify error:", err?.name || err?.message || err);
    // Fail-closed to Low so you do not block users
    return "Low";
  }
}

module.exports = classifyAnomaly;
