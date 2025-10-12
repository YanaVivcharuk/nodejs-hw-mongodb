import mongoose from 'mongoose';

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } = process.env;

const URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

async function initMongoConnection() {
  await mongoose.connect(URI);
  console.log('Mongo connection successfully established!');
}

export { initMongoConnection };
