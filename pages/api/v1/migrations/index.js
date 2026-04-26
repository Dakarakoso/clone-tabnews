import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator.js";
import authorization from "models/authorization";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:migration"), getHandler)
  .post(controller.canRequest("create:migration"), postHandler)
  .handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const pendingMigrations = await migrator.listPendingMigrations();
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    pendingMigrations,
  );
  return response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  const userTryingToPatch = request.context.user;
  const migratedMigrations = await migrator.runPendingMigrations();
  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }
  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:migration",
    migratedMigrations,
  );
  return response.status(200).json(secureOutputValues);
}
