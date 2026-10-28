
import express from 'express';
import cors from 'cors';

const port = 3000;
const app = express();

app.use(express.json());
app.use(cors());

let menuRestaurante = [
    {
        id: 101,
        nombre: "Menú ejecutivo (Pollo)",
        img: 'https://img.freepik.com/fotos-premium/filete-pechuga-pollo-plancha-verdura_1339-43628.jpg?w=2000',
        descripcion: "Pechuga de pollo en salsa de hongos con vegetales salteados",
        precio: 5.50,
        stock: 12,
        categoria: "Fuerte"
    },
    {
        id: 102,
        nombre: "Pasta alfredo",
        img: 'https://ellacooks.com/wp-content/uploads/2025/02/alfredo-5.png',
        descripcion: "Deliciosa pasta alfredo con cilantro, trozos de pechuga de pollo y queso gratinado",
        precio: 6.00,
        stock: 8,
        categoria: "Fuerte"
    },
    {
        id: 103,
        nombre: "Ensalada César",
        img: 'https://imag.bonviveur.com/ensalada-cesar-casera.jpg',
        descripcion: "Lechuga, tomate y trozos de pan acompañado de salsa ranch y trocitos de jamon",
        precio: 3.50,
        stock: 15,
        categoria: "Entrada"
    },
    {
        id: 104,
        nombre: "Jugo natural",
        img: 'https://cdn.glotoncubano.com/posts/post-187/content/jugo-de-naranja-y-zanahoria-fresco-en-vaso-alto-con-naranja-y-hielo-cocina-cubana-aggk.webp',
        descripcion: "Jugo de naranja natural",
        precio: 1.50,
        stock: 2,
        categoria: "Bebida"
    },
    {
        id: 105,
        nombre: "Refresco de Jamaica",
        img: 'https://blog.oncosalud.pe/hubfs/Flor%20de%20Jamaica%20Cu%C3%A1les%20Son%20sus%20Beneficios.jpg',
        descripcion: "Preparada con flores naturales que le dan un sabor ligeramente acido, dulce y delicioso.",
        precio: 1.25,
        stock: 6,
        categoria: "Bebida"
    },
    {
        id: 106,
        nombre: "Refresco de Horchata",
        img: 'https://tse3.mm.bing.net/th/id/OIP.NuRXlIFI5oF7ofESeqxlfwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
        descripcion: "Bebida de horchata, con un sabor dulce, cremoso y tradicional que combina deliciosos ingredientes naturales.",
        precio: 1.75,
        stock: 4,
        categoria: "Bebida"
    }
];

// Usuarios del sistema
let usuarios = [
    { id: 1, nombre: "Ana", usuario: "ana", password: "1234", saldo: 25.00 },
    { id: 2, nombre: "Carlos", usuario: "carlos", password: "1234", saldo: 30.00 },
    { id: 3, nombre: "Maria", usuario: "maria", password: "1234", saldo: 55.00 }
];

// cada usuario tendrá su propia reserva
let reservasPorUsuario = {};

function obtenerUsuario(req) {
    const idUsuario = Number(req.headers['x-usuario-id']);
    return usuarios.find(usuario => usuario.id === idUsuario);
}

//obtener la reserva por usuario
function obtenerReservaUsuario(idUsuario) {
    if (!reservasPorUsuario[idUsuario]) {
        reservasPorUsuario[idUsuario] = [];
    }

    return reservasPorUsuario[idUsuario];
}

// Obtener menú
app.get('/api/menu', (req, res) => {
    res.status(200).json(menuRestaurante);
});

// Obtener reserva del usuario identificado
app.get('/api/reserva', (req, res) => {
    const usuarioEncontrado = obtenerUsuario(req);

    if (!usuarioEncontrado) {
        return res.status(401).json({
            mensaje: "Usuario no identificado. Envía el encabezado x-usuario-id."
        });
    }

    const reserva_Actual = obtenerReservaUsuario(usuarioEncontrado.id);

    let total = 0;

    for (let i = 0; i < reserva_Actual.length; i++) {
        const item = reserva_Actual[i];
        const plato = menuRestaurante.find(p => p.id === item.id);

        if (plato) {
            total += plato.precio * item.cantidad;
        }
    }

    res.status(200).json({
        saldo: usuarioEncontrado.saldo,
        itemsReservados: reserva_Actual,
        total: Number(total.toFixed(2))
    });
});

// Agregar un plato a la reserva
app.post('/api/reserva/agregar', (req, res) => {
    const usuarioEncontrado = obtenerUsuario(req);

    if (!usuarioEncontrado) {
        return res.status(401).json({
            mensaje: "Usuario no identificado. Envía el encabezado x-usuario-id."
        });
    }

    const reserva_Actual = obtenerReservaUsuario(usuarioEncontrado.id);
    const { alimentoId, cantidad } = req.body;

    const platoMenu = menuRestaurante.find(p => p.id === alimentoId);

    if (!platoMenu) {
        return res.status(404).json({
            mensaje: "El plato no existe"
        });
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
            mensaje: "La cantidad debe ser un número entero mayor que cero"
        });
    }

    if (platoMenu.stock < cantidad) {
        return res.status(409).json({
            mensaje: "Stock insuficiente"
        });
    }

    const totalActual = reserva_Actual.reduce((total, item) => {
        const plato = menuRestaurante.find(p => p.id === item.id);
        return total + (plato ? plato.precio * item.cantidad : 0);
    }, 0);

    if (totalActual + (platoMenu.precio * cantidad) > usuarioEncontrado.saldo) {
        return res.status(400).json({
            mensaje: "Saldo insuficiente para agregar este plato"
        });
    }

    const item_En_Reserva = reserva_Actual.find(
        item => item.id === alimentoId
    );

    if (item_En_Reserva) {
        item_En_Reserva.cantidad += cantidad;
    } else {
        reserva_Actual.push({
            id: alimentoId,
            cantidad
        });
    }

    platoMenu.stock -= cantidad;

    res.status(200).json({
        mensaje: "Plato agregado",
        reserva: reserva_Actual
    });
});

// Actualizar cantidad de un plato
app.put('/api/reserva/actualizar-porciones/:id', (req, res) => {
    const usuarioEncontrado = obtenerUsuario(req);

    if (!usuarioEncontrado) {
        return res.status(401).json({
            mensaje: "Usuario no identificado. Envía el encabezado x-usuario-id."
        });
    }

    const reserva_Actual = obtenerReservaUsuario(usuarioEncontrado.id);
    const idPlato = parseInt(req.params.id, 10);
    const { nuevaCantidad } = req.body;

    const item_En_Reserva = reserva_Actual.find(
        item => item.id === idPlato
    );

    if (!item_En_Reserva) {
        return res.status(404).json({
            mensaje: "El plato no está en tu reserva"
        });
    }

    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 0) {
        return res.status(400).json({
            mensaje: "La cantidad debe ser un número entero igual o mayor que cero"
        });
    }

    const platoMenu = menuRestaurante.find(p => p.id === idPlato);

    if (!platoMenu) {
        return res.status(404).json({
            mensaje: "El plato no existe en el menú"
        });
    }

    // Calcular el total con la nueva cantidad
    let nuevoTotal = 0;

    for (const item of reserva_Actual) {
        const plato = menuRestaurante.find(p => p.id === item.id);

        if (plato) {
            const cantidad = item.id === idPlato
                ? nuevaCantidad
                : item.cantidad;

            nuevoTotal += plato.precio * cantidad;
        }
    }

    if (nuevoTotal > usuarioEncontrado.saldo) {
        return res.status(422).json({
            mensaje: "Saldo insuficiente para esta cantidad"
        });
    }

    // Verificar que haya suficiente inventario
    if (nuevaCantidad > platoMenu.stock + item_En_Reserva.cantidad) {
        return res.status(422).json({
            mensaje: "Stock insuficiente"
        });
    }

    // Ajustar inventario según la cantidad nueva
    platoMenu.stock =
        platoMenu.stock + item_En_Reserva.cantidad - nuevaCantidad;

    if (nuevaCantidad === 0) {
        const indice = reserva_Actual.findIndex(
            item => item.id === idPlato
        );

        if (indice !== -1) {
            reserva_Actual.splice(indice, 1);
        }
    } else {
        item_En_Reserva.cantidad = nuevaCantidad;
    }

    res.status(200).json({
        mensaje: "Cantidad actualizada",
        reserva: reserva_Actual
    });
});

// Eliminar un plato de la reserva del usuario
app.delete('/api/reserva/eliminar/:id', (req, res) => {
    const usuarioEncontrado = obtenerUsuario(req);

    if (!usuarioEncontrado) {
        return res.status(401).json({
            mensaje: "Usuario no identificado. Envía el encabezado x-usuario-id."
        });
    }

    const reserva_Actual = obtenerReservaUsuario(usuarioEncontrado.id);
    const idPlato = parseInt(req.params.id, 10);

    const itemEnReserva = reserva_Actual.find(
        item => item.id === idPlato
    );

    if (!itemEnReserva) {
        return res.status(404).json({
            mensaje: "El plato no está en tu reserva"
        });
    }

    const platoMenu = menuRestaurante.find(p => p.id === idPlato);

    if (platoMenu) {
        platoMenu.stock += itemEnReserva.cantidad;
    }

    const indice = reserva_Actual.findIndex(
        item => item.id === idPlato
    );

    if (indice !== -1) {
        reserva_Actual.splice(indice, 1);
    }

    res.status(200).json({
        mensaje: "Plato eliminado",
        reserva: reserva_Actual
    });
});

// Obtener usuarios sin mostrar sus contraseñas
app.get('/api/usuarios', (req, res) => {
    const usuariosPublicos = usuarios.map(
        ({ password, ...usuario }) => usuario
    );

    res.status(200).json(usuariosPublicos);
});

// Iniciar sesión
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;

    const usuarioEncontrado = usuarios.find(
        u => u.usuario === usuario && u.password === password
    );

    if (!usuarioEncontrado) {
        return res.status(401).json({
            mensaje: "Usuario o contraseña incorrectos"
        });
    }

    const { password: contrasena, ...usuarioPublico } = usuarioEncontrado;

    res.status(200).json({
        mensaje: "Inicio de sesión exitoso",
        usuario: usuarioPublico
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
