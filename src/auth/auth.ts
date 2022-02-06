import { Request, Response } from 'express';
import express = require('express');
import { AssociationUtilisateurDepartement } from '../account';
import { StatusCodes } from '../const';
import { RoleModel, Shadow, ShadowModel, User } from '../user';
const jwt = require('jsonwebtoken');

const SALT = 0x001012900;
const TOKEN_DEFAULT_EXPIRY = '1h';

export const secret = 'totaller';

export const generateAuthToken = (user: User) => {
  return jwt.sign(
    {
      identifiant: user.identifiant,
      expiresIn: TOKEN_DEFAULT_EXPIRY,
    },
    secret
  );
};

export const authenticate = async (req: Request, res: Response) => {
  const bodyShadow: Shadow = req.body as Shadow;
  const shadow: Shadow = await ShadowModel.findOne({
    where: {
      utilisateur: bodyShadow.utilisateur,
    },
  });

  if (shadow) {
    if (shadow.password !== bodyShadow.password) {
      res.status(StatusCodes.BadRequest).json({ error: 'Invalid credentials' });
      return;
    }

    let user = await User.findOne({
      where: {
        identifiant: shadow.utilisateur,
      },
      include: [
        { model: AssociationUtilisateurDepartement, as: 'departements' },
        { model: RoleModel, as: 'roles' },
      ],
    });

    if (user) {
      user = user.dataValues;
      user.departements = user.departements.map((d: any) => d.dataValues);
      user.roles = user.roles.map((r: any) => r.dataValues);
      const token = generateAuthToken(user);
      res.json({ ...user, token });
    }
  } else {
    res.status(StatusCodes.BadRequest).json({ error: 'Invalid credentials' });
  }
};

export const hashPassword = (req: Request, res: Response, context: any) => {
  if (req.body?.shadow?.password) {
    req.body.shadow.password =  req.body.shadow.password;
  }

  return context.continue;
};

export const authHook = (
  req: express.Request,
  res: express.Response,
  context: any
) => {
  return new Promise((resolve, reject) => {
    const success = authenticate(req, res);
    resolve(context.continue);
    if (!success) {
      resolve(context.stop);
    } else {
      resolve(context.continue);
    }
  });
};
