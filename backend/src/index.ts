import "dotenv/config";
import cors from "cors";
import express from "express";
import routes from "./routes.js";

const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`Kit AI Updater listening on port ${port}`);
});
