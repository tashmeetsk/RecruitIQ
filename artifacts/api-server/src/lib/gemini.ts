import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ROLE_CATEGORIES = [
  "HR",
  "Sales",
  "Backend Developer",
  "Frontend Developer",
  "Marketing",
  "Operations",
  "Customer Support",
] as const;

const WFH_PREFS = ["remote", "hybrid", "onsite", "no_preference"] as const;

const EXTRACTION_PROMPT = `You are an expert HR data extractor. Extract the following fields from the provided content (resume, notes, and/or voice audio).

Return ONLY a valid JSON object with exactly these fields (use null for any field you cannot find):
{
  "name": "full name of the candidate or null",
  "email": "email address or null",
  "phone": "phone number or null",
  "skills": "comma-separated list of skills or null",
  "desiredRole": "raw desired job title as written, or null",
  "desiredRoleCategory": "one of: HR, Sales, Backend Developer, Frontend Developer, Marketing, Operations, Customer Support — pick the closest match, or null",
  "salaryExpectation": "salary expectation as written (e.g. '8-10 LPA', '$120k', '15 LPA') or null",
  "noticePeriod": "notice period as written (e.g. 'immediate', '30 days', '2 months') or null",
  "wfhPreference": "one of: remote, hybrid, onsite, no_preference — or null",
  "relocationWillingness": true or false or null,
  "shiftPreference": "shift preference (e.g. 'day', 'night', 'flexible') or null",
  "careerInterests": "brief summary of long-term career interests or null"
}

Return ONLY the JSON object. No explanations, no markdown, no code blocks. Just the raw JSON.`;

export interface ExtractedInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string | null;
  desiredRole: string | null;
  desiredRoleCategory: string | null;
  salaryExpectation: string | null;
  noticePeriod: string | null;
  wfhPreference: string | null;
  relocationWillingness: boolean | null;
  shiftPreference: string | null;
  careerInterests: string | null;
}

interface FilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

interface TextPart {
  text: string;
}

type Part = FilePart | TextPart;

export async function extractCandidateInfo(parts: Part[]): Promise<ExtractedInfo> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const contentParts: Part[] = [{ text: EXTRACTION_PROMPT }, ...parts];

  try {
    const result = await model.generateContent(contentParts as any);
    const text = result.response.text().trim();

    // Strip markdown code blocks if present
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      name: parsed.name ?? null,
      email: parsed.email ?? null,
      phone: parsed.phone ?? null,
      skills: parsed.skills ?? null,
      desiredRole: parsed.desiredRole ?? null,
      desiredRoleCategory: ROLE_CATEGORIES.includes(parsed.desiredRoleCategory)
        ? parsed.desiredRoleCategory
        : null,
      salaryExpectation: parsed.salaryExpectation ?? null,
      noticePeriod: parsed.noticePeriod ?? null,
      wfhPreference: WFH_PREFS.includes(parsed.wfhPreference)
        ? parsed.wfhPreference
        : null,
      relocationWillingness:
        typeof parsed.relocationWillingness === "boolean"
          ? parsed.relocationWillingness
          : null,
      shiftPreference: parsed.shiftPreference ?? null,
      careerInterests: parsed.careerInterests ?? null,
    };
  } catch (err) {
    logger.error({ err }, "Gemini extraction failed");
    throw new Error("Failed to extract candidate info from provided files");
  }
}
