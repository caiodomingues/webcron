import express from "express";
import { Job } from "./job";
import { Manager } from "./manager";
const app = express();
const port = 3333;

const manager = new Manager();
manager.run();

app.use(express.json());

app.get("/", (_req, res) => {
  manager.addJob(
    new Job({
      callback: "http://localhost:3333/callback",
      recurrency: 0,
      payload: { wee: "wee" },
    })
  );

  res.status(200).send();
});

app.post("/callback", (req, res) => {
  console.log("received: ", req.body);
  res.status(200).send();
});

setInterval(manager.run, 1000);

app.listen(port);
console.log(`Server running on port ${port}`);
