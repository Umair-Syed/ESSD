import "dotenv/config";
import express from "express";
import cors from "cors";
import env from "./env";
import morgan from "morgan";
import serverMetaRoutes from "./routes/servers-meta";

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use(cors({
    origin: env.WEBSITE_URL,
}));

app.use("/servers-meta", serverMetaRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
})

export default app;