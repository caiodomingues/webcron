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
    const job = new Job({
      callback: body.callback,
      recurrency: body.recurrency,
      payload: body.payload,
    });

    manager.addJob(job);

    res.status(200).send({
      messsage: "Job added successfully",
      job,
    });
  }
});

app.put("/:id", ({ params }, res) => {
  const job = manager.retryJob(params.id);

  if (job.length > 0) {
    res.status(200).send({ message: "Job realocated to Queue", job });
  } else {
    res.status(404).send({ message: "Job not found" });
  }
});

app.delete("/:id", ({ params }, res) => {
  const job = manager.removeJob(params.id);

  if (job.length > 0) {
    res.status(204).send();
  } else {
    res.status(404).send({ message: "Job not found" });
  }
});

app.post("/callback", ({ body }, res) => {
  console.log(body);
  res.status(200).send({
    message: "Callback received",
    body,
  });
});

setInterval(manager.boot, 1000);

app.listen(port);
console.log(`Server running on port ${port}`);
