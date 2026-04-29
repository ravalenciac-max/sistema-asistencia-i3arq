const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// 🔍 detectar red
function tipoConexion(ip) {
  if (ip.includes("192.168") || ip.includes("10.")) {
    return "OFICINA";
  }
  return "EXTERNO";
}

// 📊 generar excel
function generarExcel(data, ip, tipo) {

  const resumen = [
    ["SOLICITUD DE MATERIALES"],
    [],
    ["Obra", data.obra],
    ["Usuario", data.usuario],
    ["Fecha", data.fecha],
    ["Hora", data.hora],
    ["IP", ip],
    ["Ubicación", tipo],
    ["Estado", "Pendiente"]
  ];

  const materiales = [["Material", "Unidad", "Cantidad"]];

  data.materiales.forEach(m => {
    materiales.push([m.nombre, m.unidad, m.cantidad]);
  });

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), "Resumen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(materiales), "Materiales");

  const nombre = `solicitud_${Date.now()}.xlsx`;
  const ruta = path.join(__dirname, "/Solicitudes", nombre);

  XLSX.writeFile(wb, ruta);

  return nombre;
}

// 🚀 endpoint
exports.crearSolicitud = (req, res) => {
  try {
    const data = req.body;

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "";

    const tipo = tipoConexion(ip);

    const archivo = generarExcel(data, ip, tipo);

    res.json({
      ok: true,
      archivo,
      tipo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando solicitud" });
  }
};