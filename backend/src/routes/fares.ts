import { Router, Request, Response } from 'express';

const router = Router();

// Fee structure based on Puducherry RTO official rates
let feeStructure = {
  driving_license: [
    { type: 'Learner\'s License Application', fee: 200 },
    { type: 'Learner\'s License Test', fee: 50 },
    { type: 'Permanent License (MCWG)', fee: 500 },
    { type: 'Permanent License (LMV)', fee: 500 },
    { type: 'International Driving Permit', fee: 1000 },
    { type: 'License Renewal', fee: 400 },
    { type: 'Duplicate License', fee: 300 },
  ],
  vehicle_registration: [
    { type: 'New Registration (MC, MCWG)', fee: 1500 },
    { type: 'New Registration (LMV)', fee: 3000 },
    { type: 'New Registration (Commercial)', fee: 5000 },
    { type: 'Transfer of Ownership', fee: 500 },
    { type: 'Duplicate RC', fee: 300 },
    { type: 'Hypothecation Termination', fee: 200 },
  ],
  permits: [
    { type: 'National Permit (Goods)', fee: 5000 },
    { type: 'National Permit (Passenger)', fee: 7500 },
    { type: 'State Permit', fee: 2000 },
    { type: 'Tourist Permit', fee: 3000 },
  ],
  taxes: [
    { type: 'One-time Tax (MC < 15 HP)', fee: 500 },
    { type: 'One-time Tax (MC 15-25 HP)', fee: 1000 },
    { type: 'One-time Tax (MC > 25 HP)', fee: 2000 },
    { type: 'Quarterly Tax (Commercial)', fee: 1500 },
  ],
};

router.get('/', (_req: Request, res: Response) => {
  res.json(feeStructure);
});

export function setFeeStructure(data: any) {
  feeStructure = data;
}
export { feeStructure };
export default router;
