import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const optimizeLinkedInProfile = async (inputs: {
  headline: string;
  about: string;
  role: string;
  targetIcp: string;
  tone: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert LinkedIn Profile Strategist specializing in B2B Lead Generation.
    Your task is to optimize a LinkedIn profile based on the following user inputs:
    - Current Headline: ${inputs.headline}
    - Current About Section: ${inputs.about}
    - User Role: ${inputs.role}
    - Target ICP: ${inputs.targetIcp}
    - Preferred Tone: ${inputs.tone}

    STRATEGIC GUIDELINES:
    1. Headlines: Provide 3 distinct options using different frameworks:
       - Option 1: Outcome-driven (I help [ICP] achieve [Outcome])
       - Option 2: Authority-driven ([Role] @ [Company] | [Specific Achievement])
       - Option 3: Benefit-driven (Helping [ICP] save [Time/Money] or gain [Benefit])
    2. About Section: Write a compelling, first-person narrative that starts with a strong hook, addresses ICP pain points, explains the unique value proposition, and ends with a clear call to action.
    3. Positioning: A one-sentence power statement that clearly defines the user's market position.
    4. Scores: Provide realistic scores (0-100) for Clarity (how easily a stranger understands what you do) and Keyword Optimization (for searchability within the target industry).

    Return a JSON object with:
    - clarityScore: number
    - headlines: array of 3 strings
    - aboutSection: string
    - positioning: string
    - keywordScore: number`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clarityScore: { type: Type.NUMBER },
          headlines: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          aboutSection: { type: Type.STRING },
          positioning: { type: Type.STRING },
          keywordScore: { type: Type.NUMBER }
        },
        required: ["clarityScore", "headlines", "aboutSection", "positioning", "keywordScore"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateDMAngles = async (industry: string, icp: string, offer: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert B2B growth strategist specializing in outbound messaging psychology.
    Generate 5 highly personalized DM angles for:
    - Industry: ${industry}
    - ICP: ${icp}
    - Offer: ${offer}

    Each angle must reflect:
    - ICP psychology
    - Emotional drivers
    - Industry-specific pressures
    - Buying motivations

    Return a JSON array of 5 objects, each with:
    - name: string (Angle Name)
    - message: string (The DM message)
    - whyItWorks: string (Psychological explanation)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            message: { type: Type.STRING },
            whyItWorks: { type: Type.STRING }
          },
          required: ["name", "message", "whyItWorks"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateValueProp = async (outcome: string, method: string, replacement: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a high-converting B2B value proposition.
    Outcome: ${outcome}
    Method: ${method}
    Replacing: ${replacement}
    
    Return a single powerful sentence.`,
  });

  return response.text.trim();
};

export const generateGTMStrategy = async (industry: string, icp: string, offer: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 90-day GTM Strategy for:
    - Industry: ${industry}
    - ICP: ${icp}
    - Offer: ${offer}

    Return a JSON object with:
    - primary: string (Primary Channel)
    - secondary: string (Secondary Channel)
    - plan: array of 4 strings (Weekly Action Plan steps)
    - results: string (Expected Results in 90 days)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primary: { type: Type.STRING },
          secondary: { type: Type.STRING },
          plan: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          results: { type: Type.STRING }
        },
        required: ["primary", "secondary", "plan", "results"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateWebsitePrompt = async (brandName: string, brandColor: string, inspiration: string, valueProp: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed AI Website Builder prompt for:
    - Brand: ${brandName}
    - Color Scheme: ${brandColor}
    - Inspiration: ${inspiration}
    - Value Prop: ${valueProp}

    Include sections for Hero, Social Proof, Features, and CTA.`,
  });

  return response.text.trim();
};
export const generateCampaignFlow = async (type: string, tone: string, cta: string, icp: string, valueProp: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 4-step B2B outreach campaign flow for:
    - Campaign Type: ${type}
    - Tone: ${tone}
    - CTA Style: ${cta}
    - Target ICP: ${icp}
    - Value Prop: ${valueProp}

    Return a JSON array of 4 strings, each representing a step in the sequence (e.g., "Day 1: Connection Request with personalized hook").`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text);
};
