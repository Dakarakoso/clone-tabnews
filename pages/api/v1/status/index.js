import database from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authorization from "models/authorization";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .handler(controller.errorHandlers);

async function getHandler(req, res) {
  const userTryingToGet = req.context.user;
  const updatedAt = new Date().toISOString();
  const dbVersionQuery = await database.query(
    "SELECT current_setting('server_version');",
  );
  const dbVersion = dbVersionQuery.rows[0].current_setting;
  const maxConnectionsQuery = await database.query("SHOW max_connections;");
  const maxConnections = parseInt(maxConnectionsQuery.rows[0].max_connections);
  const dbName = process.env.POSTGRES_DB;
  const openedConnectionsQuery = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [dbName],
  });
  const openedConnections = openedConnectionsQuery.rows[0].count;
  const unsecureOutputValues = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: maxConnections,
        opened_connections: openedConnections,
        version: dbVersion,
      },
    },
  };
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    unsecureOutputValues,
  );
  return res.status(200).json(secureOutputValues);
}
