/* Importamos las herramientas usando la sintaxis compatible con ES Modules */
import express from 'express';
import cors from 'cors';

// Se inicializa la aplicación de express
const app = express();

/* Middlewares */
app.use(express.json());
app.use(cors());

// Memoria del servidor 
let saldoUsuario = 25.00;

let menuRestaurante = [
    {id: 101, nombre: "Menú ejecutivo (Pollo)", precio: 5.50, stock: 12, categoria: "Fuerte"},
    {id: 102, nombre: "Pasta alfredo", precio: 6.00, stock: 8, categoria: "Fuerte"},
    {id: 103, nombre: "Ensalada César", precio: 3.50, stock: 15, categoria: "Entrada"},
    {id: 104, nombre: "Jugo natural", precio: 1.50, stock: 2, categoria: "Bebida"},
    {id: 105, nombre: "Agua mineral", precio: 1.00, stock: 20, categoria: "Bebida"}

];

let reserva_Actual = [];

/* 1- Primer endpoint: devuelve la lista completa de alimentos */
app.get('/api/menu', (req, res) => {
    res.status(200).json(menuRestaurante);
});

// 2- Segundo endpoint: devuelve el saldo, la reserva y el total calculado
app.get('/api/reserva', (req, res) => {
    let total = 0;

    for (let i = 0; i < reserva_Actual.length; i++) {
        let item = reserva_Actual[i];
        let plato = menuRestaurante.find(p => p.id === item.id);
        
        // CORREGIDO: Se agregó el operador * de multiplicación
        total = total + (plato.precio * item.cantidad);
    }

    res.status(200).json({
        saldo: saldoUsuario,
        itemsReservados: reserva_Actual,
        total: total
    });
});

// 3- Tercer endpoint: Agregar plato a la reserva
app.post('/api/reserva/agregar', (req, res) => {
    const { alimentoId, cantidad } = req.body;

    const platoMenu = menuRestaurante.find(p => p.id === alimentoId);

    if (!platoMenu) {
        return res.status(404).json({ mensaje: "El plato no existe" });
    }

    if (platoMenu.stock < cantidad) {
        return res.status(400).json({ mensaje: "Stock insuficiente" });
    }

    const totalActual = reserva_Actual.reduce((total, item) => {
        const plato = menuRestaurante.find(p => p.id === item.id);
        return total + (plato.precio * item.cantidad);
    }, 0);

    if (totalActual + (platoMenu.precio * cantidad) > saldoUsuario) {
        return res.status(400).json({ mensaje: "Saldo insuficiente para agregar este plato" });
    }

    const item_En_Reserva = reserva_Actual.find(item => item.id === alimentoId);

    if (item_En_Reserva) {
        item_En_Reserva.cantidad += cantidad;
    } else {
        reserva_Actual.push({ id: alimentoId, cantidad: cantidad });
    }

    platoMenu.stock -= cantidad;

    res.status(200).json({ mensaje: "Plato agregado", reserva: reserva_Actual });
});

// 4- Cuarto endpoint: Actualizar cantidad de un plato
app.put('/api/reserva/actualizar-porciones/:id', (req, res) => {
    const idPlato = parseInt(req.params.id);
    const { nuevaCantidad } = req.body;

    const item_En_Reserva = reserva_Actual.find(item => item.id === idPlato);
    if (!item_En_Reserva) {
        return res.status(404).json({ mensaje: "El plato no está en tu reserva" });
    } 

    const platoMenu = menuRestaurante.find(p => p.id == idPlato);

    let nuevoTotal = 0;
    for (let i = 0; i < reserva_Actual.length; i++) {
        let item = reserva_Actual[i];
        let plato = menuRestaurante.find(p => p.id === item.id);

        let cantidad = (item.id === idPlato) ? nuevaCantidad : item.cantidad;
        
        nuevoTotal += (plato.precio * cantidad);
    }

    if (nuevoTotal > saldoUsuario) {
        return res.status(400).json({ mensaje: "Saldo insuficiente para esta cantidad" });
    }

    if (nuevaCantidad > platoMenu.stock + item_En_Reserva.cantidad) {
        return res.status(400).json({ mensaje: "Stock insuficiente" });
    }

    platoMenu.stock = (platoMenu.stock + item_En_Reserva.cantidad) - nuevaCantidad;
    item_En_Reserva.cantidad = nuevaCantidad;

    if (item_En_Reserva.cantidad === 0) {
        reserva_Actual = reserva_Actual.filter(item => item.id !== idPlato);
    }

    res.status(200).json({ mensaje: "Cantidad actualizada", reserva: reserva_Actual });
});

// 5- Endpoint 5: Eliminar un plato del carrito
app.delete('/api/reserva/eliminar/:id', (req, res) => {
    const idPlato = parseInt(req.params.id);
    
    const itemEnReserva = reserva_Actual.find(item => item.id === idPlato);

    if (!itemEnReserva) {
        return res.status(404).json({ mensaje: "El plato no está en tu reserva" });
    }
    
    const platoMenu = menuRestaurante.find(p => p.id === idPlato);

    platoMenu.stock += itemEnReserva.cantidad;
    reserva_Actual = reserva_Actual.filter(item => item.id !== idPlato);

    res.status(200).json({ mensaje: "Plato eliminado", reserva: reserva_Actual });
});

// Se enciende el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
