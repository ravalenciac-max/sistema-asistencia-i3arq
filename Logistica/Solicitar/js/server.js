const XLSX = require("xlsx");
const fs = require("fs");

function generarExcel(data, ip, tipo) {

  // 🧾 HOJA 1: RESUMEN
  const resumen = [
    ["SOLICITUD DE OBRA"],
    [],
    ["Obra", data.obra],
    ["Residente", data.residente],
    ["Fecha", data.fecha],
    ["Hora", data.hora],
    ["IP", ip],
    ["Tipo de conexión", tipo],
    ["Estado", "Pendiente"],
    [],
    ["Notas", data.notas || ""]
  ];

  // 📦 HOJA 2: MATERIALES
  const materiales = [
    ["Material", "Unidad", "Cantidad"]
  ];

  data.materiales.forEach(m => {
    materiales.push([m.nombre, m.unidad, m.cantidad]);
  });

  // 🛠️ HOJA 3: HERRAMIENTAS
  const herramientas = [
    ["Herramienta", "Unidad", "Cantidad"]
  ];

  data.herramientas.forEach(h => {
    herramientas.push([h.nombre, h.unidad, h.cantidad]);
  });

  // 📊 Crear workbook
  const wb = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  const wsMateriales = XLSX.utils.aoa_to_sheet(materiales);
  const wsHerramientas = XLSX.utils.aoa_to_sheet(herramientas);

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsMateriales, "Materiales");
  XLSX.utils.book_append_sheet(wb, wsHerramientas, "Herramientas");

  // 📁 Guardar archivo
  const nombreArchivo = `Solicitud_${data.obra}_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);

  return nombreArchivo;
}