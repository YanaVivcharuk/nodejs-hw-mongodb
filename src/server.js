import 'dotenv/config';
import { initMongoConnection } from './db/initMongoConnection.js';
import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import routes from './routers/index.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(pino());

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome to Contacts API!');
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export async function setupServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log('Error:', error);
  }
}

setupServer();

export default app;
