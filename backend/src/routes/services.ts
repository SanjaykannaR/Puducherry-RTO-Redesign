import { Router, Request, Response } from 'express';

const router = Router();

let services = [
  {
    id: 'vehicle-registration',
    title: 'Vehicle Registration',
    description: 'Register new or used vehicles in Puducherry.',
    category: 'registration',
    icon: 'Car',
    link: '/services/vehicle-registration',
  },
  {
    id: 'driving-license',
    title: 'Driving License',
    description: 'Apply for learner\'s or permanent driving license.',
    category: 'license',
    icon: 'FileText',
    link: '/services/driving-license',
  },
  {
    id: 'appointment',
    title: 'Book Appointment',
    description: 'Schedule visits for tests, renewals, and inquiries.',
    category: 'appointment',
    icon: 'Calendar',
    link: '/services/appointment',
  },
  {
    id: 'fee-calculator',
    title: 'Fee Calculator',
    description: 'Calculate RTO fees for various services.',
    category: 'tools',
    icon: 'Calculator',
    link: '/services/fee-calculator',
  },
  {
    id: 'application-status',
    title: 'Application Status',
    description: 'Track your application status in real-time.',
    category: 'tools',
    icon: 'Search',
    link: '/services/application-status',
  },
  {
    id: 'challan',
    title: 'Challan / Traffic Violation',
    description: 'View and pay traffic challans online.',
    category: 'tools',
    icon: 'Receipt',
    link: '/services/challan',
  },
  {
    id: 'vehicle-status',
    title: 'Vehicle Lifecycle Status',
    description: 'Check RC status, fitness, insurance, and PUC expiry.',
    category: 'tools',
    icon: 'Activity',
    link: '/services/vehicle-status',
  },
  {
    id: 'download-forms',
    title: 'Download Forms',
    description: 'Download RTO application forms in PDF format.',
    category: 'information',
    icon: 'Download',
    link: '/services/download-forms',
  },
];

router.get('/', (_req: Request, res: Response) => {
  res.json({ services });
});

router.get('/:id', (req: Request, res: Response) => {
  const service = services.find((s) => s.id === req.params.id);
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(service);
});

export function setServices(data: any) {
  services = data;
}
export { services };
export default router;
