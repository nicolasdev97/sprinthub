import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { corsMiddleware, apiRateLimiter } from "./middleware";
import { errorHandler, requestLogger } from "./shared";
import router from "./routes";

const app = express();

// --------------- Global middlewares ---------------

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(corsMiddleware);

app.use(requestLogger);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(apiRateLimiter);

app.use(router);

app.use(errorHandler);

// --------------- Global middlewares ---------------

export default app;

