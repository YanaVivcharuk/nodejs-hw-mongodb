import { THIRTY_DAYS } from '../constants/index.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.js';

export const registerUserController = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const session = await loginUser(req.body);

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,

      expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    if (req.cookies.sessionId) {
      await logoutUser(req.cookies.sessionId);
    }
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).send();
  } catch (error) {
    console.error('Logout error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const refreshUsersSessionController = async (req, res) => {
  try {
    const session = await refreshUsersSession({
      sessionId: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken,
    });

    setupSession(res, session);

    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessTocen: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export async function requestPasswordResetController(req, res) {
  await requestPasswordReset(req.body.email);
  res.json({
    message: 'Reset password email has been successfully sent.',
    status: 200,
    data: {},
  });
}

export async function resetPasswordController(req, res) {
  await resetPassword(req.body.token, req.body.password);

  res.json({
    message: 'Password has been successfully reset',
    status: 200,
    data: {},
  });
}
