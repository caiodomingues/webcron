export const appConfig = {
  port: process.env.PORT || "3000",
  host: process.env.HOST || "localhost",
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  helmet: {
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  },
};
