import authorization from "models/authorization.js";
import { InternalServerError } from "infra/errors.js";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without user", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });
    test("without user features", () => {
      const user = {
        username: "test",
      };
      expect(() => {
        authorization.can(user);
      }).toThrow(InternalServerError);
    });
    test("with unknown feature", () => {
      const user = {
        username: "test",
        features: [],
      };
      expect(() => {
        authorization.can(user, "unknown:feature");
      }).toThrow(InternalServerError);
    });
    test("with available feature", () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(authorization.can(createdUser, "read:user")).toBe(true);
    });
  });
  describe(".filterOutput()", () => {
    test("without user", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });
    test("without user features", () => {
      const user = {
        username: "test",
      };
      expect(() => {
        authorization.filterOutput(user);
      }).toThrow(InternalServerError);
    });
    test("with unknown feature", () => {
      const user = {
        username: "test",
        features: [],
      };
      expect(() => {
        authorization.filterOutput(user, "unknown:feature");
      }).toThrow(InternalServerError);
    });
    test("with user, known feature but no resource", () => {
      const user = {
        username: "test",
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(user, "read:user");
      }).toThrow(InternalServerError);
    });
    test("with available feature", () => {
      const createdUser = {
        features: ["read:user"],
      };
      const resource = {
        id: 1,
        username: "test",
        features: ["read:user"],
        created_at: new Date(),
        updated_at: new Date(),
      };
      const filteredOutput = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );
      expect(filteredOutput).toEqual({
        id: resource.id,
        username: resource.username,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      });
    });
  });
});
