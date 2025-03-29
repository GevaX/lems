import { NextFunction, Request, Response } from 'express';
import * as db from '@lems/database';

const globalTeamValidator = async (req: Request, res: Response, next: NextFunction) => {
  const team = await db.getTeam({
    number: Number(req.params.teamNumber)
  });
  if (!team) return res.status(404).json({ error: 'Team not found' });

  req.team = team;
  req.teamNumber = team.number;

  return next();
};

export default globalTeamValidator;
