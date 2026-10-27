
//  Se importa useState para manejar los estados (saldo, total, errores)
import { useState } from 'react';

// 2. Importamos los componentes de Reactstrap que exige el PDF
import { Alert, Badge, Container, Row, Col } from 'reactstrap'; 

// 3. Importamos los estilos básicos
import './App.css';

function App() {
  
  // Guarda el dinero disponible del usuario
  const [saldo, setSaldo] = useState(25.00);
  
  // Guarda la suma de los platos que el usuario lleva en el carrito
  const [totalReserva, setTotalReserva] = useState(0.00);
  
  // Guarda el mensaje de error que devuelve el backend
  const [mensajeError, setMensajeError] = useState('');

  // Función temporal para probar que la alerta funcione (luego se borra)
  const probarAlerta = () => {
    setMensajeError("Saldo insuficiente para esta cantidad");
    
    // Después de 3 segundos, borramos el mensaje para que la alerta desaparezca
    setTimeout(() => setMensajeError(''), 3000);
  };

  return (
    // Container fluid: Ocupa todo el ancho de la pantalla
    <Container fluid className="p-0">
      
      {/* Usamos <Alert color="info"> y <Badge color="dark" pill> para mostrar el saldo y el total de la reserva */}
      <Alert color="info" className="d-flex justify-content-between align-items-center m-3 shadow-sm">
        {/* Muestra el saldo con dos decimales (ej. $25.00) */}
        <h4 className="mb-0">Tu saldo actual: ${saldo.toFixed(2)}</h4>
        
        {/* Muestra el total de la reserva en una píldora oscura */}
        <Badge color="dark" pill className="fs-6 p-2">
          Total de tu Reserva: ${totalReserva.toFixed(2)}
        </Badge>
      </Alert>

      {/*Usamos <Alert color="warning"> para que el usuario vea el error. */}
      {mensajeError && (
        <Alert color="warning" className="mx-3 shadow-sm">
          <strong>¡Atención!</strong> {mensajeError}
        </Alert>
      )}

      {/* Botón temporal para probar la alerta (luego se borra) */}
      <div className="text-center mb-4">
        <button onClick={probarAlerta} className="btn btn-outline-warning btn-sm">
          (Prueba) Simular error de backend
        </button>
      </div>

      {/* Dejamos los espacios listos para cuando unan el código.*/}
      <Row className="m-3">
        {/* Columna izquierda: Aquí irá el menú de Gael */}
        <Col md="8" className="border p-4 bg-light text-center rounded mb-3 mb-md-0">
          <h5 className="text-muted">[ Aquí va el componente MenuCatalogo ]</h5>
        </Col>
        
        {/* Columna derecha: Aquí irá la bandeja de reserva (Carrito) */}
        <Col md="4" className="border p-4 bg-light text-center rounded">
          <h5 className="text-muted">[ Aquí va el componente BandejaReserva ]</h5>
        </Col>
      </Row>

    </Container>
  );
}

export default App;