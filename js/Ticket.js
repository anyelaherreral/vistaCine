
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
        categorySelect.innerHTML = '<option value="">categoría</option>';

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
            const nameCategory=selectedCategory.descripcion;
            // Si se ha seleccionado una categoría, mostrar el precio
            if (selectedCategory) {
                document.getElementById('total-price').style.display = 'block';
                const totalPrice = selectedCategory.precio * selectedSeats.length;
                document.getElementById('total-price').textContent = `Total: $${totalPrice.toLocaleString()}`;
                // Llamar a la función para verificar el descuento
                cargarDescuento(selectedCategory.id, totalPrice, nameCategory);
            } else {
                // Si no se seleccionó una categoría, ocultar el precio
                document.getElementById('total-price').style.display = 'none';
                document.getElementById('discount-message').style.display = 'none';

            }
        });
        
    } catch (error) {
        console.error('Error al cargar las categorías:', error);
        alert('Hubo un problema al cargar las categorías de boletos');
    }
}

// Función para cargar los descuentos aplicables a la categoría seleccionada
async function cargarDescuento(categoriaId, precioTotal, nameCategory) {
    try {
        const response = await fetch('http://localhost:8080/api/categoria-boleto-promocion');
        
        if (!response.ok) {
            throw new Error('No se pudieron obtener los descuentos');
        }

        const promociones = await response.json();
        console.log('Descuentos aplicables:', promociones);
        
        // Buscar el descuento correspondiente a la categoría seleccionada
        const descuentoAplicable = promociones.find(promocion => promocion.categoriaBoleto.id === categoriaId);

        if (descuentoAplicable) {
            // Mostrar el mensaje de descuento y el precio con descuento
            const descuento = descuentoAplicable.descuento;
            const descripcionPromocion = descuentoAplicable.promocion.descripcion;
            const precioConDescuento = precioTotal-(precioTotal * (descuento / 100));

            // Actualizar el mensaje de descuento
            document.getElementById('discount-description').textContent = `Válido para aplicar descuento de ${descuento}% en boletos ${nameCategory}`;
            document.getElementById('discounted-price').textContent = `Precio con descuento aplicado: $${precioConDescuento.toLocaleString()}`;

            // Mostrar el contenedor de descuento
            document.getElementById('discount-message').style.display = 'block';
        } else {
            // Si no hay descuento aplicable, ocultar el mensaje de descuento
            document.getElementById('discount-message').style.display = 'none';
        }
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
    
    // Mostrar el total (aún no lo calcularemos, pero el formato se mantiene)
    totalPrice.textContent = `Total: $${(selectedSeats.length * 300).toLocaleString()}`; // Ejemplo de cálculo con un precio fijo

    // Actualizar el texto del botón de reserva
    reserveButton.textContent = `Reservar ${selectedSeats.length} asiento(s)`;
    reserveButton.disabled = selectedSeats.length === 0; // Deshabilitar el botón si no hay asientos seleccionados
}

// Función para cargar snacks
async function loadSnacks() {
    try {
        const response = await fetch('http://localhost:8080/snacks');
        if (!response.ok) throw new Error("Error al cargar los snacks");
        const snacks = await response.json();

        // Renderizar snacks
        snackContainer.innerHTML = ""; // Limpiar contenedor
        snacks.forEach((snack) => {
            const snackCard = document.createElement("div");
            snackCard.className = `snack-card ${
                snack.cantidadDisponible === 0 ? "disabled" : ""
            }`;

            // Detalles del snack
            snackCard.innerHTML = `
                <h3>${snack.id}</h3>
                <p>${snack.descripcion}</p>
                <p>Precio: $${snack.precio.toLocaleString()}</p>
                <p>Cantidad Disponible: ${snack.cantidadDisponible}</p>
                <button 
                    class="reserveSnack-button" 
                    ${snack.cantidadDisponible === 0 ? "disabled" : ""}
                    data-snack-id="${snack.id}">
                    Reservar
                </button>
            `;

            // Agregar al contenedor
            snackContainer.appendChild(snackCard);
        });
    } catch (error) {
        console.error("Error:", error);
        snackContainer.innerHTML = "<p>Error al cargar los snacks.</p>";
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
            
            // Actualizar la vista de asientos (para reflejar los asientos ocupados)
            mostrarAsientos(selectedShow.sala.id, selectedShow.id);

        } catch (error) {
            console.error('Error al realizar la reserva:', error);
            alert(error.message || 'Hubo un problema al realizar la reserva');
        }
    }
});
