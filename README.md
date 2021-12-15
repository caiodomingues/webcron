# Webcron

Webcron is a simple, easy to use, and powerful cron job scheduler through HTTP requests.

## Using Webcron

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
    "wee": "wee"
  }
}
```

1. The callback is the URL that will be called when the job is executed (It will do a POST request in the URL).
2. The recurrency (in seconds - leave it as zero to make a single request) of the job and the limit is the number of times the job will be executed before it's deleted (if it does have a recurrency greather than 0).
3. The payload is the data that will be sent to the callback, it can be a object or a string.

## Why I've created this?

Because I didn't want to configure and use default cron jobs for a single task that runs one time a day, and I do have multiple systems running in different servers that require the job to be called in the same minute.

Note that doesn't needs to be exactly in the same time, but a minute is a good compromise. Since this is web-based, it works, and it's easy to use as well.
