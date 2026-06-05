import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    await connectDB();

    // Perform a case-insensitive regex search across multiple fields
    const searchRegex = new RegExp(query, 'i');
    
    const matchedArticles = await Article.find({
      status: 'Published',
      $or: [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } }
      ]
    }).sort({ publishedAt: -1 }).limit(20);

    return NextResponse.json({ success: true, data: matchedArticles });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
