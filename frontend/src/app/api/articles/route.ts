import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export async function GET() {
  try {
    await connectDB();
    const articles = await Article.find({}).sort({ publishedAt: -1 });
    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Convert tags from comma separated string to array if needed
    let parsedTags = body.tags;
    if (typeof body.tags === 'string') {
      parsedTags = body.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }

    const newArticle = await Article.create({
      title: body.title,
      content: body.content,
      category: body.category,
      tags: parsedTags,
      coverImage: body.coverImage,
    });

    return NextResponse.json({ success: true, data: newArticle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
