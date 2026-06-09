const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = 'claude-sonnet-4-20250514';

/**
 * General text query to Safura AI
 */
async function ask({ system, messages, maxTokens = 1024, tools = null }) {
  const params = { model: MODEL, max_tokens: maxTokens, system, messages };
  if (tools) params.tools = tools;
  const response = await client.messages.create(params);
  return response.content.map(b => b.text || '').filter(Boolean).join('\n');
}

/**
 * Image-based food scan — sends base64 image to Claude vision
 */
async function scanImage({ base64Image, mediaType = 'image/jpeg', userProfile, systemPrompt }) {
  return ask({
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
        { type: 'text', text: `User profile: ${JSON.stringify(userProfile || {})}\n\nPlease scan this food item and return the full Safura scan card.` }
      ]
    }],
    maxTokens: 1024
  });
}

/**
 * Ask with web search tool enabled (for real-time food data)
 */
async function askWithSearch({ system, messages, maxTokens = 1024 }) {
  return ask({
    system,
    messages,
    maxTokens,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }]
  });
}

module.exports = { ask, scanImage, askWithSearch };
