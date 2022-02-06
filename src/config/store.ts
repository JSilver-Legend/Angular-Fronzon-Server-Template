import { Db, MongoClient } from "mongodb";

const url = process.env.MONGO_DB_URL || 'mongodb://localhost:27018';
const database = process.env.MONGO_DB_DATABASE || 'frozen';

export let client: MongoClient;
export let configStore: Db;

export const ready = (async () => {
  try {
    client = await new MongoClient(url, { useUnifiedTopology: true }).connect();

    configStore = client.db(database);
  } catch (e: any) {
    console.error(e);
    return false;
  }
  return true;
})();
