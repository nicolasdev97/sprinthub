import express from "express";

import { errorHandler } from "./shared/errors";
import { requestLogger } from "./shared/logger";
import router from "./routes";

const app = express();

// --------------- Global middlewares ---------------

app.use(requestLogger);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(errorHandler);

// --------------- Global middlewares ---------------

export default app;
