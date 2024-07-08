const {
  client,
  createTables,
  createUser,
  createSkill,
  fetchUsers,
  fetchSkills,
  createUserSkill,
  fetchUserSkills,
  deleteUserSkill,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/skills", async (req, res, next) => {
  try {
    res.send(await fetchSkills());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.send(await fetchUserSkills(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/userSkills/", async (req, res, next) => {
  try {
    res.send(
      await createUserSkill({
        user_id: req.params.id,
        skill_id: req.body.skill_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/userSkills/:id", async (req, res, next) => {
  try {
    await deleteUserSkill({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [moe, lucy, ethyl, singing, dancing, juggling, plateSpinning] =
    await Promise.all([
      createUser({ username: "moe", password: "s3cr3t" }),
      createUser({ username: "lucy", password: "s3cr3t!" }),
      createUser({ username: "ethyl", password: "shhh" }),
      createSkill({ name: "singing" }),
      createSkill({ name: "dancing" }),
      createSkill({ name: "juggling" }),
      createSkill({ name: "plate spinning" }),
    ]);
  console.log(moe.id);
  console.log(dancing.id);

  const users = await fetchUsers();
  console.log(users);

  const skills = await fetchSkills();
  console.log(skills);

  const userSkills = await Promise.all([
    createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id }),
    createUserSkill({ user_id: moe.id, skill_id: juggling.id }),
    createUserSkill({ user_id: ethyl.id, skill_id: juggling.id }),
    createUserSkill({ user_id: lucy.id, skill_id: dancing.id }),
  ]);

  console.log(await fetchUserSkills(moe.id));
  await deleteUserSkill(userSkills[0].id);
  console.log(await fetchUserSkills(moe.id));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
