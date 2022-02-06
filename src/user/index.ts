import { Request, Response } from 'express';
import { authMiddleware, hashPassword } from '../auth';
import { User } from './user';

export * from './user';

export const setupUserEndpoint = (finale: any) => {
  const userResource = finale.resource({
    model: User,
    associations: true,
    endpoints: ['/users', '/users/:identifiant'],
  });
  userResource.create.write.before(hashPassword);
  userResource.update.write.before(hashPassword);
  userResource.list.fetch.before(
    (req: Request, res: Response, context: any) => {
      context.shallow = true;
      return context.continue;
    }
  );
  userResource.all.auth(authMiddleware);
};
