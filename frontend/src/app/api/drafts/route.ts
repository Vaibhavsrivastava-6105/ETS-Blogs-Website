import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';

export async function GET() {
  try {
    await connectDB();
    const drafts = await Draft.find({}).sort({ lastSaved: -1 });
    return NextResponse.json({ success: true, data: drafts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Check if updating an existing draft or creating a new one
    if (body.id) {
      const updatedDraft = await Draft.findByIdAndUpdate(
        body.id, 
        { title: body.title, content: body.content, lastSaved: new Date() },
        { new: true, runValidators: true }
      );
      if (updatedDraft) {
        return NextResponse.json({ success: true, data: updatedDraft });
      }
    }

    // If no ID or draft not found, create a new one
    const newDraft = await Draft.create({
      title: body.title || 'Untitled Draft',
      content: body.content,
    });
    return NextResponse.json({ success: true, data: newDraft }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
