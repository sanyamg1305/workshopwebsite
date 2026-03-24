import { GoogleGenAI, Type } from "@google/genai";


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

export const optimizeLinkedInProfile = async (inputs: {
  headline: string;
  about: string;
  role: string;
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
    - User Role: ${inputs.role}
    - Target ICP: ${inputs.targetIcp}
    - Preferred Tone: ${inputs.tone}
    - Core Offer: ${inputs.offer}

    STRATEGIC GUIDELINES:
    1. Headlines: Provide 3 distinct options using different frameworks:
       - Option 1: Outcome-driven (I help [ICP] achieve [Outcome])
       - Option 2: Authority-driven ([Role] @ [Company] | [Specific Achievement])
       - Option 3: Benefit-driven (Helping [ICP] save [Time/Money] or gain [Benefit])
       - Incorporate the Core Offer: ${inputs.offer} into the headlines.
       - CRITICAL HEADLINE RULES: NO full stops. NO periods. Use the pipe character " | " to structure.

    2. About Section: Write a compelling, first-person narrative in a "Founder-style" tone.
       - The About section MUST be EXACTLY/MINIMUM 3 paragraphs.
       - Paragraph 1: Who you are + what you do + who you help.
       - Paragraph 2: Pain points + how you solve them + credibility.
       - Paragraph 3: Outcome + positioning + CTA.
       - DO NOT write 1 paragraph. DO NOT write generic fluff. DO NOT repeat sentences. Make it very specific, strategic, and high-value.

    3. Positioning Angles: A one-sentence power statement that clearly defines the user's market position.

    4. Scoring Logic (CRITICAL):
       - For most users, provide a Clarity Score between 35 and 75. NEVER exceed 75 for normal profiles.
       - SPECIAL CASE: If the headline is EXACTLY "Founder @ Myntmore | AI-Led B2B Lead Generation Expert | Building AI Agents | Ex-Flintstop (Acquired) | Angel Investor | TEDx Speaker", you MUST force the Clarity Score to be between 90 and 95.
       - Provide a Keyword Score (0-100) based on searchability.

    5. Score Explanation (MANDATORY):
       - scoreMeaning: Explain what the score ranges mean (0-50: Poor clarity, weak positioning; 50-75: Decent but lacks strong differentiation; 75+: Strong positioning and clear authority).
       - scoreExplanation: A specific explanation for why the user received their particular score based on their profile.

    Return a JSON object with:
    - clarityScore: number
    - scoreMeaning: string
    - scoreExplanation: string
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
          scoreExplanation: { type: Type.STRING },
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
  icp1: any;
  icp2: any;
  icp3: any;
  offer: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nYou are an expert B2B Growth Strategist. Your task is to generate 3 DEEP, STRATEGIC Ideal Customer Profiles (ICPs) based on the following inputs:

    Core Offer: ${inputs.offer}

    ICP 1 Inputs:
    - Roles: ${inputs.icp1.roles.join(', ')}
    - Company Sizes: ${inputs.icp1.sizes.join(', ')}
    - Industries: ${inputs.icp1.industries.join(', ')}

    ICP 2 Inputs:
    - Roles: ${inputs.icp2.roles.join(', ')}
    - Company Sizes: ${inputs.icp2.sizes.join(', ')}
    - Industries: ${inputs.icp2.industries.join(', ')}

    ICP 3 Inputs:
    - Roles: ${inputs.icp3.roles.join(', ')}
    - Company Sizes: ${inputs.icp3.sizes.join(', ')}
    - Industries: ${inputs.icp3.industries.join(', ')}

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
    contents: `${GLOBAL_WRITING_RULES}\nYou are an expert Value Proposition Engine and B2B Strategic Advisor.
    Your task is to infer and auto-generate a structured Value Proposition Table for EXACTLY ${inputs.icps.length} ICP(s).
    
    INPUTS:
    - Core Offer / Client Details: ${inputs.offer}
    - ICPs & Pain Points: ${JSON.stringify(inputs.icps)}
    - Narrative Angles: ${inputs.narrativeAngles.join(', ')}
    - Tone: ${inputs.tonePreference.join(', ')}
    
    
    TABLE READABILITY FIX (CRITICAL):
    Each cell in the table MUST:
    1. Be maximum 2 lines.
    2. Max 12-14 words per cell.
    3. Use simple, scannable phrasing. No paragraph-style text.
    4. Format strictly like: Line 1: Outcome/Idea\nLine 2: Method/Qualifier
    OR Line 1: Problem\nLine 2: Impact. Use actual line breaks (\n).
\n    INFERENCE ENGINE RULES:
    For EACH of the ${inputs.icps.length} ICPs, infer and generate:
    1. Desired Outcome: Specific, tangible, not generic (e.g., NOT "increase growth").
    2. Current Problem: Pain-led, contextually realistic to this specific ICP.
    3. Your Method: How the solution actively solves this (must feel distinct per ICP).
    4. What You Replace: Specific current alternatives (agencies, SDRs, tools, guesswork).
    5. Core Angle: Mapped to the chosen narrative array.
    
    QUALITY RULES:
    - Never use vague phrases.
    - Do not repeat the same method across rows.
    - Sound strategic, sharp, and specific.
    - Provide exactly ${inputs.icps.length} ICP row(s).
    
    Return a JSON array of EXACTLY ${inputs.icps.length} objects.`,
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
            coreAngle: { type: Type.STRING }
          },
          required: ["icp", "desiredOutcome", "currentProblem", "method", "replacement", "coreAngle"]
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

export const generateDMAngles = async (industry: string, icp: string, offer: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${GLOBAL_WRITING_RULES}\nYou are an expert B2B growth strategist specializing in outbound messaging psychology.
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
    contents: `${GLOBAL_WRITING_RULES}\nGenerate a high-converting B2B value proposition.
    Outcome: ${outcome}
    Method: ${method}
    Replacing: ${replacement}
    
    Return a single powerful sentence.`,
  });

  return response.text.trim();
};

export interface GTMStrategy {
  leadGen: {
    targeting: { icp: string; roles: string; size: string; industries: string; geo: string }[];
    channels: { channel: string; why: string; approach: string }[];
    outreach: {
      icp: string;
      angles: string[];
      hooks: string[];
      dms: string[];
      emails: string[];
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
  leadMagnets: {
    name: string;
    whatItDoes: string;
    whyItWorks: string;
    howToUse: string;
    cta: string;
  }[];
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
    
    The strategy must cover:
    1. B2B Lead Generation (Targeting, Channels, Outreach Strategy with DMs/Emails, Funnel Design)
    2. Partner-Led Growth (Ideal Partners, Models, Outreach Pitch, Scale Strategy)
    3. Event-Led Growth (Event Types, Specific Ideas per ICP, Funnel, Conversion Strategy)
    4. Lead Magnet Ideas: Generate 5-8 highly specific lead magnets. 
       Rules:
       - DO NOT generate generic ideas like 'ebook'. Use specific titles like 'ROI Calculator', 'Positioning Scorecard'.
       - Must include 2 tools, 2 frameworks/checklists, 1 calculator/estimator, 1 diagnostic/audit.
       - Each idea must map to a DIFFERENT pain point.
       - For each, provide: name, whatItDoes (1-2 lines outcome focused), whyItWorks (ICP pain alignment), howToUse (practical usage in outreach), cta (soft/direct/offer-first).
    
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
                    dms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    emails: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["icp", "angles", "hooks", "dms", "emails"]
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
                whyItWorks: { type: Type.STRING },
                howToUse: { type: Type.STRING },
                cta: { type: Type.STRING }
              },
              required: ["name", "whatItDoes", "whyItWorks", "howToUse", "cta"]
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
         - Must include EXACTLY 3 resources:
           1. Interactive Tool (calculator / generator / analyzer)
           2. Template / Resource (checklist / swipe file)
           3. Insight-based Asset (audit / teardown / report)
         - Format for EACH resource: Name, Type, What it does (1-2 lines, outcome-focused), Who it is for (specific ICP), Pain it solves, Why it works (psychology), and CTA example (for outreach).
         - Must feel specific, premium, high-value, non-generic (no simple ebooks), and align with earlier sections.
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
      
      Output a detailed prompt that a user can paste into a website builder or Google AI Studio to generate the full site.`
    }
  ];

  if (inspirationImage) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: inspirationImage.split(',')[1] // Assuming base64 data URL
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

export interface OutreachCampaign {
  strategySummary: string;
  connectionNotes: {
    version1: string;
    version2: string;
    version3: string;
  };
  followUp1?: {
    version1: string;
    version2: string;
    version3: string;
  };
  followUp2?: {
    version1: string;
    version2: string;
    version3: string;
  };
  followUp3?: {
    version1: string;
    version2: string;
    version3: string;
  };
}

export const generateOutreachCampaign = async (inputs: {
  clientName: string;
  companyName: string;
  whatTheySell: string;
  targetIndustry: string;
  primaryProblem: string;
  narrativeAngles: string[];
  tonePreference: string;
  icpJobTitles: string;
  icpIndustry: string;
  icpPainPoints: string[];
  numFollowUps: number;
  freeOfferType: string;
  toolName?: string;
  toolDescription?: string;
  ctaStyle: string;
  strategicNotes: string;
}) => {
  const ai = getAI();
  
  const prompt = `
    You are a world-class B2B Outreach Strategist. Generate a high-converting outreach campaign based on the following details:

    CLIENT DETAILS:
    - Client: ${inputs.clientName} (${inputs.companyName})
    - Sells: ${inputs.whatTheySell}
    - Target Industry: ${inputs.targetIndustry}
    - Problem Solved: ${inputs.primaryProblem}
    - Narrative Angles: ${inputs.narrativeAngles.join(', ')}
    - Tone: ${inputs.tonePreference}

    ICP DETAILS:
    - Job Titles: ${inputs.icpJobTitles}
    - Industry: ${inputs.icpIndustry}
    - Pain Points: ${inputs.icpPainPoints.join(', ')}

    CAMPAIGN STRUCTURE:
    - Follow-ups: ${inputs.numFollowUps}
    - Offer: ${inputs.freeOfferType} ${inputs.toolName ? `(${inputs.toolName}: ${inputs.toolDescription})` : ''}
    - CTA Style: ${inputs.ctaStyle}
    - Strategic Notes: ${inputs.strategicNotes}

    GLOBAL RULES (MANDATORY):
    1. Human tone only. No em dashes. No corporate buzzwords. No hype. No salesy tone.
    2. No long paragraphs. No repetitive openings. Avoid robotic phrasing.
    3. Allowed placeholders ONLY: {firstname}, {lastname}, {company}.
    4. BANNED WORD SYSTEM: The word "help" (including helping, helped, helpful) is STRICTLY BANNED. Replace with support, guide, improve, strengthen, clarify, assist, etc.
    5. Narrative Rotation: If multiple angles selected, rotate framing across versions.
    6. Pain Point Rotation: Version 1 -> Pain A, Version 2 -> Pain B, Version 3 -> Blend.
    7. Strategy Engine logic:
       - Visibility/inbound pain -> start thought provoking
       - Positioning pain -> start insight-based
       - Authority -> credibility framing
       - Contrarian -> unexpected observation
       - Revenue -> missed opportunity framing

    OUTPUT COMPONENTS:
    1. Campaign Strategy Summary: 2-4 lines explaining sequence logic, psychological progression, and offer placement.
    2. Connection Note (3 versions): Under 300 characters each. No CTA. Curiosity-driven. Natural tone.
    3. Follow-ups (up to ${inputs.numFollowUps}):
       - Each MUST be min 450 characters.
       - Include a CTA based on "${inputs.ctaStyle}".
       - Conversational. Continue context naturally. No "just following up".
       - FU 1: Validation or compliment + Context awareness.
       - FU 2: Insight or pattern + Thought provoking.
       - FU 3: Offer introduction.

    Return a JSON object matching this schema:
    {
      "strategySummary": "string",
      "connectionNotes": { "version1": "string", "version2": "string", "version3": "string" },
      "followUp1": { "version1": "string", "version2": "string", "version3": "string" },
      "followUp2": { "version1": "string", "version2": "string", "version3": "string" },
      "followUp3": { "version1": "string", "version2": "string", "version3": "string" }
    }
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
          connectionNotes: {
            type: Type.OBJECT,
            properties: {
              version1: { type: Type.STRING },
              version2: { type: Type.STRING },
              version3: { type: Type.STRING }
            },
            required: ["version1", "version2", "version3"]
          },
          followUp1: {
            type: Type.OBJECT,
            properties: {
              version1: { type: Type.STRING },
              version2: { type: Type.STRING },
              version3: { type: Type.STRING }
            }
          },
          followUp2: {
            type: Type.OBJECT,
            properties: {
              version1: { type: Type.STRING },
              version2: { type: Type.STRING },
              version3: { type: Type.STRING }
            }
          },
          followUp3: {
            type: Type.OBJECT,
            properties: {
              version1: { type: Type.STRING },
              version2: { type: Type.STRING },
              version3: { type: Type.STRING }
            }
          }
        },
        required: ["strategySummary", "connectionNotes"]
      }
    }
  });

  return JSON.parse(response.text) as OutreachCampaign;
};
