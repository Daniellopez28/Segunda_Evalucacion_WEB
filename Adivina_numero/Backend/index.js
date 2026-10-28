const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// Genera un entero aleatorio entre 1 y 100
const generarNumero = () => Math.floor(Math.random() * 100) + 1;

// Número oculto (let porque cambia en cada reinicio)
let numeroSecreto = generarNumero();

//endpoint 
app.post('/guess', (req, res) => {
    const {intento} = req.body; //ingresa a req.body y busca el apartado de intento yu lo guarda en una variable con el mismo nombre
    
    //Validacion de el numero ingresado, si no cumple dara un 'bad requesto (400)' al igual que el mensaje
    if(!Number.isInteger(intento) || intento <1 || intento >100) {
        return res.status(400).json({mensaje: "ingresar un numero entre 1 y 100"});
    }

    if(intento < numeroSecreto){
        //validamos que si el numero que ingresa el usuario es menor al numero a adivinar, entonces devuelve el 200 y el mensaje
        return res.status(200).json({resultado: "mayor", mensaje: "el numero a adivinar es mayor al numero ingresado"});
    }

    if(intento > numeroSecreto){
        //validamos que si el numero ingresado es mayor al oculto devuelva el 200 y el mensaje
        return res.status(200).json({resultado: "menor", mensaje: "El numero a adivinar es menor al numero ingresado"});
    }

     //si el resultado no es menor ni mayor es correcto por ello se devuelve lo siguiente
    res.status(200).json({resultado: "correcto", mensaje: "Felicidades, adivinaste el numero oculto!"});
});

//creamos el segundo endpoint para el caso en el que quierea vovler a jugar
app.post('/reset', (req, res) => {
    numeroSecreto = generarNumero();
    res.status(200).json({mensaje: "Juego reiniciado, buena suerte!"});
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});