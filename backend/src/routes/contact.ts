import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, message required' });
    return;
  }
  console.log('Contact form submission:', { name, email, phone, message });
  res.json({ message: 'Thank you for contacting us. We will get back to you shortly.' });
});

export default router;
