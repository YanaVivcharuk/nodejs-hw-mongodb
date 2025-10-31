import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import fs from 'node:fs';
import { SWAGGER_PATH } from '../constants/index.js';

export const swaggerDocs = () => {
  try {
    const swaggerData = fs.readFileSync(SWAGGER_PATH, 'utf8');
    const swaggerJson = JSON.parse(swaggerData);
    return (req, res, next) => {
      swaggerUI.serve(req, res, () =>
        swaggerUI.setup(swaggerJson)(req, res, next),
      );
    };
  } catch (err) {
    console.error('Swagger load error', err.message);
    return (req, res, next) =>
      next(createHttpError(500, 'Cant load swagger docs'));
  }
};
