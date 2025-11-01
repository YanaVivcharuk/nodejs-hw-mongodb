import 'dotenv/config';
import { initMongoConnection } from './db/initMongoConnection.js';
import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import routes from './routers/index.js';
import cookieParser from 'cookie-parser';
import { UPLOAD_DIR } from './constants/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { SWAGGER_PATH } from './constants/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerDocument = JSON.parse(fs.readFileSync(SWAGGER_PATH, 'utf8'));

app.use(cors());

app.use(pino());

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Welcome to Contacts API!');
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export async function setupServer() {
  try {
    await initMongoConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.log('Error:', error);
  }
}

export default app;
