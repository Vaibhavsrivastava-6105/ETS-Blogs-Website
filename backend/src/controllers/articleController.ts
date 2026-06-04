import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch all articles
export const getArticles = async (req: Request, res: Response) => {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      include: {
        author: { select: { firstName: true, lastName: true, profileImage: true } },
        category: { select: { name: true, slug: true } }
      },
      orderBy: { publishedAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

// Fetch single article by slug
export const getArticleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { firstName: true, lastName: true, profileImage: true, bio: true } },
        category: true,
        tags: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Save Draft (Auto-save)
export const saveDraft = async (req: Request, res: Response) => {
  try {
    const { id, title, content, authorId } = req.body;

    let draft;
    if (id) {
      // Update existing draft
      draft = await prisma.draft.update({
        where: { id },
        data: { title, content, lastSavedAt: new Date() }
      });
    } else {
      // Create new draft
      draft = await prisma.draft.create({
        data: {
          title,
          content,
          authorId, // Ensure author exists in DB beforehand
        }
      });
    }

    res.json({ message: 'Draft saved successfully', draft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
};

// Publish Article
export const publishArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, coverImage, authorId, categoryId } = req.body;

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        isPublished: true,
        publishedAt: new Date(),
        authorId,
        categoryId
      }
    });

    res.status(201).json({ message: 'Article published successfully', article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to publish article' });
  }
};
