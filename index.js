/*importamos las herramientas
el framework que crea el servidor y maneja las rutas
y el cors , que permite que react que esta en tro puerto 
se conecte */ 
const express = require('express');
const cors = require ('cors');

//se inicializa la aplicacion de express
const app = express();

/*Middlewares hace que el servidor comprenda el JSON
que se le manda al frontend
y el segundo activa el permiso para que react pueda 
hacer peticiones*/
 app.use(express.json());
 app.use(cors());

 //memoria del servidor 

 /*El dinero inicial del usuario tipo let porque va a cambiar*/
 let saldoUsuario = 25.00;
 
 /*el arreglo con los platos disponibles , junto a sus precios
 cuanto hay en stock, categoria y su codigo de identificacion 
 por plato*/

 let menuRestaurante = [{id:101, nombre: "Menú ejecutivo (Pollo)", precio: 5.50, stock: 12, categoria: "Fuerte"},
    {id: 102, nombre: "Pasta alfredo", precio: 6.00, stock: 8, categoria: "Fuerte"},
    {id: 103, nombre: "Ensalada César", precio: 3.50, stock: 15, categoria: "Entrada"},
    {id : 104, nombre: "Jugo natural", precio: 1.50, stock:2, categoria: "Bebida"}
 ];

 //carrito vacio donde se guardara la reserva actual
 let reserva_Actual = [];

 
 /*1-Primer endpoint: devuelve la lista completa de alimentos*/
 /*Si el frontend hace una peticio tipo get a la ruta api/menu
 req pida la peticion del cliente, y obvio res es la respuesta del servidor*/  
 app.get('/api/menu', (req, res) =>{
    res.status(200).json(menuRestaurante);
 });
/*res.status basicamente todo salio nitido, que la peticion salio exitosa
.json(menuRestaurante) toma las variables de arriba las pasa a JSON
para despues ir al frontend*/ 

//2- segundo endpoint , devuelve el saldo, la reserva y el total calculado
app.get('/api/reserva', (req, res) =>{
    /*Obvio el contador empieza desde cero
    aqui se va acumulando el dinero que el usuario lleve en ela carrito*/ 
    let total = 0;

    /*Recorremos cada item que el usuario tiene en su reserva
    Le dice al servidor recorreo el arreglo desde el primer plato
    hasta el ultimo*/ 
    for(let i = 0; i < reserva_Actual.length; i++){
        //variable que guarda el plato que se esta recorriendo en la reserva
        let item = reserva_Actual[i];

        /*Buscamos el plato en el menú para tener su precio actual
        otra variable, con metodo find(encontrar) de los arreglos
        el cartio guarda el id del plato, entonces se busca desde ahi*/
        let plato = menuRestaurante.find(p => p.id === item.id);

        /*sumamos al total: (precio del plato * cantidad en la reserva)
        pues nada solo multiplicamos la cantidad por el precio y lo sumamos*/ 
        total = total + (plato.precio * item.cantidad);
    }
    /*Respondemos con el estado de la cuenta
    devolvemos un objeto detipo JSON que tiene 3 cosas
    el dinero que le queda al usuario
    los paltos que tiene 
    y cuenta total, todo esto lo usara el frontend*/
    res.status(200).json({
        saldo: saldoUsuario,
        itemsReservados: reserva_Actual,
        total: total
    });
});

//3- Tercer endpoint: Agregar plato a la reserva (valida en stock)
/*post lo uso para enviar datos y crear algo nuevo(en este casi en el carrito)*/ 
app.post('/api/reserva/agregar', (req, res) => {
/*El Frontend nos manda un JSON con el ID del plato y la cantidad, 
y nosotros lo extraemos así.*/
const {alimentoId, cantidad} = req.body;

/*1. Buscamos el plato en el menú con find(encontrar)*/
const platoMenu = menuRestaurante.find(p => p.id === alimentoId);

if(!platoMenu){
return res.status(404).json({mensaje: "El plato no existe"});
}

/*2.Validamos que haya stock suficiente
validacion re *inserta meme de gato nerd* importante: en plan si el usuario pide 2 pastas 
pero solo queda 1 en e inventario, servidor corta la petición
y responde con un error*/
if(platoMenu.stock < cantidad){
return res.status(400).json({mensaje: "Stock insuficiente"});
}

/*3. Buscamos si el plato ya está en el carrito, si ya lo lleva*/
const item_En_Reserva = reserva_Actual.find(item => item.id === alimentoId);

if(item_En_Reserva){
//si ya existe, solo aumentamos la cantidad
item_En_Reserva.cantidad += cantidad;
}else{
    //si no existe, lo agregamos al carrito
    reserva_Actual.push({id: alimentoId, cantidad: cantidad});
}

/*4. Le restamos el stock al menú general, pus si ya se llevaro uno
obvio debe disminuir el stock*/
platoMenu.stock -= cantidad;

res.status(200).json({mensaje: "Plato agregado", reserva: reserva_Actual});
});


/*4-Cuarto endpoint:Actualizar 
cantidad de un plato (valida saldo)*/
app.put('/api/reserva/actualizar-porciones/:id', (req,res) => {
const idPlato = parseInt(req.params.id);
const {nuevaCantidad} = req.body;

/*1. Buscamos si el plato esta en la reserva */
const item_En_Reserva = reserva_Actual.find(item => item.id === idPlato);
if(!item_En_Reserva){
return res.status(404).json({mensaje: "El plato no está en tu reserva"});
} 

/*2. Buscamos el plato en el menú para saber su precio*/
const platoMenu =  menuRestaurante.find(p => p.id == idPlato);

/*3.  Calculamos cuánto costaría 
el carrito si hacemos este cambio*/
let nuevoTotal = 0;
for(let i = 0; i < reserva_Actual.length; i++){
let item = reserva_Actual[i];
let plato = menuRestaurante.find(p => p.id === item.id);

/*si es el plato que estamos modificando, usamos la nueva cantidad*/
let cantidad = (item.id === idPlato) ? nuevaCantidad : item.cantidad;
nuevoTotal += (plato.precio * cantidad);

}
/*4. validamos si el usuario tiene dinero suficiente (no anda de pobre)*/
if(nuevoTotal > saldoUsuario){
return res.status(400).json({mensaje: "Saldo insuficiente para esta cantidad"});
}

/*5. Validamos que no puda más de lo que hay en stock*/
if(nuevaCantidad > platoMenu.stock + item_En_Reserva.cantidad){
return res.status(400).json({mensaje : "Stock insuficiente"});
}

/*6. si todo esta nitido, actualizamos el stock y la reserva*/
platoMenu.stock = platoMenu.stock + item_En_Reserva.cantidad - nuevaCantidad;
item_En_Reserva.cantidad = nuevaCantidad;

//si la cantidad llega a 0, lo quitamos del carrito
if(item_En_Reserva.cantidad === 0){
reserva_Actual = reserva_Actual.filter(item => item.id !== idPlato);
}

res.status(200).json({mensaje: "Cantidad actualizada", reserva: reserva_Actual});

});

/*5- Endpoint 5:  Eliminar un plato del carrito y devolver el stock*/
app.delete('/api/reserva/eliminar/:id', (req, res) => {
   const idPlato = parseInt(req.params.id);
   
   /*1. Buscamos el plato en el carrito*/
   const itemEnReserva = reserva_Actual.find(item => item.id === idPlato);

   if(!itemEnReserva){
return res.status(404).json({mensaje: "El plato no está en tu reserva"});
   }
   
   /*2. Buscamos el plato en el menú para devolverle el stock*/
   const platoMenu = menuRestaurante.find(p => p.id === idPlato);

   /*3. Devolvemos las unidades al inventario general*/
   platoMenu.stock += itemEnReserva.cantidad;

   /*4. Filtramos el carrito para eliminar ese plato por completo*/
   reserva_Actual = reserva_Actual.filter(item => item.id !== idPlato);

   res.status(200).json({mensaje: "Plato eliminado", reserva: reserva_Actual});

});

//se prende el servidor
 const PORT = 3000;
//el servidor se queda escuchando en el puerto 3000
 app.listen(PORT, () => {console.log(`Servidor corriendo en el puerto ${PORT}`)});
