document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnLogin");

  btn.addEventListener("click", async function () {

    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    if (!correo || !password) {
      alert("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    try {
      const res = await fetch("https://github.com/ravalenciac-max/sistema-asistencia-i3arq.git", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al iniciar sesión");
        return;
      }

      console.log("✅ Respuesta del servidor:", data);

      alert(`Bienvenido ${data.usuario.nombre}\nRol: ${data.usuario.rol}\nTipo de acceso: ${data.acceso.tipo}\nCiudad: ${data.acceso.ubicacion.ciudad}`);

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("acceso", JSON.stringify(data.acceso));


    } catch (error) {
      console.error("❌ Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }

  });

});
