import express from "express";

import { errorHandler } from "./shared/errors";

const app = express();

// --------------- Global middlewares ---------------

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);

// --------------- Global middlewares ---------------

export default app;
