import express from "express";
import * as MiscellaneousDataController from "../controllers/miscelleneous-data";

/**
 * ServerData Routes
 * backend-domain.com/misc/
 */

const router = express.Router();

router.get("/filters", MiscellaneousDataController.getAllFilters);
router.post("/filters", MiscellaneousDataController.addFilter);
router.delete("/filters/:filter", MiscellaneousDataController.deleteFilter);

export default router;