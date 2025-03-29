import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import globalTeamValidator from '../../../middlewares/portal/global-team-validator';

const router = express.Router({ mergeParams: true });

router.use('/', globalTeamValidator);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { _id, number, name, affiliation } = req.team;
    
    res.json({ id: String(_id), number, name, affiliation });
  })
);

export default router;