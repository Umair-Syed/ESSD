import "dotenv/config";
import express from "express";
import cors from "cors";
import env from "./env";
import morgan from "morgan";
import serverMetaRoutes from "./routes/servers-meta";
import serverDataRoutes from "./routes/servers-data";
import databaseRoutes from "./routes/databases";
import miscRoutes from "./routes/miscelleneous-data";
import startCronJobs from './services/cronJobs';

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors({
    origin: env.WEBSITE_URL,
}));

startCronJobs();

// Routes
app.use("/servers-meta", serverMetaRoutes);
app.use("/servers-data", serverDataRoutes);
app.use("/databases", databaseRoutes);
app.use("/misc", miscRoutes); // miscelleneous routes - eg. Filters


// Testing
// import axios from 'axios';
app.get("/", (req, res) => {
  res.send("Edge servers API");
})

export default app;