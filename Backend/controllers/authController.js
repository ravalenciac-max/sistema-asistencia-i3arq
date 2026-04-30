console.log("🔥 CONTROLADOR CARGADO");

const axios = require("axios");
const pool = require("../config/db");

// IP pública real de la oficina
const IP_PUBLICA_OFICINA = "190.236.75.89";

function esOficinaPorIPPublica(ipPublica) {
  return ipPublica === IP_PUBLICA_OFICINA;
}

// Obtener ubicación desde ip-api
async function obtenerUbicacion(ipPublica) {
  try {
    const res = await axios.get(`http://ip-api.com/json/${ipPublica}`);

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

// LOGIN
const login = async (req, res) => {
  try {
    console.log("🔥 LOGIN EJECUTADO");

    const {
  correo,
  password,
  ipPublica,
  latitud_gps,
  longitud_gps,
  precision_gps
} = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios"
      });
    }

    if (!ipPublica) {
      return res.status(400).json({
        message: "No se recibió la IP pública del cliente"
      });
    }

    let ipLocal = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (Array.isArray(ipLocal)) ipLocal = ipLocal[0];
    if (ipLocal.includes(",")) ipLocal = ipLocal.split(",")[0].trim();
    if (ipLocal.includes("::ffff:")) ipLocal = ipLocal.replace("::ffff:", "");

    console.log("IP local detectada:", ipLocal);
    console.log("IP pública cliente:", ipPublica);

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

    const tipo = esOficinaPorIPPublica(ipPublica) ? "OFICINA" : "EXTERNO";

    const geo = await obtenerUbicacion(ipPublica);

   await pool.query(
  `INSERT INTO asistencia (
    usuario_id,
    nombre_completo,
    correo,
    fecha_hora,
    ip,
    ip_publica,
    tipo_conexion,
    pais,
    region,
    ciudad,
    latitud,
    longitud,
    latitud_gps,
    longitud_gps,
    precision_gps
  ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    user.id,
    user.nombre_completo,
    user.correo,
    ipLocal,
    ipPublica,
    tipo,
    geo.pais,
    geo.region,
    geo.ciudad,
    geo.lat,
    geo.lon,
    latitud_gps,
    longitud_gps,
    precision_gps
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
        ipLocal,
        ipPublica,
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