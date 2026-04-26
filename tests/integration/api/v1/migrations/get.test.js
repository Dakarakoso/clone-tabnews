import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "You do not have permission to perform this action.",
        action:
          "Please contact support if you believe this is an error. Or check if you the read:migration permission",
        statusCode: 403,
      });
    });
  });
  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const createUser = await orchestrator.createUser();
      const activateUser = await orchestrator.activateUser(createUser);
      const sessionObject = await orchestrator.createSession(activateUser.id);
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "You do not have permission to perform this action.",
        action:
          "Please contact support if you believe this is an error. Or check if you the read:migration permission",
        statusCode: 403,
      });
    });
  });
  describe("Priveleged user", () => {
    test("Retrieving pending migrations with read:migration", async () => {
      const createUser = await orchestrator.createUser();
      const activateUser = await orchestrator.activateUser(createUser);
      await orchestrator.addFeaturesToUser(createUser, ["read:migration"]);
      const sessionObject = await orchestrator.createSession(activateUser.id);
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
