# WebCron

WebCron is a simple, easy to use, and powerful cron job scheduler through HTTP requests.

## Using WebCron

After cloning the repository and installing the dependencies, you can start using WebCron using Docker, there's a [Dockerfile](./Dockerfile) in the root of the repository, and a [docker-compose.yml](./docker-compose.yml) as well.

```sh
docker-compose up -d --build
```

Running the above command will start the WebCron (uses the port `3333` by default)

### Creating a new job

Since it's a simple HTTP request, you can create a new job by sending a POST request to `http://localhost:3333/` with the following body:

```json
{
  "callback": "http://localhost:3333/callback",
  "recurrency": 1,
  "limit": 5,
  "payload": {
    "hello": "world!"
  }
}
```

1. The callback is the URL that will be called when the job is executed (It will do a POST request in the URL).
2. The recurrency (in seconds - leave it as zero to make a single request) of the job and the limit is the number of times the job will be executed before it's deleted (if it does have a recurrency greather than 0).
3. The payload is the data that will be sent to the callback, it can be a object or a string.

In the example above, the job will run 5 times, in 5 seconds, and will send the payload `{"hello": "world!"}` to the callback (which is the server itself, for testing purposes).

#### Testing the job

You can test the job by using the WebCron route `/callback`, it will log the payload in the console.

### Retrying a failed job

Just do a PUT request to `http://localhost:3333/{job id}`:

### Deleting a job

Just do a DELETE request to `http://localhost:3333/{job id}`:

## Structure

WebCron works with Queue Managers, each one of them is responsible for their own queue(s). Every second, the core of WebCron will call the runner of each queue manager, which will execute the jobs of the queue (if any).

Queues are automatically created when a new job is created, they sleep if there are any jobs and wake up when a new job is added. The queues will be deleted when there are no more jobs after a certain amount of time (default is 5 minutes).

Each queue does have a limit of jobs, if the limit is reached, the queue manager will take care of creating a new one. When jobs fail, they're added to the failed queue, each queue does have it own failed job.

Failed jobs needs to be retried manually (by calling the PUT route), they will be added back to the available queue. If the failed job is not retried after 24h, it will be deleted from the failed queue.

## Why I've created this?

Because I didn't want to configure and use default cron jobs for a single task that runs one time a day, and I do have multiple systems running in different servers that require the job to be called in the same minute.

Note that doesn't needs to be exactly in the same time, but a minute is a good compromise. Since this is web-based, it works, and it's easy to use as well.
