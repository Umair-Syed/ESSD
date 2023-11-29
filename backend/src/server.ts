import mongoose from "mongoose";
import app from "./app";
import env from "./env";

const port = process.env.PORT;

console.log(`Connecting to MongoDB...${env.MONGO_CONNECTION_STRING}`);
mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log("Mongoose connected");
        app.listen(port, () => console.log("Server running on port: " + port));
    })
    .catch(console.error);