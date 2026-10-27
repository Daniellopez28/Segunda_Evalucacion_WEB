//importamos funcion de 
import { useState } from 'react';
//importamos componentes visuales
import { Container, Form, Input, Button, Alert, ListGroup, ListGroupItem, Badge } from 'reactstrap';

//creamos una constante api que almacenara la URL
const API = 'http://localhost:4000'; 

//creamos un componente de react, la mayuscula en "juego", indica que es una interfaz de usuario que devolvera
//codigo de manera dinamica
function Juego(){
    //Guarda lo que escribe el usuario, inicia como un "texto vacio"
    const [numero, setNumero] = useState('');
    
    //guarda y recuerda la lista de todos los intentos 
    const [historial, setHistorial] =  useState([]);

    //mensaje de el servidor para los casos que se van dando 
    const [mensaje, setMensaje] = useState('');

};