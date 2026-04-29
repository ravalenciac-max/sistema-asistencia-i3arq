const express = require("express");
const router = express.Router();
const { crearSolicitud } = require("../controllers/materialescontroller");

router.post("/solicitar", crearSolicitud);

module.exports = router;
