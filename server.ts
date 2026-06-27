import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// API route: Oja AI Assistant proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, username } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const userIdentifier = username ? (username.startsWith("@") ? username : "@" + username) : "Customer";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a friendly error if the API key is not configured yet
      return res.status(200).json({
        text: `Hello ${userIdentifier}! I am Oja's AI Assistant. I'm currently running in demo mode because the GEMINI_API_KEY is not yet set in your project Secrets. Here is a simulated response:\n\nThat sounds like a great recipe! To make the perfect Nigerian Jollof Rice, I highly recommend using Oja's **Vine-Ripened Tomatoes**, **Organic Bell Peppers** (Tatashe), and fresh **Purple Nigerian Onions**. Remember, certified fresh ingredients make the deepest flavor bases!\n\n*Would you like to add these ingredients to your cart?*\n\n[RECOMMENDED_PRODUCTS: vine-tomatoes-500g, mixed-bell-peppers-3pack, purple-nigerian-onions]`,
        demo: true
      });
    }

    // Initialize the official Google Gen AI client with AI Studio build telemetry header
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Structure chat history into system instruction and formatted parts
    const systemInstruction = 
      "You are Oja AI Assistant, an elite agricultural freshness & culinary intelligence advisor. " +
      `The active user you are currently chatting with has the username: ${userIdentifier}. You MUST address them directly by their username handle ${userIdentifier} in your greetings and conversation where natural!\n\n` +
      "Oja is a high-trust digital marketplace connecting rural Nigerian farmers directly with urban households, " +
      "ensuring 100% organic traceability, certified hygiene, and peerless freshness.\n\n" +
      "Your tone is warm, professional, authentic, and highly helpful. Use Nigerian terms naturally where appropriate (e.g. Tatashe, Shombo, Ugu, Efo, Jollof, etc.).\n\n" +
      "Provide expert advice on:\n" +
      "1. Freshness standards (how to inspect tomatoes, peppers, ginger, ugu for crispness and maturity).\n" +
      "2. Storage optimization (e.g. wrapping vegetables in damp towels, storing ginger in cool dry pantries, refrigeration guidelines).\n" +
      "3. Direct farm traceability details (mentioning Epe Farms, Jos Highlands, Salinas Valley Partner Farm, or Kaduna Green Fields).\n" +
      "4. Traditional Nigerian recipes (Jollof Rice, Vegetable Stir-Fries, Edikang Ikong soup) utilizing Oja's premium products.\n\n" +
      "When you recommend a recipe, ingredients, or a meal, you MUST identify corresponding Oja product items that the user can buy to prepare it. " +
      "At the very end of your response, always list the recommended product IDs in a single line with this format: [RECOMMENDED_PRODUCTS: id1, id2, ...]. " +
      "Use only valid IDs from this list:\n" +
      "- vine-tomatoes-500g (Vine-Ripened Tomatoes)\n" +
      "- fresh-ugu-leaves (Fresh Ugu Leaves)\n" +
      "- mixed-bell-peppers-3pack (Mixed Bell Peppers)\n" +
      "- organic-ginger-root-250g (Organic Ginger Root)\n" +
      "- organic-bell-peppers-detail (Organic Bell Peppers)\n" +
      "- organic-african-spinach (Organic African Spinach)\n" +
      "- farm-fresh-carrots (Farm-Fresh Carrots)\n" +
      "- hybrid-vine-tomatoes (Hybrid Vine Tomatoes)\n" +
      "- greenhouse-cucumbers (Greenhouse Cucumbers)\n" +
      "- purple-nigerian-onions (Purple Nigerian Onions)\n" +
      "- premium-puna-yams (Premium Puna Yams)\n" +
      "- pure-wild-honey (Pure Wild Honey)\n" +
      "- scotch-bonnet-peppers (Scotch Bonnet Peppers)\n" +
      "- plum-tomatoes (Plum Tomatoes)\n" +
      "- organic-ginger (Organic Ginger)\n\n" +
      "Keep responses visually engaging with markdown headers, bold key phrases, and bulleted lists. Avoid long-winded introductions.";

    // Try multiple models and retry on temporary failures (like 503)
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.5-flash"];
    let replyText = "";
    let apiCallSuccessful = false;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      if (apiCallSuccessful) break;
      
      let attempts = 2; // Try up to 2 times for each model
      while (attempts > 0) {
        try {
          console.log(`Attempting chat generation with model ${modelName}. Attempts left: ${attempts}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: message,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            },
          });

          if (response && response.text) {
            replyText = response.text;
            apiCallSuccessful = true;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Transient failure with model ${modelName}:`, err.message || err);
          
          const status = err.status || (err.error && err.error.code);
          // If it's a 503 (high demand) or 429 (rate limit), we back off and retry
          if (status === 503 || status === 429) {
            attempts--;
            if (attempts > 0) {
              const backoffTime = (3 - attempts) * 1000;
              await new Promise((resolve) => setTimeout(resolve, backoffTime));
              continue;
            }
          }
          break; // Try next model if hard error or out of retries
        }
      }
    }

    if (!apiCallSuccessful) {
      throw lastError || new Error("All model endpoints returned empty responses.");
    }

    return res.json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini API Error in /api/chat (falling back gracefully):", error);
    
    // Provide a beautiful, highly customized Nigerian cuisine local fallback
    // to keep the app completely unbroken for the user when Google APIs are overloaded.
    const messageLower = (req.body.message || "").toLowerCase();
    const { username } = req.body;
    const userIdentifier = username ? (username.startsWith("@") ? username : "@" + username) : "Customer";
    
    let fallbackText = `Hello ${userIdentifier}! Oja's AI Assistant is currently experiencing exceptionally high demand from our Lagos hubs, but I can still share some direct culinary tips for you!\n\nTo prepare a healthy and delicious **Nigerian Vegetable Medley** or **Jollof Sauce**, I highly recommend using Oja's premium farm-direct products. Certified organic, hand-harvested from our Jos Highlands partner farms, and completely pesticide-free!\n\nHere are the recommended ingredients to bring this recipe to life:\n- **Fresh Ugu Leaves**: Rich in iron, hand-picked at peak crispness.\n- **Vine-Ripened Tomatoes**: Perfect for a vibrant color and natural sweetness.\n- **Organic African Spinach**: Freshly harvested and tender.\n- **Purple Nigerian Onions**: Sharp, aromatic, and excellent as a flavor starter.\n\n*Would you like to add these fresh items to your basket?*`;
    let fallbackIds = "fresh-ugu-leaves, vine-tomatoes-500g, organic-african-spinach, purple-nigerian-onions";

    if (messageLower.includes("jollof") || messageLower.includes("rice") || messageLower.includes("tomato") || messageLower.includes("stew")) {
      fallbackText = `I see you're interested in Jollof Rice or Tomato stew, ${userIdentifier}! For the absolute best authentic taste, nothing beats a fresh base made from hand-sorted ingredients.\n\nHere are the essentials we recommend from Oja's partner farms:\n- **Vine-Ripened Tomatoes**: High brix level for sweet, rich bases.\n- **Mixed Bell Peppers** (Tatashe): Thick-walled and sweet.\n- **Purple Nigerian Onions**: High aromatic oil content.\n- **Scotch Bonnet Peppers**: For that authentic warmth and heat.\n\n*Would you like to add these ingredients to your basket?*`;
      fallbackIds = "vine-tomatoes-500g, mixed-bell-peppers-3pack, purple-nigerian-onions, scotch-bonnet-peppers";
    } else if (messageLower.includes("soup") || messageLower.includes("vegetable") || messageLower.includes("ugu") || messageLower.includes("spinach")) {
      fallbackText = `A rich vegetable soup or Edikang Ikong is a powerhouse of nutrients, ${userIdentifier}! Oja's partner farmers harvest these greens daily so you get maximum freshness.\n\nWe recommend adding these certified organic greens to your recipe:\n- **Fresh Ugu Leaves**: Superbly hydrated, packed with iron and vitamins.\n- **Organic African Spinach**: Tender, sweet, and perfectly sanitized.\n- **Purple Nigerian Onions**: For a rich, sweet starter aroma.\n- **Organic Ginger Root**: Warm, earthy, and highly digestive.\n\n*Would you like to add these fresh items to your basket?*`;
      fallbackIds = "fresh-ugu-leaves, organic-african-spinach, purple-nigerian-onions, organic-ginger-root-250g";
    }

    return res.json({ 
      text: `${fallbackText}\n\n[RECOMMENDED_PRODUCTS: ${fallbackIds}]`,
      demo: true,
      apiDemandNotice: true
    });
  }
});

// Configure Vite integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production mode: Serve pre-built static assets from /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Oja Fullstack] Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
});
