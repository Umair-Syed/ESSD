import express from "express";
import * as ServerMetaController from "../controllers/servers-meta";

/**
 * ServerMeta Routes
 * backend-domain.com/servers-meta
 */

const router = express.Router();

router.get("/", ServerMetaController.getServersMeta);

router.post("/", ServerMetaController.createServerMeta);

export default router;