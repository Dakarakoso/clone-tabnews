import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PACTH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique `username`", async () => {
      const uniqueUser = await orchestrator.createUser({
        username: "uniqueUser1",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          "Please contact support if you believe this is an error. Or check if you the update:user permission",
        message: "You do not have permission to perform this action.",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
  });
  describe("Default user", () => {
    test("With  nonexistent `username`", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObj = await orchestrator.createSession(activatedUser.id);
      const response = await fetch(
        `${webserver.origin}/api/v1/users/nonexistent`,
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${sessionObj.token}`,
          },
        },
      );
      expect(response.status).toBe(404);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Username not Found",
        action: "check if the username is corret",
        statusCode: 404,
      });
    });
    test("With duplicated `username`", async () => {
      await orchestrator.createUser({
        username: "user1",
      });
      const createdUser2 = await orchestrator.createUser({
        username: "user2",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObj2 = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch(`${webserver.origin}/api/v1/users/user2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObj2.token}`,
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "duplicated username",
        action: "use a different username",
        statusCode: 400,
      });
    });
    test("user2 targeting user1", async () => {
      await orchestrator.createUser({
        username: "user11",
      });
      const createdUser2 = await orchestrator.createUser({
        username: "user22",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObj2 = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch(`${webserver.origin}/api/v1/users/user11`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObj2.token}`,
        },
        body: JSON.stringify({
          username: "user3q",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          "Please contact support if you believe this is an error. Or check if you the update:user permission",
        message: "You do not have permission to update this user.",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
    test("With duplicated `email`", async () => {
      await orchestrator.createUser({
        email: "duplicatedEmail1@curso.dev",
      });
      const createdUser2 = await orchestrator.createUser({
        email: "duplicatedEmail2@curso.dev",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObj2 = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj2.token}`,
          },
          body: JSON.stringify({
            email: "duplicatedEmail1@curso.dev",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "duplicated email",
        action: "use a different email",
        statusCode: 400,
      });
    });
    test("With unique `username`", async () => {
      const uniqueUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(uniqueUser);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With unique `email`", async () => {
      const uniqueEmail = await orchestrator.createUser({
        email: "uniqueEmail@curso.dev",
      });
      const activatedUser = await orchestrator.activateUser(uniqueEmail);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${uniqueEmail.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmail2@curso.dev",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: uniqueEmail.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With new `password`", async () => {
      const userWithNewPassword = await orchestrator.createUser({
        password: "password",
      });
      const activatedUser =
        await orchestrator.activateUser(userWithNewPassword);
      const sessionObj = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${userWithNewPassword.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObj.token}`,
          },
          body: JSON.stringify({
            password: "newPassword123",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userWithNewPassword.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername(
        userWithNewPassword.username,
      );
      const correctPasswordMatch = await password.compare(
        "newPassword123",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
  describe("Privileged user", () => {
    test("With `update:user:other` targeting `defaultUser`", async () => {
      const privilegedUser = await orchestrator.createUser();
      const activatedPrivilegedUser =
        await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(privilegedUser, [
        "update:user:others",
      ]);

      const privelegedUserSession = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      );
      const defaultUser = await orchestrator.createUser();
      const response = await fetch(
        `${webserver.origin}/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${privelegedUserSession.token}`,
          },
          body: JSON.stringify({
            username: "changedByPrivilegedUser",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: defaultUser.id,
        username: "changedByPrivilegedUser",
        features: defaultUser.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
