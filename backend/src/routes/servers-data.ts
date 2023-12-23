import express from "express";
import * as ServerDataController from "../controllers/servers-data";

/**
 * ServerData Routes
 * backend-domain.com/servers-data
 */

const router = express.Router();

router.get("/", ServerDataController.getAllServersData); // for all servers

// Example: http://localhost:8000/servers-data/filter?filter=serverTeam
router.get("/filter", ServerDataController.getServersDataForFilter); // get servers having that tag, will have query param

// Example: http://localhost:8000/servers-data/thor.vcraeng.com
router.get("/:hostname", ServerDataController.getRefreshedServersDataForHostName); // for individual server, for refresh


export default router;