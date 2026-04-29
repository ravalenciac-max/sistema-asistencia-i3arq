console.log("🔥 CONTROLADOR CARGADO");

const axios = require("axios");
const pool = require("../config/db");

// detectar oficina
function esOficina(ip) {
  return (
    ip.startsWith("192.168.1.") ||
    ip === "127.0.0.1" ||
    ip === "::1"
  );
}

// obtener ubicación desde ip-api
async function obtenerUbicacion(ip) {
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`);

    if (res.data.status === "success") {
      return {
        pais: res.data.country,
        region: res.data.regionName,
        ciudad: res.data.city,
        lat: res.data.lat,
        lon: res.data.lon
      };
    }
  } catch (error) {
    console.log("Error API:", error.message);
  }

  return {
    pais: "Desconocido",
    region: "Desconocido",
    ciudad: "Desconocido",
    lat: null,
    lon: null
  };
}

// 🔥 LOGIN
const login = async (req, res) => {
  try {
    console.log("🔥 LOGIN EJECUTADO");

    const { correo, password } = req.body;

     if (!correo || !password) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios"
      });
    }

    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // limpiar IP
    if (Array.isArray(ip)) ip = ip[0];
    if (ip.includes(",")) ip = ip.split(",")[0];
    if (ip.includes("::ffff:")) ip = ip.split("::ffff:")[1];

    console.log("IP detectada:", ip);

const [usuarios] = await pool.query(
      `SELECT id, nombre_completo, correo, password, rol, activo
       FROM usuarios
       WHERE correo = ?`,
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        message: "Usuario no encontrado"
      });
    }

    const user = usuarios[0];

    if (!user.activo) {
      return res.status(403).json({
        message: "Usuario inactivo"
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Contraseña incorrecta"
      });
    }

    const tipo = esOficina(ip) ? "OFICINA" : "EXTERNO";

    // obtener ubicación
    const geo = await obtenerUbicacion(ip);
await pool.query(
  `INSERT INTO asistencia (
    usuario_id,
    nombre_completo,
    correo,
    fecha_hora,
    ip,
    tipo_conexion,
    pais,
    region,
    ciudad,
    latitud,
    longitud
  ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
  [
    user.id,
    user.nombre_completo,
    user.correo,
    ip,
    tipo,
    geo.pais,
    geo.region,
    geo.ciudad,
    geo.lat,
    geo.lon
  ]
);

    res.json({
      message: "Login exitoso",
      usuario: {
        id: user.id,
        nombre: user.nombre_completo,
        correo: user.correo,
        rol: user.rol
      },
      acceso: {
        tipo,
        ip,
        ubicacion: geo
      }
    });
  } catch (error) {
    console.error("❌ ERROR EN LOGIN:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

module.exports = { login };