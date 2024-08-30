import database from "infra/database.js";

async function status(req, res) {
  const updatedAt = new Date().toISOString();
  const dbVersionQuery = await database.query(
    "SELECT current_setting('server_version');",
  );
  const dbVersion = dbVersionQuery.rows[0].current_setting;
  const maxConnectionsQuery = await database.query("SHOW max_connections;");
  const maxConnections = parseInt(maxConnectionsQuery.rows[0].max_connections);
  const openedConnectionsQuery = await database.query(
    "SELECT COUNT(*) AS open_connections FROM pg_stat_activity;",
  );
  const openedConnections = parseInt(
    openedConnectionsQuery.rows[0].open_connections,
  );
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
