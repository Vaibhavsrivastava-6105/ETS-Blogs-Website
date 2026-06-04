import { Router } from 'express';
import { getArticles, getArticleBySlug, saveDraft, publishArticle } from '../controllers/articleController';
import { semanticSearch } from '../controllers/searchController';

const router = Router();

// Public Routes
router.post('/search', semanticSearch);
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// Protected Routes (Assuming Auth Middleware will be added later)
router.post('/draft', saveDraft);
router.post('/publish', publishArticle);

export default router;
