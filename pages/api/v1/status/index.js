import database from "infra/database.js";

async function status(req, res) {
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
  console.log(openedConnections);

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: maxConnections,
        opened_connections: openedConnections,
        version: dbVersion,
      },
    },
  });
}

export default status;
