import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);
      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      //session renewal assertions
      const renwedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );
      expect(renwedSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renwedSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );

      //set cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentSessionToken =
        "56096375a01d096e8c45d1a979aa8d13082b7b05a4455130a3b344c4431b7e998b5045164cfe3f62145d391bc65fd78e";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${nonexistentSessionToken}`,
        },
      });
      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "user doesn't have valid session",
        action: "Check your session or login again",
        statusCode: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });
      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);
      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "user doesn't have valid session",
        action: "Check your session or login again",
        statusCode: 401,
      });
    });
    test("With halfway session", async () => {
      const halfwaySession = session.EXPIRATION_IN_MILLISECONDS / 2;
      jest.useFakeTimers({
        now: new Date(Date.now() - halfwaySession),
      });
      const createdUser = await orchestrator.createUser({
        username: "UserWithHalfLifeSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithHalfLifeSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      //session renewal assertions
      const renwedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );
      expect(renwedSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renwedSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );

      //set cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
