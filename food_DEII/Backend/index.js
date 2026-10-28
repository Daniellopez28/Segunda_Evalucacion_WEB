//Importamos las herramientas, con ES modules
import express from  'express';
import cors from 'cors';
const port = 3000

//declaramos express en la constante 
const app = express();

//midlewares
app.use(express.json());
app.use(cors());

// quemamos el valor de el saldo que puede variar
let saldoUsuario = 25.00;

//arreglo con todo los platos registrados
let menuRestaurante = [
    {id: 101, nombre: "Menú ejecutivo (Pollo)", img:'https://img.freepik.com/fotos-premium/filete-pechuga-pollo-plancha-verdura_1339-43628.jpg?w=2000',descripcion: "Pechuga de pollo en salsa de hongos con vegetales salteados" ,precio: 5.50, stock: 12, categoria: "Fuerte"},
    {id: 102, nombre: "Pasta alfredo", img:'https://ellacooks.com/wp-content/uploads/2025/02/alfredo-5.png',descripcion: "Deliciosa pasta alfredo con cilantro, trozos de pechuga de pollo y queso gratinado", precio: 6.00, stock: 8, categoria: "Fuerte"},
    {id: 103, nombre: "Ensalada César", img:'https://imag.bonviveur.com/ensalada-cesar-casera.jpg',descripcion: "Lechuga, tomate y trozos de pan acompañado de salsa ranch y trocitos de jamon" ,precio: 3.50, stock: 15, categoria: "Entrada"},
    {id: 104, nombre: "Jugo natural", img: 'https://cdn.glotoncubano.com/posts/post-187/content/jugo-de-naranja-y-zanahoria-fresco-en-vaso-alto-con-naranja-y-hielo-cocina-cubana-aggk.webp',descripcion: "Jugo de naranja natural",precio: 1.50, stock: 2, categoria: "Bebida"},
    {id: 105, nombre: "Refresco de Jamaica", img: 'https://blog.oncosalud.pe/hubfs/Flor%20de%20Jamaica%20Cu%C3%A1les%20Son%20sus%20Beneficios.jpg',descripcion: "Preparada con flores naturales que le dan un sabor ligeramente acido, dulce y delicioso.",precio: 1.25, stock: 6, categoria: "Bebida"},
    {id: 105, nombre: "Refresco de Horchata", img: 'https://tse3.mm.bing.net/th/id/OIP.NuRXlIFI5oF7ofESeqxlfwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',descripcion: "Bebida de horchata, con un sabor dulce, cremoso y tradicional que combina deliciosos ingredientes naturales.",precio: 1.75, stock: 4, categoria: "Bebida"},
   

];

//arreglon que llevara el historial de reservas, iniciando en 0
let reserva_Actual = []

//enspoints

//Primer endpoint: devuelve la lista completa de alimentos
app.get('/api/menu', (req, res) => {
    res.status(200).json(menuRestaurante);
});

//Segundo endpoint: devuelve el saldo, la reserva y el total calculado
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

//Tercer endpoint: Agregar plato a la reserva
app.post('/api/reserva/agregar', (req, res) => {
    const { alimentoId, cantidad } = req.body;

    const platoMenu = menuRestaurante.find(p => p.id === alimentoId);

    //si el dato es un plato que no esta en el menu devolvera un 400 (bad request)
    if (!platoMenu) {
        return res.status(404).json({ mensaje: "El plato no existe" });
    }

    //si el plato esta agotado, devolvera un 409, por comflicto 
    if (platoMenu.stock < cantidad) {
        return res.status(409).json({ mensaje: "Stock insuficiente" });
    }

    //reduce todo el valor de la lsita en uno para tener un total 
    const totalActual = reserva_Actual.reduce((total, item) => {
        const plato = menuRestaurante.find(p => p.id === item.id); 
        return total + (plato.precio * item.cantidad); //precio final completo
    }, 0);

    //si el precio que sale en total es mayor a el saldo disponible
    if (totalActual + (platoMenu.precio * cantidad) > saldoUsuario) {
        return res.status(400).json({ mensaje: "Saldo insuficiente para agregar este plato" });
    }

    const item_En_Reserva = reserva_Actual.find(item => item.id === alimentoId); //busca el alimento que se reserva

    if (item_En_Reserva) { //si el plato ya estaba en la reserva se acumula la cantidad
        item_En_Reserva.cantidad += cantidad;
    } else { //si no estaba lo toma por primera vez con .push()
        reserva_Actual.push({ id: alimentoId, cantidad: cantidad });
    }

    //resta la cantidad al stock de dicho plato
    platoMenu.stock -= cantidad;

    //mensaje de reserva hecha
    res.status(200).json({ mensaje: "Plato agregado", reserva: reserva_Actual });
});

// Cuarto endpoint: Actualizar cantidad de un plato
app.put('/api/reserva/actualizar-porciones/:id', (req, res) => {
    const idPlato = parseInt(req.params.id);
    const { nuevaCantidad } = req.body;

    // Busca si el plato existe dentro de la reserva actual
    const item_En_Reserva = reserva_Actual.find(item => item.id === idPlato);
    if (!item_En_Reserva) {
        return res.status(404).json({ mensaje: "El plato no está en tu reserva" });
    } 

    const platoMenu = menuRestaurante.find(p => p.id == idPlato);

    let nuevoTotal = 0;
    //Bucle que calcula el costo total de toda la reserva 
    for (let i = 0; i < reserva_Actual.length; i++) {
        let item = reserva_Actual[i];
        let plato = menuRestaurante.find(p => p.id === item.id);

        //si es el plato que estamos actualizando usa la nueva cantidad, si no, usa la vieja
        let cantidad = (item.id === idPlato) ? nuevaCantidad : item.cantidad;
        
        // Suma parcial al acumulador del costo total
        nuevoTotal += (plato.precio * cantidad);
    }

    // Si el total es mayor al saldo da problemas de salgo por eso devuelve un 422
    if (nuevoTotal > saldoUsuario) {
        return res.status(422).json({ mensaje: "Saldo insuficiente para esta cantidad" });
    }

    // Calcula si la nueva cantidad excede el stock real disponible sumándole lo que ya tenía apartado el usuario
    if (nuevaCantidad > platoMenu.stock + item_En_Reserva.cantidad) {
        return res.status(422).json({ mensaje: "Stock insuficiente" });
    }

    // Actualiza el stock del restaurante devolviendo lo anterior y descontando la nueva cantidad solicitada
    platoMenu.stock = (platoMenu.stock + item_En_Reserva.cantidad) - nuevaCantidad;
    item_En_Reserva.cantidad = nuevaCantidad;

    // Si el usuario reduce la cantidad a 0, se elimina automáticamente el plato de la reserva usando filter
    if (item_En_Reserva.cantidad === 0) {
        reserva_Actual = reserva_Actual.filter(item => item.id !== idPlato);
    }

    res.status(200).json({ mensaje: "Cantidad actualizada", reserva: reserva_Actual });
});

// Quinto Endpoint: Eliminar un plato del carrito
app.delete('/api/reserva/eliminar/:id', (req, res) => {
    const idPlato = parseInt(req.params.id);
    
    const itemEnReserva = reserva_Actual.find(item => item.id === idPlato);

    // Si el plato no se encuentra en la reserva, devuelve un 404 (Not Found) correctamente
    if (!itemEnReserva) {
        return res.status(404).json({ mensaje: "El plato no está en tu reserva" });
    }
    
    const platoMenu = menuRestaurante.find(p => p.id === idPlato);

    // Devuelve al inventario general del restaurante las unidades que el usuario tenía reservadas
    platoMenu.stock += itemEnReserva.cantidad;
    
    // Remueve el plato de la reserva filtrando todos los elementos excepto el que se va a eliminar
    reserva_Actual = reserva_Actual.filter(item => item.id !== idPlato);

    res.status(200).json({ mensaje: "Plato eliminado", reserva: reserva_Actual });
});

// Se enciende el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});