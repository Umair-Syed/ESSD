import express from "express";
import * as databasesController from "../controllers/databases";

/**
 * ServerMeta Routes
 * backend-domain.com/databases
 */

const router = express.Router();

router.post("/", databasesController.getDatabases);

export default router;