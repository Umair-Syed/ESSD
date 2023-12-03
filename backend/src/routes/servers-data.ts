import express from "express";
import * as ServerDataController from "../controllers/servers-data";

/**
 * ServerData Routes
 * backend-domain.com/servers-data
 */

const router = express.Router();

router.get("/", ServerDataController.getServersData); // for all servers
// router.get("/:hostname", ServerDataController.getServersDataForHostName)); // for individual server

export default router;