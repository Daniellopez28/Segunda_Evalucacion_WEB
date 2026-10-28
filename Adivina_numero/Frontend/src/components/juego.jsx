//importamos funcion de 
import { useState } from 'react';
//importamos componentes visuales
import { Card, CardBody, Form, InputGroup, Input, Button, Alert, ListGroup, ListGroupItem, Badge } from 'reactstrap';

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
    const [gano, setGano] = useState(false);

    //guarda los errores de validaciones o red que se vayan dando
    const [error, setError] = useState('');

    //recorre el historial filtrandolo con la condicion, de que !== de correcto, y se cuentan con el length
    const fallidos = historial.filter(h => h.resultado !== 'correcto').length;

    //con el async indicamos a JS que es una funcion de asincronia, donde "e" recibe el submit de el formulario
    const enviarIntento = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const respuesta = await fetch(`${API}/guess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intento: Number(numero) })
            });

            //espera la respuesta de el servidor y transfomra esa respuesta de json a objeto de js
            const datos = await respuesta.json();

            //revisa si el servidor respondio con algun codigo de error (tipo 400 o 500)
            if(!respuesta.ok){
                setError(datos.mensaje); //muestra el error en pantalla
                return;
            }

            //guarda el resultado de el servidor en el estado mensaje para que lo vea el usuario
            setMensaje(datos.mensaje);
            //agrega un intento al final de la lista de historial, usa los "..." par amantener el historial viejo
            setHistorial([...historial, { numero: Number(numero), resultado: datos.resultado }]);

            //validasi el servidor da que el resultado fue correcto cambiando el estado de false a true en ganr
            if (datos.resultado === 'correcto') setGano(true);
            //limpia la caja de texto para que pueda escribirlo correctamente
            setNumero('');
        } catch (err) { //si el servidor esta apagado, no corre en el puerto dicho o se va el internet se da el mensaje
            setError('No se pudo conectar con el servidor');
        }
    };

    //pide al servidor un nuevo numero oculto y limpia todos los estados del juego
    const reiniciar = async () => { //lo solicita de manera asincronica
        try {
            await fetch(`${API}/reset`, { method: 'POST' });
            setHistorial([]);
            setMensaje('');
            setGano(false);
            setError('');
            setNumero('');
        } catch (err) {
            setError('No se pudo reiniciar el juego');
        }
    };

    return (
        <Card className="juego-card">
            <CardBody className="p-4 text-center"> 
                <h1 className="h3 fw-bold mb-1">Adivina el Número</h1>
                <p className="text-muted mb-4">Estoy pensando en un número del 1 al 100</p>

                {error && <Alert color="warning" className="py-2">{error}</Alert>}
                {mensaje && <Alert color={gano ? 'success' : 'info'} className="py-2">{mensaje}</Alert>}

                <Form onSubmit={enviarIntento} className="mb-4">
                    <InputGroup size="lg">
                        <Input
                            className="input-numero"
                            type="number"
                            min="1"
                            max="100"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            disabled={gano}
                            placeholder="?"
                        />
                        <Button color="primary" type="submit" disabled={gano || numero === ''}>
                            Probar
                        </Button>
                    </InputGroup>
                </Form>

                <p className="mb-3">
                    Intentos fallidos: <Badge color="danger" pill>{fallidos}</Badge>
                </p>

                <h2 className="h6 text-start text-muted">Historial</h2>
                {historial.length === 0 ? (
                    <p className="text-muted small mb-4">Todavía no has hecho ningún intento.</p>
                ) : (
                    <ListGroup className="historial mb-4">
                        {historial.map((h, i) => (
                            <ListGroupItem key={i} className="d-flex justify-content-between align-items-center">
                                <span>Intento {i + 1}: <strong>{h.numero}</strong></span>
                                <Badge color={h.resultado === 'correcto' ? 'success' : h.resultado === 'mayor' ? 'warning' : 'info'}>
                                    {h.resultado}
                                </Badge>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                )}

                <Button color={gano ? 'success' : 'secondary'} outline={!gano} className="w-100" onClick={reiniciar}>
                    {gano ? 'Jugar de nuevo' : 'Reiniciar'}
                </Button>
            </CardBody>
        </Card>
    );
}

export default Juego;