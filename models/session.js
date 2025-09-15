import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; //30 Days

async function findOneValidByToken(token) {
  const sessionFound = runSelectQuery(token);
  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT 
        1
      ;`,
      values: [sessionToken],
    });
    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "user doesn't have valid session",
        action: "Check your session or login again",
      });
    }

    return results.rows[0];
  }
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await runInsertQuery(token, userId, expiresAt);
  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions(token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [token, userId, expiresAt],
    });
    return results.rows[0];
  }
  return newSession;
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const renwedSessionObject = runUpdateQuery(sessionId, expiresAt);
  return renwedSessionObject;

  async function runUpdateQuery(sessionId, expiresAt) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [sessionId, expiresAt],
    });

    return results.rows[0];
  }
}

async function expireById(sessionId) {
  const results = await database.query({
    text: `
      UPDATE
        sessions
      SET
        expires_at = expires_at - INTERVAL '1 year',
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING
        *
      ;`,
    values: [sessionId],
  });
  return results.rows[0];
}

const session = {
  create,
  findOneValidByToken,
  EXPIRATION_IN_MILLISECONDS,
  renew,
  expireById,
};

export default session;
