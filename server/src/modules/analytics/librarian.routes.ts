import { Router, Request, Response } from 'express';
import { LibrarianService } from './librarian.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const dashboard = await LibrarianService.getDashboard(institutionId);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/books', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const { search, category, availability } = req.query;
    const books = await LibrarianService.getBooks(institutionId, {
      search: search as string,
      category: category as string,
      availability: availability as 'available' | 'unavailable',
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/books/:id', async (req: Request, res: Response) => {
  try {
    const book = await LibrarianService.getBookDetail(req.params.id as string);
    res.json(book);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

router.post('/books', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const book = await LibrarianService.createBook(institutionId, req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.patch('/books/:id', async (req: Request, res: Response) => {
  try {
    const book = await LibrarianService.updateBook(req.params.id as string, req.body);
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/books/:id', async (req: Request, res: Response) => {
  try {
    const result = await LibrarianService.deleteBook(req.params.id as string);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

router.post('/issues', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const issue = await LibrarianService.issueBook(institutionId, req.body);
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.patch('/issues/:id/return', async (req: Request, res: Response) => {
  try {
    const issue = await LibrarianService.returnBook(req.params.id as string, req.body);
    res.json(issue);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.patch('/issues/:id/renew', async (req: Request, res: Response) => {
  try {
    const issue = await LibrarianService.renewBook(req.params.id as string);
    res.json(issue);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/issues', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const { status } = req.query;
    const issues = await LibrarianService.getIssues(institutionId, {
      status: status as any,
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const overdue = await LibrarianService.getOverdueBooks(institutionId);
    res.json(overdue);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/fines/:id/collect', async (req: Request, res: Response) => {
  try {
    const result = await LibrarianService.collectFine(req.params.id as string, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/fines', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const fines = await LibrarianService.getFines(institutionId);
    res.json(fines);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/members', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const members = await LibrarianService.getMembers(institutionId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const categories = await LibrarianService.getCategories(institutionId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const analytics = await LibrarianService.getAnalytics(institutionId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/activities', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user as { institutionId: string };
    const activities = await LibrarianService.getActivities(institutionId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
