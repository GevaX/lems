import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { JudgingRoom } from '@lems/types';

export const getRoom = (filter: Filter<JudgingRoom>) => {
  return db.collection<JudgingRoom>('rooms').findOne(filter);
};

export const getEventRooms = (eventId: ObjectId) => {
  return db.collection<JudgingRoom>('rooms').find({ event: eventId }).toArray();
};

export const addRoom = (room: JudgingRoom) => {
  return db
    .collection<JudgingRoom>('rooms')
    .insertOne(room)
    .then(response => response);
};

export const addRooms = (rooms: JudgingRoom[]) => {
  return db
    .collection<JudgingRoom>('rooms')
    .insertMany(rooms)
    .then(response => response);
};

export const updateRoom = (filter: Filter<JudgingRoom>, newRoom: Partial<JudgingRoom>) => {
  return db.collection<JudgingRoom>('rooms').updateOne(filter, { $set: newRoom }, { upsert: true });
};

export const deleteRoom = (filter: Filter<JudgingRoom>) => {
  return db
    .collection<JudgingRoom>('rooms')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventRooms = (eventId: ObjectId) => {
  return db
    .collection<JudgingRoom>('rooms')
    .deleteMany({ event: eventId })
    .then(response => response);
};
