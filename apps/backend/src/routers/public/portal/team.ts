import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import globalTeamValidator from '../../../middlewares/portal/global-team-validator';
import * as db from '@lems/database';
import { ObjectId } from 'mongodb';

const router = express.Router({ mergeParams: true });

router.use('/', globalTeamValidator);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { _id, number, name, affiliation } = req.team;

    res.json({ id: String(_id), number, name, affiliation });
  })
);

router.get(
  '/events',
  asyncHandler(async (req: Request, res: Response) => {
    const eventOIDs = await db.getTeamEvents(req.team.number);
    const divisions = await db.getDivisonsOID(eventOIDs);

    const detailedDivisions = await Promise.all(
      divisions.map(async (division) => {
        const event = await db.getFllEvent({ _id: new ObjectId(division.eventId) });
        return {
          id: String(division._id),
          name: event?.name ?? 'Unknown Event',
          color: division.color,
          date: event?.startDate,
          location: event?.location,
          isDivision: event?.enableDivisions,
          subtitle: event?.enableDivisions ? `בית ${division.name}` : undefined,
          routing: division.routing,
        };
      })
    );

    res.json(detailedDivisions);
  })
);

export default router;