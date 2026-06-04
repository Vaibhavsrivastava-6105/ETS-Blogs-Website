import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing GEMINI_API_KEY environment variable. Please add it to your .env.local file.' }, { status: 500 });
    }

    await connectDB();

    // Fetch all published articles (limit to recent 50 to avoid token limits for this demo)
    const articles = await Article.find({ status: 'Published' }).sort({ publishedAt: -1 }).limit(50);
    
    if (articles.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Format articles for Gemini to read
    const articlesContext = articles.map(a => `ID: ${a._id}\nTitle: ${a.title}\nCategory: ${a.category}\nTags: ${a.tags.join(', ')}\nContent: ${a.content.substring(0, 300)}...`).join('\n\n');

    const prompt = `You are a semantic search engine. The user is searching for: "${query}".
Below is a list of articles.
Read the articles and return ONLY a JSON array of the IDs of the articles that are relevant to the user's search query. Do not return any other text, markdown blocks, or explanation, just the raw JSON array (e.g. ["id1", "id2"]). If none match, return [].

Articles:
${articlesContext}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    let matchedIds = [];
    try {
      // Clean up potential markdown formatting from Gemini response
      let cleanedText = responseText;
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      matchedIds = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return NextResponse.json({ success: false, error: 'Failed to process AI response' }, { status: 500 });
    }

    if (!Array.isArray(matchedIds) || matchedIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch the full matched articles from MongoDB and preserve AI ranking order
    const matchedArticles = await Article.find({ _id: { $in: matchedIds } });
    
    // Sort them in the exact order Gemini returned them
    const sortedMatches = matchedIds
      .map(id => matchedArticles.find(a => a._id.toString() === id))
      .filter(a => a !== undefined);

    return NextResponse.json({ success: true, data: sortedMatches });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
