import { Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuthReq } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export const generateBrief = async (req: AuthReq, res: Response) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new ApiError(500, "Gemini API key not configured");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const result = await model.generateContent(`You are an expert escrow project architect. Take the following client prompt and output a perfectly structured Project Brief.
          Format your response strictly as JSON with exactly these keys:
          {
            "title": "A short professional title",
            "description": "A detailed multi-line markdown string containing '## Project Overview', '## Suggested Milestones (with % breakdown)', and '## Requirements'"
          }
          
          Client Prompt: "${prompt}"
          
          Return ONLY valid JSON. No Markdown.`);

  const text = result.response.text().trim();
  let cleanedJson = text;
  if (cleanedJson.startsWith("\`\`\`json")) cleanedJson = cleanedJson.replace("\`\`\`json", "").replace("\`\`\`", "");
  if (cleanedJson.startsWith("\`\`\`")) cleanedJson = cleanedJson.replace("\`\`\`", "").replace("\`\`\`", "");
  cleanedJson = cleanedJson.trim();
  
  res.json(new ApiResponse(200, JSON.parse(cleanedJson), "Brief generated"));
};

export const generateMilestone = async (req: AuthReq, res: Response) => {
  const { projectTitle, projectDescription, existingMilestones } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new ApiError(500, "Gemini API key not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const result = await model.generateContent(`You are an expert project manager. Based on the project title "${projectTitle}" and description: "${projectDescription}".
          The following milestones already exist: ${existingMilestones.join(", ")}.
          Suggest ONE new professional milestone that would logically come next or fill a gap.
          Format your response strictly as JSON with exactly these keys:
          {
            "title": "A short professional milestone title",
            "suggestedAmount": "A suggested numeric value in INR (e.g. 5000), make it realistic based on the project scope"
          }
          Return ONLY valid JSON. No Markdown.`);

  const text = result.response.text().trim();
  let cleanedJson = text;
  if (cleanedJson.startsWith("\`\`\`json")) cleanedJson = cleanedJson.replace("\`\`\`json", "").replace("\`\`\`", "");
  if (cleanedJson.startsWith("\`\`\`")) cleanedJson = cleanedJson.replace("\`\`\`", "").replace("\`\`\`", "");
  cleanedJson = cleanedJson.trim();
  
  res.json(new ApiResponse(200, JSON.parse(cleanedJson), "Milestone suggested"));
};
