import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();
// Initialize Gemini SDK with the key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const semanticSearch = async (req: Request, res: Response) => {
  try {
    const { q, category } = req.body;

    // 1. Fetch all published articles with their categories
    const allArticles = await prisma.article.findMany({
      where: { 
        isPublished: true,
        ...(category && category !== 'All' ? { category: { name: category } } : {})
      },
      include: {
        author: { select: { firstName: true, lastName: true, profileImage: true } },
        category: { select: { name: true, slug: true } }
      },
      orderBy: { publishedAt: 'desc' }
    });

    if (!q || q.trim() === '') {
      return res.json(allArticles);
    }

    // 2. Prepare lightweight index for Gemini to save tokens
    const searchableIndex = allArticles.map(a => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category?.name || 'Uncategorized',
      author: `${a.author?.firstName || 'Unknown'} ${a.author?.lastName || ''}`
    }));

    // 3. Construct Prompt for Semantic Search
    const prompt = `
You are a highly intelligent semantic search engine for a blogging platform.
The user has searched for: "${q}"

Here is the JSON catalog of available articles:
${JSON.stringify(searchableIndex, null, 2)}

Task: Identify which articles best match the user's intent. 
You must respond with ONLY a raw JSON array of the article IDs (strings). 
Do NOT include markdown formatting, backticks, or any conversational text. 
If none match, respond with [].
Example valid response: ["cuid-1", "cuid-2"]
`;

    // 4. Query Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiResponseText = response.text || "[]";
    
    // 5. Parse AI Response safely
    let matchingIds: string[] = [];
    try {
      // Strip potential markdown backticks just in case
      const cleaned = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      matchingIds = JSON.parse(cleaned);
      if (!Array.isArray(matchingIds)) {
        matchingIds = [];
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", aiResponseText);
      matchingIds = [];
    }

    // 6. Filter original articles based on the IDs Gemini selected
    const searchResults = allArticles.filter(article => matchingIds.includes(article.id));

    res.json(searchResults);

  } catch (error) {
    console.error("Semantic Search Error:", error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
};
