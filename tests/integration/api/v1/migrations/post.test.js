import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("runnning pending migrations", () => {
      test("For the first time", async () => {
        const response1 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
        });
        expect(response1.status).toBe(403);
        const responseBody = await response1.json();
        expect(responseBody).toEqual({
          name: "ForbiddenError",
          message: "You do not have permission to perform this action.",
          action:
            "Please contact support if you believe this is an error. Or check if you the create:migration permission",
          statusCode: 403,
        });
      });
      test("For the second time", async () => {
        const response2 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
        });
        expect(response2.status).toBe(403);
        const responseBody2 = await response2.json();
        expect(responseBody2).toEqual({
          name: "ForbiddenError",
          message: "You do not have permission to perform this action.",
          action:
            "Please contact support if you believe this is an error. Or check if you the create:migration permission",
          statusCode: 403,
        });
      });
    });
    describe("Default user", () => {
      test("runnning pending migrations", async () => {
        const createUser = await orchestrator.createUser();
        const activateUser = await orchestrator.activateUser(createUser);
        const sessionObject = await orchestrator.createSession(activateUser);
        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
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
            "Please contact support if you believe this is an error. Or check if you the create:migration permission",
          statusCode: 403,
        });
      });
    });
    describe("Priveleged user", () => {
      test("runnning pending migrations with create:migration", async () => {
        const createUser = await orchestrator.createUser();
        const activateUser = await orchestrator.activateUser(createUser);
        await orchestrator.addFeaturesToUser(createUser, ["create:migration"]);
        const sessionObject = await orchestrator.createSession(activateUser);
        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
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
});
