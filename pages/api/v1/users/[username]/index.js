import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = request.query.username;

  const userTryingToUpdate = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryingToUpdate, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "You do not have permission to update this user.",
      action:
        "Please contact support if you believe this is an error. Or check if you the update:user permission",
    });
  }

  const userInputValues = request.body;
  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
