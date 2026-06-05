import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export async function POST(req: Request) {
  try {
    const { query, category } = await req.json();

    await connectDB();

    let dbQuery: any = { status: 'Published' };

    // Apply category filter
    if (category && category !== 'All') {
      dbQuery.category = category;
    }

    // Apply search filter if query exists
    if (query && typeof query === 'string' && query.trim() !== '') {
      const searchRegex = new RegExp(query, 'i');
      dbQuery.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } }
      ];
      // Note: we removed category from $or here because it's handled by the dropdown filter above
    }
    
    const matchedArticles = await Article.find(dbQuery)
      .sort({ publishedAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: matchedArticles });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
