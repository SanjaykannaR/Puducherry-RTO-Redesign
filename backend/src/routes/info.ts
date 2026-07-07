import { Router, Request, Response } from 'express';

const router = Router();

const aboutData = {
  name: 'Puducherry RTO',
  description: 'Office of the Transport Commissioner, Puducherry',
  mission: 'To provide efficient, transparent, and citizen-centric transport services.',
  vision: 'A safe, sustainable, and digitally empowered transport ecosystem for Puducherry.',
  history: 'Established in 1963, the Puducherry RTO has been serving the Union Territory.',
  contact: {
    address: 'No. 1, Sardar Vallabhbhai Patel Salai, Puducherry - 605001',
    phone: '+91 413 222 1234',
    email: 'rto.py@gov.in',
    hours: 'Monday to Friday: 10:00 AM - 5:00 PM',
  },
};

router.get('/about', (_req: Request, res: Response) => {
  res.json(aboutData);
});

router.get('/faq', (_req: Request, res: Response) => {
  res.json({
    faqs: [
      {
        q: 'How do I book a driving test?',
        a: 'Log in to the portal, navigate to Services > Appointments, and select a slot.',
      },
      {
        q: 'What documents are needed for vehicle registration?',
        a: 'Proof of identity, address, vehicle invoice, insurance, and Form 20.',
      },
      {
        q: 'How can I check my challan status?',
        a: 'Use the Challan Status tool under Smart Services.',
      },
      {
        q: 'What is the fee for a learner\'s license?',
        a: 'The fee is ₹200 for the application plus ₹50 for the test.',
      },
    ],
  });
});

export default router;
