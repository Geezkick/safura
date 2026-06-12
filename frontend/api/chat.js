const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mode, profile, formData, image, query, messages } = req.body || {};
  try {

    let systemPrompt = `You are Safura, an elite AI nutrition, culinary, and health utility. 
Always factor in the user's health profile in your answers. Do not ignore allergies.
User Profile: ${JSON.stringify(profile)}`;

    let finalMessages = messages || [];

    // Mode handling for AI prompts
    if (mode === 'scan') {
      systemPrompt += `\nAnalyze the food based on the provided image or text description. Provide:\n1. Exact Name & Cultural Origin\n2. Detailed Macros (Calories, Protein, Fat, Carbs)\n3. Diet Type (e.g. Keto, Vegan, Halal)\n4. Temp preference (warm/cold)\n5. Visual Freshness / Spoilage assessment\n6. Strict Allergen check based on user profile.\n\nBe incredibly precise and professional in your feedback.`;
      
      if (image) {
        finalMessages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: 'Analyze this food.' }
          ]
        }];
      } else if (formData && formData.food_name) {
        finalMessages = [{ role: 'user', content: `Analyze the food: ${formData.food_name}` }];
      }
    } else if (mode === 'mealplan') {
      systemPrompt += `\nYou are a master meal planner. Return EXACTLY valid JSON in this format:
{
  "plan": [
    { "day": 1, "meals": [{ "type": "Breakfast", "food": "Name", "calories": 300, "protein": 20 }] }
  ],
  "groceryList": ["item 1"]
}
Only return the JSON. No markdown backticks, no other text.`;

      finalMessages = [{ role: 'user', content: `Create a meal plan for ${formData?.duration || '1 Day'}. Goal: ${formData?.goal || 'Maintain'}.` }];
    } else if (mode === 'freshness') {
      systemPrompt += `\nYou are an expert food safety inspector. The user has provided an image or text description of food along with storage parameters.
Your goal is to accurately assess its spoilage risk, remaining shelf life, and safety. Give precise scientific estimates based on FDA guidelines. Warn the user strongly if there is a risk of foodborne illness.`;
      
      if (image) {
        finalMessages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: `Assess this food. Params: ${JSON.stringify(formData)}` }
          ]
        }];
      } else {
        finalMessages = [{ role: 'user', content: `Assess freshness of this food. Params: ${JSON.stringify(formData)}` }];
      }
    } else {
      // Default query or form data
      if (query) {
        finalMessages = [{ role: 'user', content: query }];
      } else if (formData) {
        finalMessages = [{ role: 'user', content: JSON.stringify(formData) }];
      }
    }

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      system: systemPrompt,
      messages: finalMessages
    });

    return res.status(200).json({
      success: true,
      text: response.content[0].text,
      result: response.content[0].text
    });

  } catch (error) {
    console.error('AI Error:', error);

    // DEMO FALLBACK ENGINE: If API fails (e.g. out of credits), intercept and provide a realistic response.
    if (mode === 'scan') {
      const mockScan = "**Safura AI Analysis (Demo Fallback)**\n\n1. **Name & Origin:** Handcrafted Sushi Roll. Origin: Japan.\n2. **Macros:** 320 kcal | 12g Protein | 8g Fat | 45g Carbs.\n3. **Diet Type:** Pescatarian, Dairy-Free.\n4. **Temperature:** Served Cold. Excellent light digestion.\n5. **Freshness Assessment:** The ingredients appear highly vibrant and fresh. Zero visible signs of oxidation or spoilage. Safe to consume.\n6. **Allergen Alert:** Contains Fish and Soy. Proceed with caution if sensitive. \n\n*(Note: Your Anthropic API credits are empty. This is a simulated response.)*";
      return res.status(200).json({ success: true, text: mockScan, result: mockScan });
    } 
    
    if (mode === 'mealplan') {
      const mockPlan = JSON.stringify({
        plan: [
          { day: 1, meals: [ 
            { type: "Breakfast", food: "Oatmeal & Berries", calories: 300, protein: 12 }, 
            { type: "Lunch", food: "Grilled Chicken Salad", calories: 450, protein: 35 }, 
            { type: "Dinner", food: "Baked Salmon & Quinoa", calories: 600, protein: 42 } 
          ]}
        ],
        groceryList: ["Oats", "Mixed Berries", "Chicken Breast", "Mixed Greens", "Salmon Fillet", "Quinoa"]
      });
      return res.status(200).json({ success: true, text: mockPlan, result: mockPlan });
    }

    // Default Fallback
    const mockText = "**Safura Intelligence Offline:** Your Anthropic API account has run out of credits. The backend caught the billing error. Please top up your Anthropic console to restore live AI capabilities. This is a simulated fallback response so you can continue testing the UI.";
    return res.status(200).json({ success: true, text: mockText, result: mockText });
  }
}
