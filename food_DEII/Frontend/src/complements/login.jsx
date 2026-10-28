
import { useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Login({ onLogin }) {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function iniciarSesion(event) {
        event.preventDefault();
        setError('');
        setCargando(true);

        try {
            const respuesta = await fetch(`${API}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, password })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.mensaje || 'No se pudo iniciar sesión');
            }

            onLogin(datos.usuario);
        } catch (error) {
            setError(
                error instanceof TypeError
                    ? 'No se pudo conectar con el servidor. Verifica que Express esté encendido.'
                    : error.message
            );
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div
                className="bg-white rounded shadow p-4"
                style={{ width: '100%', maxWidth: '420px' }}
            >
                <h1 className="h3 text-center mb-4" style={{ color: '#294C29' }}>
                    Iniciar sesión
                </h1>

                <p className="text-center mb-4">
                    Ingresa a tu cuenta de Food DEI
                </p>

                <Form onSubmit={iniciarSesion}>
                    <FormGroup>
                        <Label for="usuario">Usuario</Label>
                        <Input
                            id="usuario"
                            type="text"
                            value={usuario}
                            onChange={event => setUsuario(event.target.value)}
                            placeholder="Ingresa tu usuario"
                            autoComplete="username"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            placeholder="Ingresa tu contraseña"
                            autoComplete="current-password"
                            required
                        />
                    </FormGroup>

                    {error && (
                        <Alert color="danger" role="alert">
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        className="w-100 border-0"
                        style={{ backgroundColor: '#9F280A' }}
                        disabled={cargando}
                    >
                        {cargando ? 'Ingresando...' : 'Iniciar sesión'}
                    </Button>
                </Form>

                <p className="small text-muted text-center mt-3 mb-0">
                    Food DEI S.A. de R.L.
                </p>
            </div>
        </div>
    );
}

export default Login;
