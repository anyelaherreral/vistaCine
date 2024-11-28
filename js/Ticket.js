
// Elementos del DOM
const movieShowSelect = document.getElementById('movie-show-select');
const movieShowInfo = document.getElementById("movie-show-info");
const movieTitleTime = document.getElementById("movie-title-time");
const theaterRoomInfo = document.querySelector(".theater-room-info");
const ticketPriceInfo = document.querySelector(".ticket-price-info");
const movieDuration = document.querySelector(".movie-duration");
const movieSynopsis = document.querySelector(".movie-synopsis");
const movieGenre = document.querySelector(".movie-genre");
const theaterRoomSeats = document.querySelector(".theater-room-seats");
const theaterSeatingLayout = document.getElementById('theater-seating-layout');
const bookingSummary = document.getElementById('booking-summary');
const selectedSeatsInfo = document.getElementById('selected-seats-info');
const totalPrice = document.getElementById('total-price');
const reserveButton = document.getElementById('reserve-button');
const movieDateInput = document.getElementById('movie-date');
const snackContainer = document.getElementById("snack-container");


let selectedShow = null;
let selectedSeats = [];

// Función para manejar cambios en la fecha
movieDateInput.addEventListener('change', () => {
    const selectedDate = movieDateInput.value; // Formato "AAAA-MM-DD"
    console.log("Fecha seleccionada:", selectedDate);
    // Llama a la función para buscar y mostrar funciones según la fecha seleccionada
    buscarFuncionesPorFecha(selectedDate);
});

// Función para obtener funciones de una fecha específica
async function buscarFuncionesPorFecha(fecha) {
    try {
      const response = await fetch(`http://localhost:8080/funciones/fecha/${fecha}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("No hay funciones para la fecha especificada.");
      }
  
      const funciones = await response.json();
      console.log("Funciones obtenidas:", funciones); // linea para verificar la estructura de datos
      mostrarFuncionesEnSelector(funciones);
  
    } catch (error) {
      console.error("Error al obtener funciones:", error);
      alert(error.message || "Hubo un problema al obtener las funciones.");
    }
}

// Función para mostrar las funciones en el selector "movie-show-select"
function mostrarFuncionesEnSelector(funciones) {
    // Limpiar las opciones anteriores
    movieShowSelect.innerHTML = "";
  
    // Agregar una opción predeterminada
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Selecciona una función";
    defaultOption.value = "";
    movieShowSelect.appendChild(defaultOption);
  
    // Agregar cada función como opción en el selector
  funciones.forEach(funcion => {
    const option = document.createElement("option");
    option.value = funcion.id;

    // Acceder al título de la película y al horario correctamente
    option.textContent = `Película: ${funcion.pelicula.titulo || "Sin título"}, Hora: ${funcion.horario || "Sin hora"}`;
    
    movieShowSelect.appendChild(option);
  });
}

// Mostrar información de la función seleccionada
// Escuchador para manejar el cambio en el selector
movieShowSelect.addEventListener("change", async (event) => {
    const selectedFunctionId = event.target.value; // Obtener el ID de la función seleccionada
    if (selectedFunctionId) {
        try {
            // Construir la URL de la API con el ID seleccionado
            const apiUrl = `http://localhost:8080/funciones/${selectedFunctionId}`;
            
            // Realizar la solicitud a la API
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error("No se pudo obtener la información de la función seleccionada.");
            }

            // Obtener los datos en formato JSON
            const functionData = await response.json();
            console.log("Datos de la función seleccionada:", functionData); // Verificar la estructura

            // Mostrar los datos en la interfaz
            updateShowInfo(functionData);
            // Obtener y mostrar los asientos para la función seleccionada
            mostrarAsientos(functionData.sala.id, functionData.id);

        } catch (error) {
            console.error("Error al obtener los datos de la función:", error);
            alert(error.message || "Hubo un problema al obtener los datos de la función.");
            movieShowInfo.style.display = "none"; // Ocultar si hay error
        }
    } else {
        // Ocultar la información si no hay una función seleccionada
        movieShowInfo.style.display = "none";
        
    }
});

// Función para mostrar la información de la función seleccionada
function updateShowInfo(selectedShow) {
    if (selectedShow) {
        // Actualizar los elementos del DOM con los datos de la función
        movieTitleTime.textContent = `${selectedShow.pelicula.titulo} - ${selectedShow.horario}`;
        theaterRoomInfo.textContent = `Sala: ${selectedShow.sala.id}`;
        ticketPriceInfo.textContent = `Proyección: ${selectedShow.sala.tipoProyeccion.descripcion}`;
        movieDuration.textContent = `Duración: ${selectedShow.pelicula.duracion}`;
        movieSynopsis.textContent = `Sinopsis: ${selectedShow.pelicula.sinopsis}`;
        movieGenre.textContent = `Género: ${selectedShow.pelicula.genero.descripcion}`;
        theaterRoomSeats.textContent = `Asientos totales: ${selectedShow.sala.num_asientos}`;

        // Mostrar la sección de información
        movieShowInfo.style.display = "block";
    } else {
        // Ocultar la sección si no hay datos
        movieShowInfo.style.display = "none";
    }
}

// Función para mostrar los asientos en la interfaz
async function mostrarAsientos(salaId, funcionId) {
    try {
        // Obtener los asientos de la sala
        const response = await fetch(`http://localhost:8080/asientos/sala/${salaId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("No se pudieron obtener los asientos de la sala.");
        }

        const asientosDisponibles = await response.json();

        // Obtener los asientos ocupados de la función
        const responseOcupados = await fetch(`http://localhost:8080/boletos/funcion/${funcionId}/asientos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!responseOcupados.ok) {
            throw new Error("No se pudieron obtener los asientos ocupados.");
        }

        const asientosOcupados = await responseOcupados.json();

        // Limpiar el layout
        theaterSeatingLayout.innerHTML = '<div class="theater-screen">Pantalla</div>';

        // Agrupar los asientos por fila (letra)
        const asientosPorFila = {};
        asientosDisponibles.forEach(asiento => {
            const fila = asiento.letra; // Usamos 'letra' para las filas
            if (!asientosPorFila[fila]) {
                asientosPorFila[fila] = [];
            }
            asientosPorFila[fila].push(asiento);
        });

        // Crear el layout de asientos
        Object.keys(asientosPorFila).forEach(fila => {
            const filaDiv = document.createElement("div");
            filaDiv.classList.add("seat-row");

            asientosPorFila[fila].forEach(asiento => {
                const asientoButton = document.createElement("button");
                asientoButton.classList.add("theater-seat");
                asientoButton.textContent = `${asiento.letra}${asiento.numeroAsiento}`; // Usamos 'numeroAsiento' para el número del asiento
                asientoButton.dataset.seatId = `${asiento.letra}${asiento.numeroAsiento}`;

                // Verificar si el asiento está ocupado
                const isOccupied = asientosOcupados.some(ocupado => ocupado.letra === asiento.letra && ocupado.numeroAsiento === asiento.numeroAsiento);

                if (isOccupied) {
                    asientoButton.classList.add("seat-occupied");
                    asientoButton.disabled = true;
                } else {
                    asientoButton.classList.add("seat-available");
                    asientoButton.addEventListener("click", () => toggleSeatSelection(asientoButton.dataset.seatId, asientoButton));
                }

                filaDiv.appendChild(asientoButton);
            });

            theaterSeatingLayout.appendChild(filaDiv);
        });

        // Mostrar el layout de asientos
        theaterSeatingLayout.style.display = "block";

    } catch (error) {
        console.error("Error al mostrar los asientos:", error);
        alert(error.message || "Hubo un problema al mostrar los asientos.");
    }
}

// Función para manejar la selección de asientos
function toggleSeatSelection(seatId, seatButton) {
    // Si el asiento ya está seleccionado, deseleccionarlo
    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter(id => id !== seatId);
        seatButton.classList.remove("seat-selected");
    } else {
        // Seleccionar el asiento
        selectedSeats.push(seatId);
        seatButton.classList.add("seat-selected");
    }

    // Actualizar el resumen de la reserva
    updateBookingSummary();
}
// Variables para manejar los precios
let totalBoletosConDescuento = 0;
let totalSnacksConDescuento = 0;

async function cargarCategorias() {
    try {
        const response = await fetch('http://localhost:8080/api/categorias-boletos');
        
        if (!response.ok) {
            throw new Error('No se pudieron obtener las categorías de boletos');
        }

        const categorias = await response.json();
        console.log('Categorías de boletos:', categorias);

        // Obtener el select donde se agregarán las opciones
        const categorySelect = document.getElementById('category-select');

        // Limpiar el selector antes de agregar nuevas opciones
        categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';

        // Agregar las opciones al selector
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = `${categoria.descripcion} - $${categoria.precio.toLocaleString()}`;
            categorySelect.appendChild(option);
        });

        // Escuchar el cambio de selección para actualizar el precio
        categorySelect.addEventListener('change', function() {
            const selectedCategoryId = this.value;
            const selectedCategory = categorias.find(categoria => categoria.id == selectedCategoryId);
            const nameCategory = selectedCategory.descripcion;

            if (selectedCategory) {
                document.getElementById('total-price').style.display = 'block';
                totalBoletosConDescuento = selectedCategory.precio * selectedSeats.length;
                document.getElementById('total-price').textContent = `Total boletos: $${totalBoletosConDescuento.toLocaleString()}`;
                cargarDescuento(selectedCategory.id, totalBoletosConDescuento, nameCategory);
            } else {
                document.getElementById('total-price').style.display = 'none';
                document.getElementById('discount-message').style.display = 'none';
            }
        });
        
    } catch (error) {
        console.error('Error al cargar las categorías:', error);
        alert('Hubo un problema al cargar las categorías de boletos');
    }
}

async function cargarDescuento(categoriaId, precioTotal, nameCategory) {
    try {
        const response = await fetch('http://localhost:8080/api/categoria-boleto-promocion');
        
        if (!response.ok) {
            throw new Error('No se pudieron obtener los descuentos');
        }

        const promociones = await response.json();
        const descuentoAplicable = promociones.find(promocion => promocion.categoriaBoleto.id === categoriaId);
        let precioConDescuento = precioTotal;

        if (descuentoAplicable) {
            const descuento = descuentoAplicable.descuento;
            precioConDescuento = precioTotal - (precioTotal * (descuento / 100));

            document.getElementById('discount-description').textContent = `Válido para aplicar descuento de ${descuento}% en boletos ${nameCategory}`;
            document.getElementById('discounted-price').textContent = `Precio con descuento aplicado: $${precioConDescuento.toLocaleString('es-CO')}`;

            document.getElementById('discount-message').style.display = 'block';
        } else {
            document.getElementById('discount-message').style.display = 'none';
        }

        // Asegúrate de almacenar el valor como un número sin formato
        totalBoletosConDescuento = parseFloat(precioConDescuento.toFixed(2));
        console.log('TotalBC320:', totalBoletosConDescuento);

    } catch (error) {
        console.error('Error al cargar los descuentos:', error);
        alert('Hubo un problema al cargar los descuentos');
    }
}


// Función para actualizar el resumen de la reserva
function updateBookingSummary() {
    if (selectedSeats.length > 0) {
        document.getElementById("booking-summary").style.display = "block"; // Mostrar el resumen
        cargarCategorias();
        loadSnacks();
    } else {
        document.getElementById("booking-summary").style.display = "none"; // Ocultar el resumen si no hay asientos seleccionados
    }
    // Actualizar la información de asientos seleccionados
    selectedSeatsInfo.textContent = `Asientos seleccionados: ${selectedSeats.join(', ')}`;
    
    // Actualizar el texto del botón de reserva
    reserveButton.textContent = `Reservar ${selectedSeats.length} asiento(s)`;
    reserveButton.disabled = selectedSeats.length === 0; // Deshabilitar el botón si no hay asientos seleccionados
}

// Función para cargar snacks
async function loadSnacks() {
    try {
        const [snacksResponse, promociones] = await Promise.all([
            fetch('http://localhost:8080/snacks'),
            cargarPromocionesSnacks(),
        ]);

        if (!snacksResponse.ok) throw new Error("Error al cargar los snacks");
        const snacks = await snacksResponse.json();

        snackContainer.innerHTML = "";

        snacks.forEach((snack) => {
            const snackPromo = promociones.find(promo => promo.snack.id === snack.id);
            const descuento = snackPromo ? snackPromo.descuento : 0;
            const precioConDescuento = snackPromo ? snack.precio * (1 - descuento / 100) : snack.precio;
            const snackCard = document.createElement("div");
            snackCard.className = `snack-card ${snack.cantidadDisponible === 0 ? "disabled" : ""}`;

            snackCard.innerHTML = `
                <h3>${snack.descripcion}</h3>
                <p>Precio: $${snack.precio.toLocaleString()}</p>
                ${descuento > 0 ? `<p>Descuento: ${descuento}%</p><p>Precio con descuento: $${precioConDescuento.toLocaleString()}</p>` : ""}
                <p>Cantidad Disponible: ${snack.cantidadDisponible}</p>
                <label for="quantity-${snack.id}">Cantidad:</label>
                <input type="number" id="quantity-${snack.id}" class="snack-quantity" value="0" min="0" max="${snack.cantidadDisponible}" data-snack-id="${snack.id}" data-snack-price="${precioConDescuento}" />
            `;

            snackContainer.appendChild(snackCard);
        });

        document.getElementById("snacks-section").style.display = snacks.length > 0 ? "block" : "none";
    } catch (error) {
        console.error("Error al cargar los snacks:", error);
        snackContainer.innerHTML = "<p>Error al cargar los snacks.</p>";
        document.getElementById("snacks-section").style.display = "none";
    }
}

function parseCurrency(value) {
    // Remover caracteres no numéricos como $ y puntos
    return parseFloat(value.replace(/[^0-9.-]+/g, ""));
}

// Función para actualizar el total combinado (boletos + snacks)
document.getElementById('calculate-total').addEventListener('click', () => {
    // Extraer y limpiar correctamente el total de snacks
    const totalSnacks = parseFloat(
        document.getElementById("snack-total").value);

    // Convertir totalBoletosConDescuento a número entero
    const totalBoletos = totalBoletosConDescuento;
    // Sumar totales
    const combinedTotal = totalBoletos + totalSnacks;

    // Formatear el total combinado
    const formattedTotal = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(combinedTotal);

    // Mostrar el total correctamente formateado
    document.getElementById("combined-total").textContent = `Total a pagar: ${formattedTotal}`;
});

async function cargarPromocionesSnacks() {
    try {
        const response = await fetch('http://localhost:8080/SnackPromocion');
        if (!response.ok) throw new Error("Error al cargar las promociones de snacks");
        const promociones = await response.json();
        return promociones;
    } catch (error) {
        console.error("Error al cargar las promociones de snacks:", error);
        return [];
    }
}

// Gestión de selección de snacks
let snackTotal = 0;

// Evento global para manejar clicks en los botones de snacks
document.addEventListener("input", (event) => {
    if (event.target.classList.contains("snack-quantity")) {
        // Calcular el total de snacks
        snackTotal = 0;

        document.querySelectorAll(".snack-quantity").forEach(input => {
            const cantidad = parseInt(input.value) || 0;
            const precio = parseFloat(input.getAttribute("data-snack-price")) || 0;
            const subtotal = cantidad * precio;
            
            snackTotal += subtotal;
        });

        document.getElementById("snack-total").value =snackTotal;
    }
});


// Modificar el evento de reserva para enviar los asientos seleccionados
reserveButton.addEventListener('click', async () => {
    if (selectedSeats.length > 0 && selectedShow) {
        try {
            // Preparar los datos de la reserva
            const reservaData = {
                funcionId: selectedShow.id,
                asientos: selectedSeats
            };

            // Enviar la solicitud de reserva al backend
            const response = await fetch('http://localhost:8080/boletos/reservar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservaData)
            });

            if (!response.ok) {
                throw new Error('No se pudo realizar la reserva');
            }

            const resultado = await response.json();
            alert(`Reserva exitosa. Código de reserva: ${resultado.codigoReserva}`);
            
            // Limpiar selección de asientos
            selectedSeats = [];
            updateBookingSummary();
            
            // Actualizar la vista de asientos (para reflejar los asientos ocupados)
            mostrarAsientos(selectedShow.sala.id, selectedShow.id);

        } catch (error) {
            console.error('Error al realizar la reserva:', error);
            alert(error.message || 'Hubo un problema al realizar la reserva');
        }
    }
});

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
            alert("Cliente registrado exitosamente.");

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

