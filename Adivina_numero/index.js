const express = require('express');
const app = require('express');
const port = 4000;

// Genera un entero aleatorio entre 1 y 100
const generarNumero = () => Math.floor(Math.random() * 100) + 1;

// Número oculto (let porque cambia en cada reinicio)
let numeroSecreto = generarNumero();

//endpoint 
app.post('/guess', (req, res) => {
    const {intentos} = req.body; //ingresa a req.body y busca el apartado de intentos yu lo guarda en una variable con el mismo nombre
    
    //Validacion de el numero ingresado, si no cumple dara un 'bad requesto (400)' al igual que el mensaje
    if(!Number.isInteger(intentos) || intentos <1 || intentos >100) {
        return res.status(400).json({mensaje: "ingresar un numero entre 1 y 100"})
    }

    if(intento < numeroSecreto){
        //validamos que si el numero que ingresa el usuario es menor al numero a adivinar, entonces devuelve el 200 y el mensaje
        return res.status(200).json({resultado: "mayor", mensaje: "el numero oculto es mayor al numero ingresado"})
    }

    
});


