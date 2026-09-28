import express from "express";

import cookieParser from "cookie-parser";

import { errorHandler, requestLogger } from "./shared";

import router from "./routes";

const app = express();

// --------------- Global middlewares ---------------

app.use(requestLogger);

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(errorHandler);

// --------------- Global middlewares ---------------

export default app;
