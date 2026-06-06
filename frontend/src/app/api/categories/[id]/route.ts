import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Article from '@/models/Article';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    
    const searchParams = req.nextUrl.searchParams;
    const reassignToId = searchParams.get('reassignTo');
    
    const categoryToDelete = await Category.findById(resolvedParams.id);
    if (!categoryToDelete) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    if (reassignToId && reassignToId !== 'Uncategorized') {
      const newCategory = await Category.findById(reassignToId);
      if (newCategory) {
        await Article.updateMany(
          { category: categoryToDelete.name },
          { $set: { category: newCategory.name } }
        );
      }
    } else if (reassignToId === 'Uncategorized') {
      await Article.updateMany(
        { category: categoryToDelete.name },
        { $set: { category: 'Uncategorized' } }
      );
    }
    
    await Category.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
