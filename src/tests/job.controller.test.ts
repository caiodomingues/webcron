import { app } from "../bin/app";
import http from "http";
import request from "supertest";

describe("JobController (integration)", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    process.env.NODE_ENV = "test";
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === "string" || address === null) throw new Error("No address");
      baseUrl = `http://127.0.0.1:${address.port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it("should create a job", async () => {
    const res = await request(baseUrl)
      .post("/jobs/")
      .send({ callback: "https://example.com/callback" });
    expect(res.status).toBe(200);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.callback).toBe("https://example.com/callback");
  }, 30000);

  it("should create a job with payload and normalize it", async () => {
    const payload = { foo: "bar" };
    const res = await request(baseUrl)
      .post("/jobs/")
      .send({ callback: "https://example.com/callback", payload });
    expect(res.status).toBe(200);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.payload).toBe(JSON.stringify(payload));
  });

  it("should create a job with recurrency and limit", async () => {
    const res = await request(baseUrl)
      .post("/jobs/")
      .send({ callback: "https://example.com/callback", recurrency: 10, limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body.job.recurrency).toBe(10);
    expect(res.body.job.limit).toBe(5);
  });

  it("should return 422 for invalid callback url", async () => {
    const res = await request(baseUrl).post("/jobs/").send({ callback: "notavalidurl" });
    console.log("alo bodia", res.status, res.body);
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("message", "Invalid request body");
  });

  it("should return 404 when retrying a non-existent job", async () => {
    const res = await request(baseUrl).put("/jobs/invalid-id");
    expect(res.status).toBe(404);
  });

  it("should return 404 when removing a non-existent job", async () => {
    const res = await request(baseUrl).delete("/jobs/invalid-id");
    expect(res.status).toBe(404);
  });

  it("should return 422 for request without body", async () => {
    const res = await request(baseUrl).post("/jobs/");
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("message", "Invalid request body");
  });
});
