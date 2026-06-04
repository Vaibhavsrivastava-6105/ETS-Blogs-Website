import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const draft = await Draft.findById(params.id);
    if (!draft) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: draft });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedDraft = await Draft.findByIdAndDelete(params.id);
    if (!deletedDraft) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
