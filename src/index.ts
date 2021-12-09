import express from "express";
import { Job } from "./job";
import { Queue } from "./queue";
const app = express();
const port = 3333;

const queue = new Queue();

app.use(express.json());

app.get("/", (_req, res) => res.send({ job: queue.send(new Job("")) }));

setInterval(queue.run, 1000);

app.listen(port);
