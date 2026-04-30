document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnLogin");

  btn.addEventListener("click", async function () {
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!correo || !password) {
      alert("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    try {
<<<<<<< HEAD
      const res = await fetch("https://github.com/ravalenciac-max/sistema-asistencia-i3arq.git", {
=======
      // 1. Obtener IP pública
      let ipPublica = null;

      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ipPublica = ipData.ip;
      } catch (error) {
        console.warn("No se pudo obtener IP pública:", error);
      }

      // 2. Obtener GPS, pero sin bloquear el login si falla
      let ubicacionGPS = {
        latitud_gps: null,
        longitud_gps: null,
        precision_gps: null
      };

      if ("geolocation" in navigator) {
        ubicacionGPS = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            position => {
              resolve({
                latitud_gps: position.coords.latitude,
                longitud_gps: position.coords.longitude,
                precision_gps: position.coords.accuracy
              });
            },
            error => {
              console.warn("GPS no permitido o no disponible:", error.message);

              resolve({
                latitud_gps: null,
                longitud_gps: null,
                precision_gps: null
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      }

      // 3. Enviar login al backend
      const res = await fetch("http://localhost:3000/api/auth/login", {
>>>>>>> 630423f (Actualización: login con GPS y mejoras)
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo,
          password,
          ipPublica,
          ...ubicacionGPS
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al iniciar sesión");
        return;
      }

      console.log("✅ Respuesta del servidor:", data);

      alert(
        `Bienvenido ${data.usuario.nombre}
Rol: ${data.usuario.rol}
Tipo de acceso: ${data.acceso.tipo}
IP pública: ${data.acceso.ipPublica || "No disponible"}
Ciudad: ${data.acceso.ubicacion?.ciudad || "No disponible"}
Precisión GPS: ${ubicacionGPS.precision_gps || "No disponible"} metros`
      );

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("acceso", JSON.stringify(data.acceso));

      // window.location.href = "dashboard.html";

    } catch (error) {
      console.error("Error real:", error);
      alert("No se pudo conectar con el servidor. Revisa la consola F12.");
    }
  });
<<<<<<< HEAD

});
=======
});
>>>>>>> 630423f (Actualización: login con GPS y mejoras)
