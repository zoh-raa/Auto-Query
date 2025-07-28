const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function classifyAnomaly({ sameDevice, sameIP, sameLocation }) {
  const prompt = `
Classify the anomaly score (Low, Medium, High) for the following login attempt:

- Same device as usual: ${sameDevice ? "Yes" : "No"}
- Same IP address as usual: ${sameIP ? "Yes" : "No"}
- Same location as usual: ${sameLocation ? "Yes" : "No"}

Rules:
- High if all 3 are different.
- Medium if 2 are different.
- Low if 1 or 0 are different.

Only return the label (Low, Medium, or High).
`;

  const payload = {
    prompt,
    max_tokens_to_sample: 10,
    temperature: 0
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-haiku-20240307",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload)
  });

  try {
    const response = await bedrockClient.send(command);
    const parsed = JSON.parse(new TextDecoder().decode(response.body));
    const rawOutput = parsed.completion || "";

    // Extract label
    const label = rawOutput.trim().split('\n')[0];
    return label;
  } catch (err) {
    console.error("🧠 Claude scoring error:", err);
    return "Unknown";
  }
}

module.exports = classifyAnomaly;
