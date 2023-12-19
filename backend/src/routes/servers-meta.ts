import express from "express";
import * as ServerMetaController from "../controllers/servers-meta";

/**
 * ServerMeta Routes
 * backend-domain.com/servers-meta
 */

const router = express.Router();

// router.get("/", ServerMetaController.getServersMeta); // Don't need this route. It will expose credentials to the frontend.

router.post("/", ServerMetaController.createServerMeta);

export default router;