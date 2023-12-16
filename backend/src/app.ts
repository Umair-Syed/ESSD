import "dotenv/config";
import express from "express";
import cors from "cors";
import env from "./env";
import morgan from "morgan";
import serverMetaRoutes from "./routes/servers-meta";
import databaseRoutes from "./routes/databases";
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
app.use("/databases", databaseRoutes);


// Testing
// import axios from 'axios';
app.get("/", (req, res) => {
    
    const data = {
        "names": [
          "Emma",
          "Liam",
          "Olivia",
          "Noah",
          "Ava",
          "Ethan",
          "Isabella",
          "Mason",
          "Sophia",
          "Mia"
        ]
      }
      
    res.send(data);

    // res.send("Hello World!");
})

export default app;