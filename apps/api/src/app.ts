import express from "express";

const app = express();

// --------------- Global middlewares ---------------

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// --------------- Global middlewares ---------------

export default app;
