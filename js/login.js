document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Simulación de autenticación (puedes reemplazar esto con una API real)
    if (username === "admin" && password === "1234") {
      alert("Inicio de sesión exitoso. ¡Bienvenido al Cine Multiplex!");
      window.location.href = "dashboard.html"; // Redirige al dashboard
    } else {
      alert("Credenciales incorrectas. Por favor, intenta nuevamente.");
      document.getElementById("loginForm").reset();
    }
  });
