import express from "express";
import { Job } from "./job";
import { Manager } from "./manager";
const app = express();
const port = 3333;

const manager = new Manager();
manager.run();

app.use(express.json());

app.post("/", ({ body }, res) => {
  if (!body.callback) {
    res.status(422).send({ error: "Callback is required" });
  } else {
    manager.addJob(
      new Job({
        callback: body.callback,
        recurrency: body.recurrency,
        payload: body.payload,
      })
    );

    res.status(200).send();
  }
});

app.delete("/:id", ({ params }, res) => {
  manager.removeJob(params.id);
  res.status(204).send();
});

setInterval(manager.run, 1000);

app.listen(port);
console.log(`Server running on port ${port}`);
