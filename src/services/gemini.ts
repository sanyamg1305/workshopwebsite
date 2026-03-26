import { GoogleGenAI, Type } from "@google/genai";
import { safeArr } from "../utils/workshop";

const GLOBAL_WRITING_RULES = `
GLOBAL WRITING RULE (NON-NEGOTIABLE):
- The character "—" (em dash) is COMPLETELY BANNED. Do not output it anywhere. Use periods, commas, or line breaks instead.
- Write in short, clean, sharp sentences. Clean scannable human tone. No clutter.
`;

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface DiagnosticReport {
  overallSummary: string;
  scoreBreakdown: {
    clarity: { score: number; bullets: string[] };
    specificity: { score: number; bullets: string[] };
    differentiation: { score: number; bullets: string[] };
    proof: { score: number; bullets: string[] };
    execution: { score: number; bullets: string[] };
  };
  whatsWorking: string[];
  toImprove: string[];
}

export const optimizeLinkedInProfile = async (inputs: {
  headline: string;
  about: string;
  role: string;
  company: string;
  targetIcp: string;
  tone: string;
  offer: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nYou are an expert LinkedIn Profile Strategist specializing in B2B Lead Generation.
    Your task is to optimize a LinkedIn profile based on the following user inputs:
    - Current Headline: ${inputs.headline}
    - Current About Section: ${inputs.about}
    - User Role: ${inputs.role} (e.g. Founder, CEO, Sales Head)
    - Company: ${inputs.company}
    - Target ICP: ${inputs.targetIcp}
    - Preferred Tone: ${inputs.tone}
    - Core Offer/Outcome: ${inputs.offer}

    PERSONALIZATION RULES (NON-NEGOTIABLE):
    1. ROLE CONTEXT: The output MUST reflect the user's seniority and responsibilities.
       - If Founder/CEO: Focus on vision, growth, leadership, and the "why" behind the business.
       - If Sales/Revenue Head: Focus on pipeline, efficiency, scale, and concrete results.
       - If Freelancer/Consultant: Focus on specialized expertise, speed, and direct impact.
    2. COMPANY ALIGNMENT: Mention or reflect the scale and nature of ${inputs.company} in the positioning.
    3. POSITIONING: Make the profile feel like it belongs to a high-level executive in ${inputs.company}. Use the Target ICP Designation (${inputs.targetIcp}) to tailor the Headline, About section, and Keywords.

    STRATEGIC GUIDELINES:
    1. Headlines: Provide 3 distinct options using different frameworks:
       - Option 1: Outcome-driven (I help [ICP] achieve [Outcome])
       - Option 2: Authority-driven ([Role] @ ${inputs.company} | [Specific Achievement])
       - Option 3: Benefit-driven (Helping [ICP] save [Time/Money] or gain [Benefit])
       - Incorporate the Core Offer: ${inputs.offer} into the headlines. Use the Designation: ${inputs.targetIcp} prominently.
       - CRITICAL HEADLINE RULES: NO full stops. NO periods. Use the pipe character " | " to structure.
       - FORMAT: MUST follow "Frame | Role | Outcome" or similar sharp structures.

    2. About Section: Write a compelling, first-person narrative in a professional "Founder-style" tone.
       - The About section MUST be EXACTLY 3 paragraphs. NO more, NO less.
       - Use the Target ICP Designation: ${inputs.targetIcp} to speak directly to their pains and needs.
       - Paragraph 1 (Who/Problem): Who you are, who you help, and the core problem you solve.
       - Paragraph 2 (How/Method): How you solve it, your specific method/differentiation, and what you replace.
       - Paragraph 3 (Results/CTA): The outcomes you deliver, credibility markers, and a clear next-step CTA.
       - RULES: No fluff. No generic "I help businesses grow." Be specific, sharp, and outcome-oriented.

    3. Positioning Angles: A one-sentence power statement that clearly defines the user's market position.

    4. Scoring Logic (CRITICAL - NEW CALIBRATION):
       - REMOVE all artificial score suppression (no more 35-75 caps).
       - Each profile is graded on 5 key criteria (0-20 points each):
         1. Clarity (0-20): How easy is it to understand the offer and audience?
         2. Specificity (0-20): Are the results and mechanisms concrete?
         3. Differentiation (0-20): Is the positioning unique vs competitors?
         4. Proof (0-20): Are there credible markers, results, or experience shown?
         5. Execution (0-20): Is the structure, tone, and flow professionally aligned?
       - FINAL SCORE (0-100): The sum of these 5 criteria.
       - Allow strong, specific businesses to reach 90+ naturally.

    5. Scoring Guidelines & Meaning:
       - 90–100: Top-tier. Clear, highly specific, evidence-backed, and unique.
       - 70–89: Good quality but lacks one or two core elements.
       - 50–69: Generic, vague, or partially unclear positioning.
       - Below 50: Weak positioning requires fundamental rework.

    6. Score Explanation (MANDATORY STRUCTURE):
       - scoreMeaning: Briefly state the achievement level (e.g., "Top-Tier Positioning").
       - scoreExplanation: A detailed breakdown. YOU MUST justify the score by referencing the 5 criteria above. Explain exactly where they gained or lost points in Clarity, Specificity, Differentiation, Proof, and Execution. Mention how well they aligned with the Designation: ${inputs.targetIcp}.

    Return a JSON object with:
    - clarityScore: number
    - scoreMeaning: string
    - scoreExplanation: object (as defined below)
    - headlines: array of 3 strings
    - aboutSection: string
    - positioningAngles: string
    - keywordScore: number`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clarityScore: { type: Type.NUMBER },
          scoreMeaning: { type: Type.STRING },
          scoreExplanation: { 
            type: Type.OBJECT,
            properties: {
              overallSummary: { type: Type.STRING },
              scoreBreakdown: {
                type: Type.OBJECT,
                properties: {
                  clarity: { 
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["score", "bullets"]
                  },
                  specificity: { 
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["score", "bullets"]
                  },
                  differentiation: { 
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["score", "bullets"]
                  },
                  proof: { 
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["score", "bullets"]
                  },
                  execution: { 
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["score", "bullets"]
                  }
                },
                required: ["clarity", "specificity", "differentiation", "proof", "execution"]
              },
              whatsWorking: { type: Type.ARRAY, items: { type: Type.STRING } },
              toImprove: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["overallSummary", "scoreBreakdown", "whatsWorking", "toImprove"]
          },
          headlines: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          aboutSection: { type: Type.STRING },
          positioningAngles: { type: Type.STRING },
          keywordScore: { type: Type.NUMBER }
        },
        required: ["clarityScore", "scoreMeaning", "scoreExplanation", "headlines", "aboutSection", "positioningAngles", "keywordScore"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateDetailedICPs = async (inputs: {
  icps: any[];
  offer: string;
}) => {
  const ai = getAI();
  const icpInputsStr = inputs.icps.map((icp, idx) => `
    ICP ${idx + 1} Inputs:
    - Roles: ${safeArr(icp.roles).join(', ')}
    - Company Sizes: ${safeArr(icp.sizes).join(', ')}
    - Industries: ${safeArr(icp.industries).join(', ')}
  `).join('\n');

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nYou are an expert B2B Growth Strategist. Your task is to generate ${inputs.icps.length} DEEP, STRATEGIC Ideal Customer Profiles (ICPs) based on the following inputs:

    Core Offer: ${inputs.offer}

${icpInputsStr}

    For EACH ICP, generate a highly detailed profile with these sections:
    1. ICP Name: A catchy, descriptive name (e.g., "Scaling SaaS Growth Leader").
    2. Who They Are: Detailed description of their role, company type, stage, and context.
    3. Core Responsibilities: Daily tasks and key KPIs they own.
    4. Pain Points: At least 5-7 detailed bullet points covering operational, strategic, team, and growth bottlenecks.
    5. Goals & Desires: What they want to achieve and what success looks like.
    6. Buying Triggers: Specific events or moments when they look for solutions.
    7. Objections: Why they hesitate (budget, trust, timing, risk).
    8. Psychology: How they think, what they care about, and their decision-making style.
    9. Where They Hang Out: Platforms and content they consume.
    10. How to Position: Messaging angle, tone, and what to emphasize.

    QUALITY RULES:
    - Output must feel like real strategy, not generic text.
    - Use specific, believable insights.
    - Avoid vague lines like "they want growth".
    - Make each ICP DISTINCT from the others.

    Return a JSON array of 3 objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            whoTheyAre: { type: Type.STRING },
            responsibilities: { type: Type.STRING },
            painPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            goals: { type: Type.STRING },
            triggers: { type: Type.STRING },
            objections: { type: Type.STRING },
            psychology: { type: Type.STRING },
            hangouts: { type: Type.STRING },
            positioning: { type: Type.STRING }
          },
          required: ["name", "whoTheyAre", "responsibilities", "painPoints", "goals", "triggers", "objections", "psychology", "hangouts", "positioning"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export interface DetailedICP {
  name: string;
  whoTheyAre: string;
  responsibilities: string;
  painPoints: string[];
  goals: string;
  triggers: string;
  objections: string;
  psychology: string;
  hangouts: string;
  positioning: string;
}

export interface ValuePropTable {
  icp: string;
  desiredOutcome: string;
  currentProblem: string;
  method: string;
  replacement: string;
  coreAngle: string;
  whyThisWins: string;
}

export const generateValuePropTables = async (inputs: {
  icps: any[];
  offer: string;
  narrativeAngles: string[];
  tonePreference: string[];
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}
You are a senior BUSINESS INTELLIGENCE STRATEGIST and VALUE PROP ENGINE.
Your job is NOT to generate generic positioning. You must provide HIGH-DETAIL, STRUCTURED strategies that feel like they were written by a human consultant.

-------------------------------------
🧩 PART 1: BUSINESS UNDERSTANDING (INTERNAL THINKING)
Before generating, you must deeply analyze:
- What they ACTUALLY sell (core utility)
- Real monetization & delivery mechanism
- Their "Unfair Advantage" in the current market
- Target audience behavior (Service/Product/SaaS/Brand)
-------------------------------------

TASK:
Infer and auto-generate a structured Value Proposition for EACH of the ${inputs.icps.length} validated ICP(s).

INPUTS:
- Core Offer / Client Details: ${inputs.offer}
- Target ICPs: ${JSON.stringify(inputs.icps.map(i => ({ name: i.name, pain: i.painPoints })))}
- Strategic Tone: ${inputs.tonePreference.join(', ')}

STRATEGIC RULES:
1. DEPTH: Each ICP must feel fundamentally DIFFERENT. Do not repeat methods.
2. SPECIFICITY: Mention mechanisms like "LinkedIn inbound system", "Authority building", "Content -> Conversation flow", or "Qualification mechanisms".
3. NO FLUFF: Ban phrases like "increase growth", "improve results", "scale faster". Use measurable, sharp outcomes.
4. READABILITY: Use clean, structured phrasing.

OUTPUT FORMAT REQUIREMENTS:
For EACH ICP, provide:
- Desired Outcome: Specific, measurable goal (2 lines max).
- Current Problem: The REAL pain they face, not generic (2-3 lines).
- Your Method: HOW it actually works. The unique mechanism (2-3 lines).
- What They Replace: Specific alternatives (agencies, manual SDRs, generic tools).
- Core Angle: One clear positioning angle (Authority / ROI / Speed / Trust).
- Why This Wins: Explain WHY this mechanism beats the current alternatives (1-2 lines).

Return a JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            icp: { type: Type.STRING },
            desiredOutcome: { type: Type.STRING },
            currentProblem: { type: Type.STRING },
            method: { type: Type.STRING },
            replacement: { type: Type.STRING },
            coreAngle: { type: Type.STRING },
            whyThisWins: { type: Type.STRING }
          },
          required: ["icp", "desiredOutcome", "currentProblem", "method", "replacement", "coreAngle", "whyThisWins"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateGlobalSolution = async (vpTables: ValuePropTable[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nBased on these 3 Value Proposition Tables: ${JSON.stringify(vpTables)}, 
    generate a GLOBAL SOLUTION SECTION that:
    1. Adapts to ALL 3 ICPs
    2. Highlights flexibility across segments
    3. Shows a modular or layered offering
    
    Return a punchy, strategic description (2-3 paragraphs).`
  });
  return response.text.trim();
};

export const generateValueProp = async (outcome: string, method: string, replacement: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nGenerate a high-converting B2B value proposition.
    Outcome: ${outcome}
    Method: ${method}
    Replacing: ${replacement}
    
    Return a single powerful sentence.`,
  });

  return response.text.trim();
};

export interface LeadMagnet {
  name: string;
  whatItDoes: string;
  userInput: string;
  output: string;
  whyValuable: string;
  format: 'Calculator' | 'Diagnostic tool' | 'Decision tool' | 'Generator' | 'Analyzer';
  targetICP: string;
  cta: string;
}

export interface GTMStrategy {
  leadGen: {
    targeting: { icp: string; roles: string; size: string; industries: string; geo: string }[];
    channels: { channel: string; why: string; approach: string }[];
    outreach: {
      icp: string;
      angles: string[];
      hooks: string[];
      channelTips: { channel: string; tips: string[] }[];
    }[];
    funnel: { step: string; description: string }[];
  };
  partnerGrowth: {
    idealPartners: { icp: string; partners: string[] }[];
    models: string[];
    outreach: { pitch: string; logic: string };
    scale: string[];
  };
  eventGrowth: {
    types: string[];
    ideas: { icp: string; topics: string[] }[];
    funnel: string;
    conversion: string;
  };
  leadMagnets: LeadMagnet[];
}

export const generateDetailedGTM = async (inputs: {
  icps: DetailedICP[];
  offer: string;
  valuePropTables: ValuePropTable[];
  industry: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nYou are an expert GTM Strategist. Generate a HIGHLY DETAILED, ACTIONABLE Go-To-Market strategy for:
    
    Offer: ${inputs.offer}
    Industry: ${inputs.industry}
    ICPs: ${JSON.stringify(inputs.icps)}
    Value Proposition Tables: ${JSON.stringify(inputs.valuePropTables)}
    
    The strategy must be written in PLAIN ENGLISH using SHORT SENTENCES.
    Use a scannable format:
    - "What should you do"
    - "Where should you do it"
    - "How should you do it"

    The strategy must cover:
    1. Outreach Strategy (formerly B2B Lead Gen) (Targeting, Channels, Outreach Strategy with Tips, Funnel Design)
        - Outreach Strategy: For each ICP, provide channel-specific tips and best practices (What to personalize, when to send, follow-up timing, subject line style, etc.). DO NOT provide message scripts here.
    2. Partner-Led Growth (Ideal Partners, Models, Outreach Pitch, Scale Strategy)
    3. Event-Led Growth (Event Types, Specific Ideas per ICP, Funnel, Conversion Strategy)
    4. Lead Magnet Strategy (CRITICAL): Generate EXACTLY 3 high-conversion, TOOL-BASED lead magnets.
       
       STRICT RULES:
       - NEVER return "Guides", "Ebooks", "Checklists", or generic "Swipe Files".
       - Assets must be interactive or result-oriented "mini-products".
       - Each must solve a real, painful, immediate bottleneck.
       - Each must be usable in <15 minutes and deliver a tangible output.
       
       For EACH lead magnet, provide:
       1. Name (Clear, not clever: e.g., "Calculate Exactly How Many Leads You Need...")
       2. What it does (1 line outcome, no concept fluff)
       3. User Input (What they enter: e.g., team size, deal size)
       4. Output (What they get: e.g., a number, an insight, a decision)
       5. Why it's Valuable (Tie directly to a painful business problem)
       6. Format (Must be: Calculator, Diagnostic tool, Decision tool, Generator, or Analyzer)
       7. Target ICP (Which ICP this is specifically for)
       8. CTA (Clear business-oriented next step)
    
    QUALITY RULES:
    - EVERYTHING MUST BE CONTEXTUAL to the ICPs and Pain Points.
    - ACTIONABLE > THEORETICAL. Use specific filters, roles, and message frameworks.
    - SEGMENTATION IS KEY. Each ICP must have a different GTM angle.
    
    Return a JSON object following the GTMStrategy interface.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          leadGen: {
            type: Type.OBJECT,
            properties: {
              targeting: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    icp: { type: Type.STRING },
                    roles: { type: Type.STRING },
                    size: { type: Type.STRING },
                    industries: { type: Type.STRING },
                    geo: { type: Type.STRING }
                  },
                  required: ["icp", "roles", "size", "industries", "geo"]
                }
              },
              channels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    channel: { type: Type.STRING },
                    why: { type: Type.STRING },
                    approach: { type: Type.STRING }
                  },
                  required: ["channel", "why", "approach"]
                }
              },
              outreach: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    icp: { type: Type.STRING },
                    angles: { type: Type.ARRAY, items: { type: Type.STRING } },
                    hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    channelTips: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          channel: { type: Type.STRING },
                          tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["channel", "tips"]
                      }
                    }
                  },
                  required: ["icp", "angles", "hooks", "channelTips"]
                }
              },
              funnel: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["step", "description"]
                }
              }
            },
            required: ["targeting", "channels", "outreach", "funnel"]
          },
          partnerGrowth: {
            type: Type.OBJECT,
            properties: {
              idealPartners: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    icp: { type: Type.STRING },
                    partners: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["icp", "partners"]
                }
              },
              models: { type: Type.ARRAY, items: { type: Type.STRING } },
              outreach: {
                type: Type.OBJECT,
                properties: {
                  pitch: { type: Type.STRING },
                  logic: { type: Type.STRING }
                },
                required: ["pitch", "logic"]
              },
              scale: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["idealPartners", "models", "outreach", "scale"]
          },
          eventGrowth: {
            type: Type.OBJECT,
            properties: {
              types: { type: Type.ARRAY, items: { type: Type.STRING } },
              ideas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    icp: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["icp", "topics"]
                }
              },
              funnel: { type: Type.STRING },
              conversion: { type: Type.STRING }
            },
            required: ["types", "ideas", "funnel", "conversion"]
          },
          leadMagnets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                whatItDoes: { type: Type.STRING },
                userInput: { type: Type.STRING },
                output: { type: Type.STRING },
                whyValuable: { type: Type.STRING },
                format: { type: Type.STRING },
                targetICP: { type: Type.STRING },
                cta: { type: Type.STRING }
              },
              required: ["name", "whatItDoes", "userInput", "output", "whyValuable", "format", "targetICP", "cta"]
            }
          }
        },
        required: ["leadGen", "partnerGrowth", "eventGrowth", "leadMagnets"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateGTMStrategy = async (industry: string, icp: string, offer: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nGenerate a 90-day GTM Strategy for:
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

export const generateWebsitePrompt = async (inputs: {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  inspirationImage: string | null;
  valueProp: string;
  icpSummary: string;
  offer: string;
  narrativeAngles: string[];
  tonePreference: string[];
}) => {
  const ai = getAI();
  
  const parts: any[] = [
    {
      text: `${GLOBAL_WRITING_RULES}\nYou are a world-class conversion rate optimization (CRO) expert, Website Conversion + Strategy Engine, and B2B web designer. 
      Generate a comprehensive, high-converting website structure and copy prompt using ALL these inputs:
      - Brand Name: ${inputs.brandName}
      - Primary Color (HEX): ${inputs.primaryColor}
      - Secondary Color (HEX): ${inputs.secondaryColor}
      - Business Description / Offer: ${inputs.offer}
      - Value Proposition: ${inputs.valueProp}
      - Target Audience (ICP) & Pains: ${inputs.icpSummary}
      - Narrative Angles: ${inputs.narrativeAngles.join(', ')}
      - Tone: ${inputs.tonePreference.join(', ')}

      The generated website MUST include exactly these 8 sections in this EXACT order. This is a NON-NEGOTIABLE system override.
      
      1. Hero Section: Catchy headline, sub-headline, and primary CTA.
      2. Problem Section: Agitate the core pain points of the ICP.
      3. Solution Section: How ${inputs.brandName} solves these problems.
      4. Value Proposition Section: Focus on the specific outcomes and strategic difference.
      5. 🚀 Free Resource / Free Tool Section (MANDATORY INSERTION): 
         - Must include EXACTLY 3 high-utility, TOOL-BASED resources.
         - FORBIDDEN: "Guides", "Ebooks", "Checklists", or generic PDFs.
         - Must feel like interactive "mini-products".
         - Format for EACH resource: 
           - Name: (Clear, not clever outcome-based title)
           - Format: (Calculator / Diagnostic tool / Decision tool / Generator / Analyzer)
           - What it does: (1 line outcome)
           - User Input: (What they enter)
           - Output: (What they get)
           - Why it works: (Psychological trigger / Business value)
           - CTA: (Strategic next step)
      6. CTA Section: Final push for conversion.
      7. ❓ FAQ Section (Objection Handling): 6-10 highly relevant questions answering:
         - Trust (credibility)
         - Process (how it works)
         - Time (results timeline)
         - Effort required
         - Differentiation (vs alternatives)
         - Fit (who it is NOT for)
         - Risk / uncertainty
      8. Final CTA / Footer

      FAQ Rules:
      - Answers must be clear, direct, and non-corporate.
      - Focus on true objection-handling. No fluff.

      If an inspiration image is provided, infer the layout style and structure from it (do not copy, adapt to the content).

      DESIGN & AESTHETIC CONSTRAINTS (PREMIUM ONLY):
      - Use Rich Aesthetics: Deep blacks, vibrant ${inputs.primaryColor}, and sophisticated ${inputs.secondaryColor}.
      - Visual Excellence: Implement glassmorphism, smooth gradients, and micro-animations.
      - Typography: Suggest modern, premium fonts (e.g., Inter, Outfit, or Playfair Display).
      - Dynamic Design: Ensure the UI feels alive with hover states and interactive elements.
      - NO PLACEHOLDERS: All copy must be final and strategic.
      
      Output a detailed prompt that a user can paste into a website builder or Google AI Studio to generate the full site. Include specific CSS variables for --primary (${inputs.primaryColor}) and --secondary (${inputs.secondaryColor}).`
    }
  ];

  if (inputs.inspirationImage) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: inputs.inspirationImage.split(',')[1] // Assuming base64 data URL
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
  });

  return response.text.trim();
};

export const generateCampaignFlow = async (type: string, tone: string, cta: string, icp: string, valueProp: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nGenerate a 4-step B2B outreach campaign flow for:
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

export interface OutreachEngineOutput {
  strategySummary: string;
  linkedIn: {
    connectionRequest: string;
    followUps: string[];
  };
  email: {
    subjectLine: string;
    body: string;
    followUps: string[];
  };
}

export const generateOutreachEngine = async (inputs: {
  clientName: string;
  companyName: string;
  whatTheySell: string;
  targetIndustry: string;
  primaryProblem: string;
  valueProp: string;
  icpSummary: string;
  gtmStrategy: string;
  angle: 'Authority' | 'ROI' | 'Pain-led' | 'Contrarian' | 'Curiosity' | 'Offer-led';
  channel: 'LinkedIn' | 'Email' | 'Both';
}) => {
  const ai = getAI();
  
  const prompt = `
    You are a world-class B2B Outreach Strategist.
    Your task is to generate a comprehensive outreach package strictly based on the following:
    
    CLIENT/OFFER:
    - Client: ${inputs.clientName} (${inputs.companyName})
    - Offer: ${inputs.whatTheySell}
    - Value Prop: ${inputs.valueProp}
    
    CONTEXT:
    - Industry: ${inputs.targetIndustry}
    - ICP/Pain: ${inputs.icpSummary}
    
    STRATEGIC FOCUS:
    - Selected Angle: ${inputs.angle}
    
    -------------------------------------
    OUTPUT REQUIREMENTS:
    
    A. LinkedIn Logic
    - Connection Request: Short, human-to-human. No pitch.
    - Follow-ups: 3 distinct follow-ups that lean into the ${inputs.angle} angle.
    
    B. Email Logic
    - Subject Line: Pattern interrupt or authority-based.
    - Body: 1 primary outreach email (short, 3-5 lines).
    - Follow-ups: 2 distinct follow-ups.
    
    GLOBAL WRITING RULES:
    - No em dashes (—).
    - No corporate jargon.
    - Sharp, clean sentences.
    
    Return a JSON object following the OutreachEngineOutput interface.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategySummary: { type: Type.STRING },
          linkedIn: {
            type: Type.OBJECT,
            properties: {
              connectionRequest: { type: Type.STRING },
              followUps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["connectionRequest", "followUps"]
          },
          email: {
            type: Type.OBJECT,
            properties: {
              subjectLine: { type: Type.STRING },
              body: { type: Type.STRING },
              followUps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["subjectLine", "body", "followUps"]
          }
        },
        required: ["strategySummary", "linkedIn", "email"]
      }
    }
  });

  return JSON.parse(response.text) as OutreachEngineOutput;
};
