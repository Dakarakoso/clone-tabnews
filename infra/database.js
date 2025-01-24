import { Client } from "pg";
import { ServiceError } from "./errors.js";

async function query(ObjectQuery) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(ObjectQuery);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Error while connecting or querying the database",
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await client?.end();
  }
}

function getSslValue() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV === "production" ? true : false;
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSslValue(),
  });
  await client.connect();
  return client;
}
const database = {
  query,
  getNewClient,
};

export default database;
