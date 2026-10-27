const express = require('express');
const app = require('express');
const port = 4000;

// Genera un entero aleatorio entre 1 y 100
const generarNumero = () => Math.floor(Math.random() * 100) + 1;

// Número oculto (let porque cambia en cada reinicio)
let numeroSecreto = generarNumero();

