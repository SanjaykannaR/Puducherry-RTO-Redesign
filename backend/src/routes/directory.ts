// ── Directory routes: RTO office listings ──
// Public endpoints listing all regional RTO offices under Puducherry UT
// Includes office contact details, services offered, and operating hours

import { Router, Request, Response } from 'express';

const router = Router();

// In-memory store of RTO offices across the four Puducherry regions
// Includes main office + Karaikal, Mahe, and Yanam sub-offices
let offices = [
  {
    id: 1,
    name: 'Puducherry RTO Main Office',
    address: 'No. 1, S.V. Patel Salai, Puducherry - 605001',
    phone: '+91 413 222 1234',
    email: 'rto.py@gov.in',
    services: ['Vehicle Registration', 'Driving License', 'Permits', 'Tax Collection'],
    hours: '10:00 AM - 5:00 PM',
  },
  {
    id: 2,
    name: 'Karaikal RTO',
    address: 'Government Complex, Karaikal - 609602',
    phone: '+91 4368 222 456',
    email: 'rto.kkl@gov.in',
    services: ['Vehicle Registration', 'Driving License', 'Tax Collection'],
    hours: '10:00 AM - 5:00 PM',
  },
  {
    id: 3,
    name: 'Mahe RTO',
    address: 'RTO Office, Mahe - 673310',
    phone: '+91 490 233 789',
    email: 'rto.mahe@gov.in',
    services: ['Vehicle Registration', 'Driving License'],
    hours: '10:00 AM - 4:30 PM',
  },
  {
    id: 4,
    name: 'Yanam RTO',
    address: 'RTO Office, Yanam - 533464',
    phone: '+91 884 232 012',
    email: 'rto.yanam@gov.in',
    services: ['Vehicle Registration', 'Driving License'],
    hours: '10:00 AM - 4:30 PM',
  },
];

// ── GET /api/directory ──
// Returns a complete list of all RTO offices
router.get('/', (_req: Request, res: Response) => {
  res.json({ offices });
});

// ── GET /api/directory/:id ──
// Returns details for a single office by its numeric ID
router.get('/:id', (req: Request, res: Response) => {
  const office = offices.find((o) => o.id === parseInt(req.params.id));
  if (!office) {
    res.status(404).json({ error: 'Office not found' });
    return;
  }
  res.json(office);
});

// Exported for admin routes to update the directory
export function setOffices(data: any) {
  offices = data;
}
export { offices };
export default router;
