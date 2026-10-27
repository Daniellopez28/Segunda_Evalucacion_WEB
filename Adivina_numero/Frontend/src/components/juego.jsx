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

    //deterina si gano o no como un interruptor
    const [gano, setGano] = setState(false);

    //guarda los errores de validaciones o red que se vayan dando
    const [error, setError] = setState('');
};

//recorre el historial filtrandolo con la condicion, de que != de correcto, y se cuentan con el length
const fallidos = historial.filter(h => h.resultado != 'correcto').length;

//con el async indicamos a JS que es una funcion de asincronia, donde "e" recibe el submit de el formulario
const enviarIntento = async (e) => {
   e.preventDefault(); //este se encarga de retener la recarga de la pagina sola, para que react no pierda su estado
   setError(''); //limpia los mensajes de error anteriores antes de un nuevo intento
   
   
};