import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Not able to authenticate",
        action: "Check if provided information is correct",
      });
    }
    throw error;
  }

  async function findUserByEmail(providedEmail) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "wrong email",
          action: "Check if provided information is correct",
        });
      }

      throw error;
    }
    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPassword = await password.compare(
      providedPassword,
      storedPassword,
    );
    if (!correctPassword) {
      throw new UnauthorizedError({
        message: "wrong password",
        action: "Check if provided information is correct",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};
export default authentication;
