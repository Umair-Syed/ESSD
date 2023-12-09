import "dotenv/config";
import express from "express";
import cors from "cors";
import env from "./env";
import morgan from "morgan";
import serverMetaRoutes from "./routes/servers-meta";
import startCronJobs from './services/cronJobs';

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    origin: env.WEBSITE_URL,
}));

startCronJobs();

// Routes
app.use("/servers-meta", serverMetaRoutes);


// Testing`
import axios from 'axios';
app.get("/", (req, res) => {
    // testing ssh connection
    // executeCommandOnSSH('df -h', 'thor.vcraeng.com', 'root', '1ntell1dot')
    //     .then(output => res.send(`Command output: ${output}`))
    //     .catch(err => console.error('Error:', err));
    
    const url = `https://thor.vcraeng.com:2443/configuration-service-admin/cluster/nodes?namespace=/serviceRegistry&_=1700746112434`;
    const username = 'admin';
    const password = '1ntell1dot';
    
    const base64Credentials = Buffer.from(username + ':' + password).toString('base64');

    // // Setting the Authorization header manually
    const headers = {
        'Authorization': 'Basic ' + base64Credentials
    };
    
    axios.get(url, { headers: headers })
    .then(response => res.send(`Data: ${JSON.stringify(response.data)}`))
    .catch(error => console.error('Error:', error));


    // res.send("Hello World!");
})

export default app;