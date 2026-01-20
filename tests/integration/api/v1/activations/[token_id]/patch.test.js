import activation from "models/activation";
import user from "models/user";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/activations/[token_id]", () => {
  describe("Anonymous user", () => {
    test("With non-existing activation token", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/activations/256bc49a-132a-42e4-8334-998fd17ee71e",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Activation token not found or is no longer valid.",
        action: "Please request a new activation token.",
        statusCode: 404,
      });
    });
    test("With expired activation token", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILLISECONDS),
      });
      const createdUser = await orchestrator.createUser();
      const expiredActivationToken = await activation.create(createdUser.id);
      jest.useRealTimers();
      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${expiredActivationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Activation token not found or is no longer valid.",
        action: "Please request a new activation token.",
        statusCode: 404,
      });
    });
    test("with already used activation token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await activation.create(createdUser.id);

      const response1 = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response1.status).toBe(200);
      const response2 = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(response2.status).toBe(404);
      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Activation token not found or is no longer valid.",
        action: "Please request a new activation token.",
        statusCode: 404,
      });
    });
    test("with invalid activation token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await activation.create(createdUser.id);

      const response1 = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(response1.status).toBe(200);
      const responseBody1 = await response1.json();
      expect(responseBody1).toEqual({
        id: activationToken.id,
        used_at: responseBody1.used_at,
        user_id: createdUser.id,
        expires_at: activationToken.expires_at.toISOString(),
        created_at: activationToken.created_at.toISOString(),
        updated_at: responseBody1.updated_at,
      });

      expect(uuidVersion(responseBody1.id)).toBe(4);
      expect(uuidVersion(responseBody1.user_id)).toBe(4);

      expect(Date.parse(responseBody1.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody1.updated_at)).not.toBeNaN();
      expect(Date.parse(responseBody1.expires_at)).not.toBeNaN();
      expect(responseBody1.updated_at > responseBody1.created_at).toBe(true);

      const expiresAt = new Date(responseBody1.expires_at);
      const createdAt = new Date(responseBody1.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(activation.EXPIRATION_IN_MILLISECONDS);

      const activatedUser = await user.findOneById(responseBody1.user_id);
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
        "update:user",
      ]);
    });
    test("with valid token but already activated user", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const activationToken = await activation.create(createdUser.id);
      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(403);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "you cannot use this activation token",
        action: "contact support if you believe this is an error",
        statusCode: 403,
      });
    });
  });
  describe("Default user", () => {
    test("with valid token, but already logged in", async () => {
      const createdUser1 = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser1);
      const user1SessionObject = await orchestrator.createSession(
        createdUser1.id,
      );

      const createdUser2 = await orchestrator.createUser();
      const user2ActivationToken = await activation.create(createdUser2.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${user2ActivationToken.id}`,
        {
          headers: {
            Cookie: `session_id=${user1SessionObject.token}`,
          },
          method: "PATCH",
        },
      );
      expect(response.status).toBe(403);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "You do not have permission to perform this action.",
        action:
          "Please contact support if you believe this is an error. Or check if you the read:activation_token permission",
        statusCode: 403,
      });
    });
  });
});
