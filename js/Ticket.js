
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
const selectedSeatsInfo = document.getElementById('selected-seats-info');
const movieDateInput = document.getElementById('movie-date');
const snackContainer = document.getElementById("snack-container");
const buscadorsnacks = document.getElementById("buscadorSnacks");


let selectedSnacks = [];
let selectedShow = null;
let selectedSeats = [];
let ObjSeats = [];

movieDateInput.addEventListener('change', () => {
    const selectedDate = movieDateInput.value; 
    buscarFuncionesPorFecha(selectedDate);
});


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
      mostrarFuncionesEnSelector(funciones);
  
    } catch (error) {
      console.error("Error al obtener funciones:", error);
      alert(error.message || "Hubo un problema al obtener las funciones.");
    }
}


function mostrarFuncionesEnSelector(funciones) {
    movieShowSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Selecciona una función";
    defaultOption.value = "";
    movieShowSelect.appendChild(defaultOption);
  
    funciones.forEach(funcion => {
    const option = document.createElement("option");
    option.value = funcion.id;
    option.textContent = `Película: ${funcion.pelicula.titulo || "Sin título"}, Hora: ${funcion.horario || "Sin hora"}`;
    movieShowSelect.appendChild(option);
  });
}


movieShowSelect.addEventListener("change", async (event) => {
    const selectedFunctionId = event.target.value;
    if (selectedFunctionId) {
        try {
            const apiUrl = `http://localhost:8080/funciones/${selectedFunctionId}`;
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error("No se pudo obtener la información de la función seleccionada.");
            }

            selectedShow = await response.json();
            mostrarAsientos(selectedShow.sala.id, selectedShow.id);
            updateShowInfo(selectedShow);

        } catch (error) {
            console.error("Error al obtener los datos de la función:", error);
            selectedShow = null;
        }
    } else {
        selectedShow = null; 
    }
});


function updateShowInfo(selectedShow) {
    if (selectedShow) {
        movieTitleTime.textContent = `${selectedShow.pelicula.titulo} - ${selectedShow.horario}`;
        theaterRoomInfo.textContent = `Sala: ${selectedShow.sala.id}`;
        ticketPriceInfo.textContent = `Proyección: ${selectedShow.sala.tipoProyeccion.descripcion}`;
        movieDuration.textContent = `Duración: ${selectedShow.pelicula.duracion}`;
        movieSynopsis.textContent = `Sinopsis: ${selectedShow.pelicula.sinopsis}`;
        movieGenre.textContent = `Género: ${selectedShow.pelicula.genero.descripcion}`;
        theaterRoomSeats.textContent = `Asientos totales: ${selectedShow.sala.num_asientos}`;

        movieShowInfo.style.display = "block";
    } else {
        movieShowInfo.style.display = "none";
    }
}

async function mostrarAsientos(salaId, funcionId) {
    try {
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
        theaterSeatingLayout.innerHTML = '<div class="theater-screen">Pantalla</div>';
        const asientosPorFila = {};
        asientosDisponibles.forEach(asiento => {
            const fila = asiento.letra; // Usamos 'letra' para las filas
            if (!asientosPorFila[fila]) {
                asientosPorFila[fila] = [];
            }
            asientosPorFila[fila].push(asiento);
        });
            
        Object.keys(asientosPorFila).forEach(fila => {
            const filaDiv = document.createElement("div");
            filaDiv.classList.add("seat-row");

            asientosPorFila[fila].forEach(asiento => {
                const asientoButton = document.createElement("button");
                asientoButton.classList.add("theater-seat");
                asientoButton.textContent = `${asiento.letra}${asiento.numeroAsiento}`; // Usamos 'numeroAsiento' para el número del asiento
                asientoButton.dataset.seatId = `${asiento.letra}${asiento.numeroAsiento}`;

                const isOccupied = asientosOcupados.some(ocupado => ocupado.letra === asiento.letra && ocupado.numeroAsiento === asiento.numeroAsiento);
                if (isOccupied) {
                    asientoButton.classList.add("seat-occupied");
                    asientoButton.disabled = true;
                } else {
                    asientoButton.classList.add("seat-available");
                    asientoButton.addEventListener("click", () => seleccionAsientos(asientoButton.dataset.seatId, asientoButton, asiento));
                }
                filaDiv.appendChild(asientoButton);
            });
            theaterSeatingLayout.appendChild(filaDiv);
        });

        theaterSeatingLayout.style.display = "block";

    } catch (error) {
        console.error("Error al mostrar los asientos:", error);
        alert(error.message || "Hubo un problema al mostrar los asientos.");
    }
}

function seleccionAsientos(seatId, seatButton, asiento) {
    
    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter(id => id !== seatId);
        seatButton.classList.remove("seat-selected");
        ObjSeats = ObjSeats.filter(seat => seat.id !== seatId);
    } else {
        selectedSeats.push(seatId);
        seatButton.classList.add("seat-selected");
        ObjSeats.push(asiento);
    }
    updateBookingSummary();
}

let totalBoletosConDescuento = 0;


async function cargarCategorias() {
    try {
        const response = await fetch('http://localhost:8080/api/categorias-boletos');
        if (!response.ok) {
            throw new Error('No se pudieron obtener las categorías de boletos');
        }

        const categorias = await response.json();
        const categorySelect = document.getElementById('category-select');
        categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = `${categoria.descripcion} - $${categoria.precio.toLocaleString()}`;
            categorySelect.appendChild(option);
        });

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

        totalBoletosConDescuento = parseFloat(precioConDescuento.toFixed(2));
    } catch (error) {
        console.error('Error al cargar los descuentos:', error);
        alert('Hubo un problema al cargar los descuentos');
    }
}

function updateBookingSummary() {
    if (selectedSeats.length > 0) {
        document.getElementById("booking-summary").style.display = "block"; // Mostrar el resumen
        cargarCategorias();
        loadSnacks();
    } else {
        document.getElementById("booking-summary").style.display = "none"; // Ocultar el resumen si no hay asientos seleccionados
    }
    selectedSeatsInfo.textContent = `Asientos seleccionados: ${selectedSeats.join(', ')}`;
    reserveButton.textContent = `Realizar pedido`;
    reserveButton.disabled = selectedSeats.length === 0; // Deshabilitar el botón si no hay asientos seleccionados
}

// Función para cargar snacks
let snacks = [];

// Función para cargar snacks
async function loadSnacks() {
    try {
        const [snacksResponse, promociones] = await Promise.all([
            fetch('http://localhost:8080/snacks'), // Ajusta la URL si es necesario
            cargarPromocionesSnacks(), // Asegúrate de tener esta función definida
        ]);

        if (!snacksResponse.ok) throw new Error("Error al cargar los snacks");

        snacks = await snacksResponse.json(); // Asigna los snacks a la variable global
        snackContainer.innerHTML = "";
        snacks.forEach((snack) => {
            const snackPromo = promociones.find(promo => promo.snack.id === snack.id);
            const descuento = snackPromo ? snackPromo.descuento : 0;
            const precioConDescuento = snackPromo ? snack.precio * (1 - descuento / 100) : snack.precio;

            const snackCard = document.createElement("div");
            snackCard.className = `snack-card ${snack.cantidadDisponible === 0 ? "disabled" : ""}`;

            snackCard.innerHTML = `
                <h3>${snack.id}</h3> <!-- Mostrar el ID del snack -->
                <p>Descripción: ${snack.descripcion}</p>
                <p>Precio: $${snack.precio.toLocaleString()}</p>
                ${descuento > 0 ? `<p>Descuento: ${descuento}%</p><p>Precio con descuento: $${precioConDescuento.toLocaleString()}</p>` : ""}
                <p>Cantidad Disponible: ${snack.cantidadDisponible}</p>
                <label for="quantity-${snack.id}">Cantidad:</label>
                <input type="number" id="quantity-${snack.id}" class="snack-quantity" value="0" min="0" max="${snack.cantidadDisponible}" data-snack-id="${snack.id}" data-snack-price="${precioConDescuento}" />
            `;
            snackContainer.appendChild(snackCard);
        });

        // Mostrar la sección de snacks si hay resultados
        document.getElementById("snacks-section").style.display = snacks.length > 0 ? "block" : "none";
    } catch (error) {
        console.error("Error al cargar los snacks:", error);
        snackContainer.innerHTML = "<p>Error al cargar los snacks.</p>";
        document.getElementById("snacks-section").style.display = "none";
    }
}


//BUSCADOR DE Snacks

function mostrarsnacks(snacksFiltradas) {
    snackContainer.innerHTML = "";  // Limpiar el contenedor de snacks
    snacksFiltradas.forEach((snack) => {
        const snackCard = document.createElement("div");
        snackCard.className = `snack-card ${snack.cantidadDisponible === 0 ? "disabled" : ""}`;

        snackCard.innerHTML = `
            <h3>${snack.id}</h3> <!-- Mostrar el ID del snack -->
            <p>Descripción: ${snack.descripcion}</p>
            <p>Precio: $${snack.precio.toLocaleString()}</p>
            <p>Cantidad Disponible: ${snack.cantidadDisponible}</p>
            <label for="quantity-${snack.id}">Cantidad:</label>
            <input type="number" id="quantity-${snack.id}" class="snack-quantity" value="0" min="0" max="${snack.cantidadDisponible}" data-snack-id="${snack.id}" data-snack-price="${snack.precio}" />
        `;
        snackContainer.appendChild(snackCard);
    });

    // Si no hay snacks filtrados, mostrar un mensaje
    if (snacksFiltradas.length === 0) {
        snackContainer.innerHTML = "<p>No se encontraron snacks que coincidan con la búsqueda.</p>";
    }
}

// Función para filtrar snacks solo por ID

function filtrarSnacks() {
    const termino = buscadorSnacks.value.toLowerCase();  // Obtener el valor del buscador
    const snacksFiltrados = snacks.filter(
        (snack) => snack.id.toLowerCase().includes(termino)  // Filtrar por nombre (id) del snack
    );
    mostrarsnacks(snacksFiltrados);  // Mostrar los snacks filtrados
}

// Evento de entrada en el campo de búsqueda
buscadorSnacks.addEventListener("input", filtrarSnacks);

// Función para actualizar el total combinado (boletos + snacks)
document.getElementById('calculate-total').addEventListener('click', () => {
    const combinedTotal = totalBoletosConDescuento + snackTotal;
    const formattedTotal = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(combinedTotal);
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

let snackTotal = 0;
document.addEventListener("input", (event) => {
    if (event.target.classList.contains("snack-quantity")) {
        snackTotal = 0;
        document.querySelectorAll(".snack-quantity").forEach(input => {
            const cantidad = parseInt(input.value) || 0;
            const precio = parseFloat(input.getAttribute("data-snack-price")) || 0;
            const subtotal = cantidad * precio;
            const snackId = input.getAttribute("data-snack-id");

            snackTotal += subtotal;
            if (cantidad > 0) {
                const existingSnack = selectedSnacks.find(snack => snack.id === snackId);
                if (existingSnack) {
                    existingSnack.cantidad = cantidad;
                } else {
                    selectedSnacks.push({
                        id: snackId, 
                        cantidad: cantidad,
                        precio: precio, 
                    });
                }
            }
        });
        document.getElementById("snack-total").value = snackTotal;
    }
});


import Pedido from './Pedido.js';
import { clientId } from './ClienteT.js';
import { clienteNombre } from './ClienteT.js';

    const pedidoService = new Pedido('http://localhost:8080');
    const reserveButton = document.getElementById('reserve-button');
    const modal = document.getElementById('order-modal');
    const closeModal = document.getElementById('close-modal');
    const confirmOrderButton = document.getElementById('confirm-order');
    const paymentMethodSelect = document.getElementById('payment-method-select');
    
// Mostrar el modal con el resumen del pedido
reserveButton.addEventListener('click', async () => {
    if (selectedSeats.length > 0 && selectedShow) {
        if (!clientId) {
            alert('Por favor, busca o registra un cliente antes de realizar la reserva.');
            return;
        }
                
        try {
           const paymentMethods = await pedidoService.obtenerMetodosDePago();
            paymentMethodSelect.innerHTML = '<option value="">Seleccione un método</option>';
            paymentMethods.forEach((method) => {
                const option = document.createElement('option');
                option.value = method.id;
                option.textContent = method.descripcion;
                paymentMethodSelect.appendChild(option);
            });
            document.getElementById('order-date').textContent = new Date().toISOString().split('T')[0];
            document.getElementById('order-total').textContent = `$${(totalBoletosConDescuento + snackTotal).toLocaleString('es-CO')}`;
            document.getElementById('order-client').textContent = `${clienteNombre}`;
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error al cargar métodos de pago o mostrar modal:', error);
            alert('Hubo un problema al preparar el resumen del pedido.');
        }
    } else {
        alert('Selecciona al menos un asiento para realizar la reserva.');
    }
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

confirmOrderButton.addEventListener('click', async () => {
    const selectedPaymentMethod = paymentMethodSelect.value;
    if (!selectedPaymentMethod) {
        alert('Por favor, selecciona un método de pago.');
        return;
    }
    const categorySelect = document.getElementById('category-select');
    const selectedCategoryId = categorySelect.value;
    if (!selectedCategoryId) {
        alert('Por favor, selecciona una categoría de boleto.');
        return;
    }
    const pedido = {
        fecha: new Date().toISOString().split('T')[0],
        total: totalBoletosConDescuento + snackTotal,
        cliente: { id: clientId },
        metodoPago: { id: parseInt(selectedPaymentMethod) },
    };
    try {
        const pedidoCreado = await pedidoService.crearPedido(pedido);
        const pedidoId = pedidoCreado.id;
        const boletos = ObjSeats.map((seat) => ({
            asiento: { id: seat.id}, 
            funcion: { id: selectedShow.id }, 
            categoriaBoleto: { id: selectedCategoryId }, 
            pedido: { id: pedidoId },
        }));
        const boletosCreados = await pedidoService.crearBoletos(boletos);
        await actualizarCantidadSnacks();

        alert(`Pedido realizado con éxito. Boletos generados: ${boletosCreados.length}`);
        modal.style.display = 'none';
        window.location.reload();
    } catch (error) {
        console.error('Error al procesar el pedido:', error);
        alert('Hubo un problema al procesar el pedido.');
    }
});

async function actualizarCantidadSnacks() {
    try {
        for (const snack of selectedSnacks) {
            const snackId = snack.id;
            const cantidad = snack.cantidad;
            const response = await fetch(`http://localhost:8080/snacks/${encodeURIComponent(snackId)}/restar/${cantidad}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar el snack ${snackId}`);
            }

            const resultado = await response.json();
        }
    } catch (error) {
        console.error('Error al actualizar los snacks:', error);
        alert('Hubo un problema al actualizar los snacks.');
    }
}





