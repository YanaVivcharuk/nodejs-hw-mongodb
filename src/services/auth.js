import createHttpError from 'http-errors';
import * as fs from 'node:fs';
import path from 'node:path';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, SMTP, THIRTY_DAYS } from '../constants/index.js';
import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import { getEnvVariable } from '../utils/getEnvVariable.js';
import Handlebars from 'handlebars';
import { sendEmail } from '../utils/sendMail.js';

const REQUEST_PASSWORD_RESET_TEMPLATE = fs.readFileSync(
  path.resolve('src/templates/reset-password.html'),
  { encoding: 'UTF-8' },
);

export const registerUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });

  if (user !== null) {
    throw createHttpError.Conflict('Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return User.create({ ...payload, password: encryptedPassword });
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (user === null) {
    throw createHttpError(401, 'User not found');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await Session.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

const createSessionTokens = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Refresh token expired');
  }

  const tokens = createSessionTokens();

  session.accessToken = tokens.accessToken;
  session.refreshToken = tokens.refreshToken;
  session.accessTokenValidUntil = tokens.accessTokenValidUntil;
  session.refreshTokenValidUntil = tokens.refreshTokenValidUntil;
  await session.save();

  return {
    sessionId: session._id,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign(
    { sub: user._id, email },
    getEnvVariable('JWT_SECRET'),
    { expiresIn: '5m' },
  );

  const appDomain = getEnvVariable('APP_DOMAIN');
  const resetLink = `${appDomain}/reset-password?token=${token}`;

  const template = Handlebars.compile(REQUEST_PASSWORD_RESET_TEMPLATE);

  try {
    await sendEmail({
      from: getEnvVariable(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset password instruction',
      html: template({ resetPasswordLink: resetLink }),
    });
  } catch (error) {
    console.error('Failed to send the email:', error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  return true;
};

export async function resetPassword(token, password) {
  try {
    const decoded = jwt.verify(token, getEnvVariable('JWT_SECRET'));

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(decoded.sub, {
      password: hashedPassword,
    });

    if (!user) {
      throw createHttpError.NotFound('User not found!');
    }

    await Session.deleteMany({ userId: decoded.sub });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      throw createHttpError.Unauthorized('Token is expired or invalid.');
    }
    throw error;
  }
}
