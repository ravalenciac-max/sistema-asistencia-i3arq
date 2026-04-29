function agregarFila(tablaID) {
  const tabla = document.getElementById(tablaID).querySelector("tbody");

  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td><input type="text" placeholder="Nombre"></td>
    <td><input type="text" value="und"></td>
    <td><input type="number" value="1"></td>
    <td><button onclick="eliminarFila(this)">X</button></td>
  `;

  tabla.appendChild(fila);
}

function eliminarFila(btn) {
  btn.parentElement.parentElement.remove();
}

function obtenerDatosTabla(tablaID) {
  const filas = document.querySelectorAll(`#${tablaID} tbody tr`);
  let datos = [];

  filas.forEach(fila => {
    const inputs = fila.querySelectorAll("input");
    datos.push({
      nombre: inputs[0].value,
      unidad: inputs[1].value,
      cantidad: inputs[2].value
    });
  });

  return datos;
}

async function enviar() {

  const data = {
    obra: document.getElementById("obra").value,
    usuario: document.getElementById("usuario").value,
    fecha: new Date().toISOString(),
    hora: new Date().toLocaleTimeString(),
    materiales: obtenerMateriales()
  };

  const res = await fetch("http://localhost:3000/api/materiales/solicitar", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  const r = await res.json();

  if (r.ok) {
    alert("Excel generado: " + r.archivo + "\nUbicación: " + r.tipo);
  }
}

