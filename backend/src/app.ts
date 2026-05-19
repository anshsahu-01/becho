import express from "express";
import { clerkMiddleware } from "@clerk/express";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(
  clerkMiddleware({
    clockSkewInMs: 60000,
  })
);
app.use("/api", routes);
app.use(errorHandler);

export default app;
