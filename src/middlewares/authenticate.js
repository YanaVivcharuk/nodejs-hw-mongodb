import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw createHttpError(401, 'Please provide Authorization header');
  }

  const bearer = authHeader.split(' ')[0];
  const token = authHeader.split(' ')[1];

  if (bearer !== 'Bearer' || !token) {
    throw createHttpError(401, 'Please provide valid Authorization header');
  }

  const session = await Session.findOne({ accessToken: token });
  console.log('Session found:', session);

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);
  console.log(isAccessTokenExpired);
  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }

  const user = await User.findById(session.userId);
  console.log('User found:', user);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  req.user = user;
  req.session = session;
  next();
};
