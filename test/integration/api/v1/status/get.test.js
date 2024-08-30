test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.updated_at).toBeDefined();
  const parsedResponse = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toBe(parsedResponse);
  const dbVersion = responseBody.dependencies.database.version;
  expect(dbVersion).toBeDefined();
  expect(dbVersion).not.toBeNull();
  const dbMaxConnections = responseBody.dependencies.database.max_connections;
  expect(dbMaxConnections).toBeDefined();
  expect(dbMaxConnections).not.toBeNull();
  expect(dbMaxConnections).toBeGreaterThan(0);
  expect(typeof dbMaxConnections).toBe("number");
  const dbOpenedConnections =
    responseBody.dependencies.database.opened_connections;
  expect(dbOpenedConnections).not.toBeNull();
  expect(dbOpenedConnections).toEqual(1);
});
