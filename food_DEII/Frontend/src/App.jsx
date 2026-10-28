
import { useState } from 'react';
import { Container, Navbar, NavbarBrand, Button } from 'reactstrap';

import MenuCatalog from './complements/MenuCatalog.jsx';
import Login from './complements/login.jsx';

export default function App() {
    const [usuarioActual, setUsuarioActual] = useState(null);

    function cerrarSesion() {
        setUsuarioActual(null);
    }

    return (
        <div className="bg-light min-vh-100 p-4">
            <Navbar
                className="shadow-sm rounded mb-4 px-4"
                style={{ backgroundColor: '#264d26' }}
            >
                <NavbarBrand
                    className="fw-bold mb-0"
                    style={{ color: '#F6E4C9', fontSize: '1.5rem' }}
                >
                    Food DEI S.A. de R.L.
                </NavbarBrand>

                {usuarioActual && (
                    <div className="d-flex align-items-center gap-3">
                        <span style={{ color: '#F6E4C9' }}>
                            Hola, {usuarioActual.nombre}
                        </span>

                        <Button
                            size="sm"
                            onClick={cerrarSesion}
                            style={{
                                backgroundColor: '#9F280A',
                                borderColor: '#9F280A',
                                color: 'white'
                            }}
                        >
                            Cerrar sesión
                        </Button>
                    </div>
                )}
            </Navbar>

            <Container fluid>
                {usuarioActual ? (
                    <>
                        <div className="text-end mb-3">
                            <strong>
                                Tu saldo: ${Number(usuarioActual.saldo).toFixed(2)}
                            </strong>
                        </div>

                        {/* CAMBIO: pasamos el usuario conectado a MenuCatalog */}
                        <MenuCatalog usuarioActual={usuarioActual} />
                    </>
                ) : (
                    <Login onLogin={setUsuarioActual} />
                )}
            </Container>
        </div>
    );
}
