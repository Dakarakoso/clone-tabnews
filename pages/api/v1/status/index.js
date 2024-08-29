import database from "infra/database.js";

async function status(req, res) {
  const result = await database.query("SELECT 1 + 1 AS sum;");
  console.log(result.rows);
  res.status(200).json({ key: "willian" });
}

export default status;
