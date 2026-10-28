
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Input, Label } from 'reactstrap';
import BandejaReserva from './BandejaReserva.jsx';
import '../MenuCatalog.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function leerRespuesta(respuesta) {
    const datos = await respuesta.json();

    // Un error tambien trae un mensaje que debemos mostrar.
    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo completar la solicitud');
    }

    return datos;
}

// Recibe los datos del usuario que inició sesión.
function MenuCatalog({ usuarioActual }) {
    const [menu, setMenu] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [reserva, setReserva] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [enviandoId, setEnviandoId] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Evita consultar la reserva si no hay un usuario identificado.
    const idUsuario = usuarioActual?.id;

    // Encabezados para identificar al usuario en el backend.
    const encabezadosUsuario = {
        'x-usuario-id': String(idUsuario)
    };

    useEffect(() => {
        const controller = new AbortController();

        async function cargarMenu() {
            setCargando(true);
            setError('');
            setMensaje('');
            setReserva(null);

            if (!idUsuario) {
                setError('Debes iniciar sesión para consultar tu reserva.');
                setCargando(false);
                return;
            }

            try {
                const [platos, cuenta] = await Promise.all([
                    fetch(`${API}/menu`, {
                        signal: controller.signal
                    }).then(leerRespuesta),

                    // Consultamos la reserva del usuario actual.
                    fetch(`${API}/reserva`, {
                        signal: controller.signal,
                        headers: encabezadosUsuario
                    }).then(leerRespuesta)
                ]);

                setMenu(platos);
                setReserva(cuenta);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(
                        error instanceof TypeError
                            ? 'No se pudo conectar con el servidor. Verifica que Express esté encendido.'
                            : error.message
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarMenu();

        return () => controller.abort();

        // Volvemos a consultar si cambia el usuario.
    }, [idUsuario]);

    async function agregarReserva(plato) {
        const cantidad = Number(cantidades[plato.id] ?? 1);

        setError('');
        setMensaje('');

        // Validamos que la cantidad sea un entero positivo.
        if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
            setError('La cantidad debe ser un entero positivo.');
            return;
        }

        const guardado = await enviarCambio(
            plato.id,
            '/reserva/agregar',
            'POST',
            {
                alimentoId: plato.id,
                cantidad
            }
        );

        if (guardado) {
            setCantidades(anteriores => ({
                ...anteriores,
                [plato.id]: 1
            }));
        }
    }

    async function enviarCambio(id, ruta, metodo, body) {
        if (!idUsuario) {
            setError('Debes iniciar sesión para modificar tu reserva.');
            return false;
        }

        setError('');
        setMensaje('');
        setEnviandoId(id);

        try {
            const respuesta = await fetch(`${API}${ruta}`, {
                method: metodo,

                // Enviamos el ID en las solicitudes POST, PUT y DELETE.
                headers: {
                    'Content-Type': 'application/json',
                    ...encabezadosUsuario
                },

                body: body === undefined
                    ? undefined
                    : JSON.stringify(body)
            });

            const datos = await leerRespuesta(respuesta);

            setMensaje(datos.mensaje);

            // Actualizamos el menú y la reserva con los datos del servidor.
            const [platos, cuenta] = await Promise.all([
                fetch(`${API}/menu`).then(leerRespuesta),

                // El ID también se envía al consultar la reserva actualizada.
                fetch(`${API}/reserva`, {
                    headers: encabezadosUsuario
                }).then(leerRespuesta)
            ]);

            setMenu(platos);
            setReserva(cuenta);

            return true;
        } catch (error) {
            setError(
                error instanceof TypeError
                    ? 'No se pudo conectar con el servidor. Verifica que Express esté encendido.'
                    : error.message
            );

            return false;
        } finally {
            setEnviandoId(null);
        }
    }

    function actualizarPorciones(id, nuevaCantidad) {
        // El backend recibe la cantidad final con el nombre nuevaCantidad.
        return enviarCambio(
            id,
            `/reserva/actualizar-porciones/${id}`,
            'PUT',
            { nuevaCantidad }
        );
    }

    function quitarPlato(id) {
        return enviarCambio(
            id,
            `/reserva/eliminar/${id}`,
            'DELETE'
        );
    }

    return (
        <section aria-labelledby="titulo-menu">
            <h1 id="titulo-menu" className="h3 mb-4">
                Menú del día
            </h1>

            {reserva && (
                <Alert
                    color="info"
                    className="d-flex flex-wrap gap-3 justify-content-between"
                >
                    <span>
                        Tu saldo actual:{' '}
                        <strong>
                            ${Number(reserva.saldo).toFixed(2)}
                        </strong>
                    </span>

                    <span>
                        Total de tu reserva:{' '}
                        <Badge color="dark">
                            ${Number(reserva.total).toFixed(2)}
                        </Badge>
                    </span>
                </Alert>
            )}

            {error && (
                <Alert color="warning" role="alert">
                    {error}
                </Alert>
            )}

            {mensaje && (
                <Alert color="success" role="status">
                    {mensaje}
                </Alert>
            )}

            {enviandoId !== null && (
                <p role="status">Guardando cambios...</p>
            )}

            {cargando && (
                <p role="status">Cargando menú...</p>
            )}

            {!cargando && error && (
                <Button
                    color="secondary"
                    outline
                    onClick={() => window.location.reload()}
                >
                    Volver a cargar
                </Button>
            )}

            {!cargando && !error && menu.length === 0 && (
                <p>No hay platos disponibles hoy.</p>
            )}

            <div className="menuReservaLayout">
                <div className="maincardContainer">
                    {menu.map(plato => (
                        <article
                            className="cardContainer"
                            key={plato.id}
                            aria-label={plato.nombre}
                        >
                            <div className="cardContainer-content">
                                <h2
                                    className="cardContainer-name"
                                    style={{ textAlign: 'center' }}
                                >
                                    {plato.nombre}
                                </h2>

                                <p
                                    className="mb-2"
                                    style={{
                                        fontSize: '14px',
                                        color: '#BF416F'
                                    }}
                                >
                                    Categoría: {plato.categoria}
                                </p>

                                <img
                                    src={plato.img}
                                    alt={plato.nombre}
                                />

                                <Label
                                    for={`cantidad-${plato.id}`}
                                    style={{ fontSize: '14px' }}
                                >
                                    {plato.descripcion}
                                </Label>

                                <p
                                    className="my-2"
                                    style={{
                                        fontSize: '14px',
                                        color: '#BF416F'
                                    }}
                                >
                                    Stock disponible:{' '}
                                    <strong>{plato.stock}</strong>
                                </p>

                                <p
                                    className="cardContainer-price"
                                    style={{ textAlign: 'left' }}
                                >
                                    Precio: ${Number(plato.precio).toFixed(2)}
                                </p>

                                <Input
                                    id={`cantidad-${plato.id}`}
                                    type="number"
                                    className="inputCantidad"
                                    min="1"
                                    step="1"
                                    value={cantidades[plato.id] ?? 1}
                                    disabled={
                                        plato.stock === 0 ||
                                        enviandoId !== null
                                    }
                                    onChange={event =>
                                        setCantidades(anteriores => ({
                                            ...anteriores,
                                            [plato.id]: event.target.value
                                        }))
                                    }
                                />

                                <Button
                                    className={`mt-3 w-100 botonReserva ${
                                        plato.stock === 0 ? 'agotado' : ''
                                    }`}
                                    disabled={
                                        plato.stock === 0 ||
                                        enviandoId !== null
                                    }
                                    onClick={() => agregarReserva(plato)}
                                >
                                    {plato.stock === 0
                                        ? 'Agotado'
                                        : enviandoId === plato.id
                                            ? 'Guardando...'
                                            : 'Añadir a la Reserva'}
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>

                <BandejaReserva
                    reserva={reserva}
                    menu={menu}
                    cargando={cargando}
                    ocupado={enviandoId !== null}
                    onActualizar={actualizarPorciones}
                    onQuitar={quitarPlato}
                />
            </div>
        </section>
    );
}

export default MenuCatalog;
