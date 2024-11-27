
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

// Función para actualizar el resumen de la reserva
function updateBookingSummary() {
    // Verificar si hay una función seleccionada
    if (selectedShow) {
        // Calcular el precio total (asumiendo un precio por asiento)
        const totalPriceValue = selectedShow.precioEntrada * selectedSeats.length;
        
        // Actualizar la información de asientos seleccionados
        selectedSeatsInfo.textContent = `Asientos seleccionados: ${selectedSeats.join(', ')}`;
        
        // Actualizar el precio total
        totalPrice.textContent = `Total: $${totalPriceValue.toLocaleString()}`;
        
        // Actualizar el botón de reserva
        reserveButton.textContent = `Reservar ${selectedSeats.length} asiento(s)`;
        reserveButton.disabled = selectedSeats.length === 0;
    }
}



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
            
            // Actualizar la vista de asientos
            obtenerAsientosPorFuncion(selectedShow.id, selectedShow.sala.num_asientos);

        } catch (error) {
            console.error('Error al realizar la reserva:', error);
            alert(error.message || 'Hubo un problema al realizar la reserva');
        }
    }
});
// Inicialización
// generateSeats();
// updateBookingSummary();
// populateShowSelector();