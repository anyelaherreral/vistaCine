export default class Pedido {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async obtenerMetodosDePago() {
        try {
            const response = await fetch(`${this.apiUrl}/metodosdepago`);
            if (!response.ok) throw new Error('Error al obtener métodos de pago.');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async crearPedido(pedido) {
        try {
            const response = await fetch(`${this.apiUrl}/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido),
            });
            if (!response.ok) throw new Error('Error al crear el pedido.');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async crearBoletos(boletos) {
        try {
            const response = await fetch(`${this.apiUrl}/boletos/ListaBoletos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(boletos),
            });
            if (!response.ok) throw new Error('Error al crear boletos.');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
