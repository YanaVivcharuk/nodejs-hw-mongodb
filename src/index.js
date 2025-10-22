import { setupServer } from './server.js';

setupServer().catch((error) => {
  console.error('Error starting server:', error);
});
