import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: req.user!.userId },
  });
  res.json({ vehicles });
});

router.get('/search/:regNo', async (req: AuthRequest, res: Response) => {
  const regNo = req.params.regNo as string;
  const vehicle = await prisma.vehicle.findUnique({
    where: { registrationNo: regNo },
  });
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }
  res.json(vehicle);
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, ownerId: req.user!.userId },
  });
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }
  res.json(vehicle);
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { registrationNo, chassisNo, engineNo, make, model, manufactureYear, fuelType, color, ownerName, ownerAddress, insuranceUpto, taxPaidUpto } = req.body;
  if (!registrationNo || !chassisNo || !engineNo || !make || !model || !manufactureYear || !fuelType || !color) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNo, chassisNo, engineNo, make, model,
      manufactureYear, fuelType, color,
      ownerName: ownerName || req.user!.userId,
      ownerAddress: ownerAddress || '',
      insuranceUpto: new Date(insuranceUpto),
      taxPaidUpto: new Date(taxPaidUpto),
      ownerId: req.user!.userId,
    },
  });
  res.status(201).json(vehicle);
});

export default router;
