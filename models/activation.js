import database from "infra/database";
import email from "infra/email.js";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          user_activation_tokens
        WHERE 
          user_id = $1
        ORDER BY 
          created_at DESC
        LIMIT 1
      ;`,
      values: [userId],
    });
    return results.rows[0];
  }
}

async function create(userId) {
  const expires_at = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(userId, expires_at);
  return newToken;

  async function runInsertQuery(userId, expires_at) {
    const results = await database.query({
      text: `
        INSERT INTO 
          user_activation_tokens (user_id, expires_at)
        VALUES 
          ($1, $2)
        RETURNING 
          *
      ;`,
      values: [userId, expires_at],
    });
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Support <contato@fintab.com.br>",
    to: user.email,
    subject: "Activate your account",
    text: `${user.username} please activate your account by clicking the link: 

${webserver.origin}/register/activate/${activationToken.id}

Kind regards,
Maruyama Team
`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
};

export default activation;
