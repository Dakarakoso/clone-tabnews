import { Client } from "pg";

async function query(ObjectQuery) {
  const client = new Client();
  await client.connect();
  const result = await client.query(ObjectQuery);
  await client.end();
  return result;
}

export default {
  query: query,
};
