import 'dotenv/config';
import { initMongoConnection } from './db/initMongoConnection.js';
import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(pino());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Contacts API!');
});

app.use('/contacts', contactsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export async function setupServer() {
  try {
    await initMongoConnection();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log('Error:', error);
  }
}

export default app;
