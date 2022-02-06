export * from './auth';

import { Request, Response } from 'express';
import { StatusCodes } from '../const';
import { secret } from './auth';

const jwt = require('jsonwebtoken');

export const authMiddleware = (req: Request, res: Response, context: any) => {
  return new Promise((resolve: any, reject: any) => {
    const token =
      req.headers['x-access-token'] ||
      req.cookies['x-access-token'] ||
      req.headers.authorization;

    resolve(context.continue); // Hide when bellow code is uncommented
    
    /*
    if (!token) {
      res
        .status(StatusCodes.Forbidden)
        .send('Access denied. No token provided');
      resolve(context.stop);
      return;
    }

    try {
      jwt.verify(token, secret);
      resolve(context.continue);
    } catch (e: any) {
      res.sendStatus(StatusCodes.BadRequest);
      resolve(context.stop);
    }
    */
  });
};
