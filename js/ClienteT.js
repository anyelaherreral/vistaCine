
export let clientId = null;
export let clienteNombre = null;


document.getElementById('search-client').addEventListener('click', async () => {
    const documentNumber = document.getElementById('document-number').value;

    if (!documentNumber) {
        alert("Por favor, ingresa un número de documento.");
        return;
    }

    try {
        // Llamar al servicio para buscar cliente por documento
        const response = await fetch(`http://localhost:8080/clientes/buscar-por-documento?documento=${documentNumber}`);
        
        if (response.ok) {
            const client = await response.json();
            alert(`Cliente encontrado: ${client.nombre}`);
            
            // Asignar el id del cliente encontrado a la variable global
            clientId = client.id;
            clienteNombre = client;
            console.log("ID del cliente encontrado:", clientId);

            // Habilitar el botón de reservar
            document.getElementById('reserve-button').disabled = false;
        } else if (response.status === 404) {
            alert("Cliente no encontrado. Por favor, regístrate.");
            
            // Mostrar el formulario de registro
            const registerForm = document.getElementById('register-client-form');
            registerForm.style.display = "block";

            // Rellenar el campo de documento en el formulario de registro
            document.getElementById('client-document').value = documentNumber;
        } else {
            throw new Error("Error al buscar cliente.");
        }
    } catch (error) {
        console.error("Error al buscar cliente:", error);
        alert("Hubo un problema al buscar al cliente.");
    }
});

document.getElementById('register-client').addEventListener('click', async () => {
    const name = document.getElementById('client-name').value;
    const documentNumber = document.getElementById('client-document').value;
    const phone = document.getElementById('client-phone').value;
    const email = document.getElementById('client-email').value;

    if (!name || !phone || !email) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const clientData = {
        nombre: name,
        documento: documentNumber,
        telefono: phone,
        email: email
    };

    try {
        // Llamar al servicio para registrar al cliente
        const response = await fetch('http://localhost:8080/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
        });

        if (response.ok) {
            const client = await response.json();
            alert("Cliente registrado exitosamente.");

            // Asignar el id del nuevo cliente registrado a la variable global
            clientId = client.id;
            clienteNombre = client.nombre;
            console.log("ID del nuevo cliente registrado:", clientId);
            // Ocultar el formulario de registro y habilitar el botón de reservar
            document.getElementById('register-client-form').style.display = "none";
            document.getElementById('reserve-button').disabled = false;
        } else {
            throw new Error("Error al registrar cliente.");
        }
    } catch (error) {
        console.error("Error al registrar cliente:", error);
        alert("Hubo un problema al registrar al cliente.");
    }
});
