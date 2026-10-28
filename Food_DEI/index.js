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
    {id: 101, nombre: "Menú ejecutivo (Pollo)", img:'https://img.freepik.com/fotos-premium/filete-pechuga-pollo-plancha-verdura_1339-43628.jpg?w=2000',descripcion: "Pechuga de pollo en salsa de hongos con vegetales salteados" ,precio: 5.50, stock: 12, categoria: "Fuerte"},
    {id: 102, nombre: "Pasta alfredo", img:'https://ellacooks.com/wp-content/uploads/2025/02/alfredo-5.png',descripcion: "Deliciosa pasta alfredo con cilantro, trozos de pechuga de pollo y queso gratinado", precio: 6.00, stock: 8, categoria: "Fuerte"},
    {id: 103, nombre: "Ensalada César", img:'https://imag.bonviveur.com/ensalada-cesar-casera.jpg',descripcion: "Lechuga, tomate y trozos de pan acompañado de salsa ranch y trocitos de jamon" ,precio: 3.50, stock: 15, categoria: "Entrada"},
    {id: 104, nombre: "Jugo natural", img: 'https://cdn.glotoncubano.com/posts/post-187/content/jugo-de-naranja-y-zanahoria-fresco-en-vaso-alto-con-naranja-y-hielo-cocina-cubana-aggk.webp',descripcion: "Jugo de naranja natural",precio: 1.50, stock: 2, categoria: "Bebida"},
    {id: 105, nombre: "Refresco de Jamaica", img: 'https://blog.oncosalud.pe/hubfs/Flor%20de%20Jamaica%20Cu%C3%A1les%20Son%20sus%20Beneficios.jpg',descripcion: "Preparada con flores naturales que le dan un sabor ligeramente acido, dulce y delicioso.",precio: 1.25, stock: 6, categoria: "Bebida"},
    {id: 105, nombre: "Refresco de Horchata", img: 'https://tse3.mm.bing.net/th/id/OIP.NuRXlIFI5oF7ofESeqxlfwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',descripcion: "Bebida de horchata, con un sabor dulce, cremoso y tradicional que combina deliciosos ingredientes naturales.",precio: 1.75, stock: 4, categoria: "Bebida"},
   

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