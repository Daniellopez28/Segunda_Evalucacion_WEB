
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Input, Label } from 'reactstrap';
import BandejaReserva from './BandejaReserva.jsx';
import '../MenuCatalog.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const duracionReserva = 1 * 60;

async function leerRespuesta(respuesta) {
    const datos = await respuesta.json();

    // Un error tambien trae un mensaje que debemos mostrar.
    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo completar la solicitud');
    }

    return datos;
}



function MenuCatalog({ usuarioActual, onVolverLogin }) {
    const [menu, setMenu] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [reserva, setReserva] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [enviandoId, setEnviandoId] = useState(null);
    const [confirmandoReserva, setConfirmandoReserva] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [mensajeVisible, setMensajeVisible] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);
    const [tiempoRestante, setTiempoRestante] = useState(duracionReserva);
    const [limpiandoReserva, setLimpiandoReserva] = useState(false);
    const [limpiezaFallida, setLimpiezaFallida] = useState(false);
    const [reservaExpirada, setReservaExpirada] = useState(false);
    const expiracionReservaRef = useRef(null);
    const limpiezaEnProcesoRef = useRef(false);
    const reservaExpiradaRef = useRef(false);

    useEffect(() => {
        if (!error) return undefined;

        const temporizadorDesvanecer = setTimeout(() => {
            setErrorVisible(false);
        }, 2000);

        const temporizadorLimpiar = setTimeout(() => {
            setError('');
        }, 2300);

        return () => {
            clearTimeout(temporizadorDesvanecer);
            clearTimeout(temporizadorLimpiar);
        };
    }, [error]);

    useEffect(() => {
        if (!mensaje) return undefined;

        const temporizadorDesvanecer = setTimeout(() => {
            setMensajeVisible(false);
        }, 2000);

        const temporizadorLimpiar = setTimeout(() => {
            setMensaje('');
        }, 2200);

        return () => {
            clearTimeout(temporizadorDesvanecer);
            clearTimeout(temporizadorLimpiar);
        };
    }, [mensaje]);

    // Evita consultar la reserva si no hay un usuario identificado.
    const idUsuario = usuarioActual?.id;

    // Encabezados para identificar al usuario en el backend.
    const encabezadosUsuario = useMemo(() => ({
        'x-usuario-id': String(idUsuario)
    }), [idUsuario]);

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
                    setErrorVisible(true);
                    setError(error instanceof TypeError
                        ? 'No se pudo conectar con el servidor. Verifica que Express este encendido.'
                        : error.message);
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
    }, [encabezadosUsuario, idUsuario]);

    async function agregarReserva(plato) {
        if (reserva?.confirmada || confirmandoReserva) return;

        const cantidad = Number(cantidades[plato.id] ?? 1);

        setError('');
        setErrorVisible(false);
        setMensaje('');
        setMensajeVisible(false);

        // Validamos que la cantidad sea un entero positivo.
        if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
            setErrorVisible(true);
            setError('La cantidad debe ser un entero positivo');
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
        if (reserva?.confirmada || confirmandoReserva) return false;

        if (!idUsuario) {
            setError('Debes iniciar sesión para modificar tu reserva.');
            return false;
        }

        setError('');
        setErrorVisible(false);
        setMensaje('');
        setMensajeVisible(false);
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
            setMensajeVisible(true);
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
            setErrorVisible(true);
            setError(error instanceof TypeError
                ? 'No se pudo conectar con el servidor. Verifica que Express este encendido.'
                : error.message);
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

    async function confirmarReserva() {
        if (
            !idUsuario ||
            reserva?.confirmada ||
            !reserva?.itemsReservados?.length ||
            enviandoId !== null ||
            limpiandoReserva ||
            tiempoRestante === 0
        ) {
            return;
        }

        setError('');
        setErrorVisible(false);
        setConfirmandoReserva(true);

        try {
            const respuesta = await fetch(`${API}/reserva/confirmar`, {
                method: 'POST',
                headers: encabezadosUsuario
            });
            const datos = await leerRespuesta(respuesta);

            setReserva(actual => actual
                ? { ...actual, confirmada: datos.confirmada }
                : actual);
        } catch (error) {
            setErrorVisible(true);
            setError(error instanceof TypeError
                ? 'No se pudo conectar con el servidor. Verifica que Express este encendido.'
                : error.message);
        } finally {
            setConfirmandoReserva(false);
        }
    }

    const vaciarReservaPorTiempo = useCallback(async (reintentar = false) => {
        if (
            !idUsuario ||
            confirmandoReserva ||
            (limpiezaEnProcesoRef.current && !reintentar)
        ) return;

        limpiezaEnProcesoRef.current = true;
        setLimpiandoReserva(true);
        setLimpiezaFallida(false);
        setError('');
        setErrorVisible(false);

        try {
            const respuesta = await fetch(`${API}/reserva`, {
                method: 'DELETE',
                headers: encabezadosUsuario
            });
            await leerRespuesta(respuesta);
            const [platos, cuenta] = await Promise.all([
                fetch(`${API}/menu`).then(leerRespuesta),
                fetch(`${API}/reserva`, {
                    headers: encabezadosUsuario
                }).then(leerRespuesta)
            ]);

            setMenu(platos);
            setReserva(cuenta);
            setMensaje('');
            setReservaExpirada(true);
            reservaExpiradaRef.current = true;
            limpiezaEnProcesoRef.current = false;
        } catch (error) {
            setErrorVisible(true);
            setError(error instanceof TypeError
                ? 'No se pudo conectar con el servidor. Verifica que Express este encendido.'
                : error.message);
            setLimpiezaFallida(true);
        } finally {
            setLimpiandoReserva(false);
        }
    }, [confirmandoReserva, encabezadosUsuario, idUsuario]);

    useEffect(() => {
        if (!idUsuario) return undefined;

        if (expiracionReservaRef.current === null) {
            expiracionReservaRef.current = Date.now() + duracionReserva * 1000;
        }

        const intervalo = setInterval(() => {
            const segundos = Math.max(
                0,
                Math.ceil((expiracionReservaRef.current - Date.now()) / 1000)
            );
            setTiempoRestante(segundos);

            if (
                segundos === 0 &&
                enviandoId === null &&
                !confirmandoReserva &&
                !limpiezaEnProcesoRef.current &&
                !reservaExpiradaRef.current
            ) {
                void vaciarReservaPorTiempo();
            }
        }, 1000);

        return () => clearInterval(intervalo);
    }, [confirmandoReserva, enviandoId, idUsuario, vaciarReservaPorTiempo]);

    return (
        <section aria-labelledby="titulo-menu">
            <h1 id="titulo-menu" className="h3 mb-4">
                Menú del día
            </h1>

            {reserva && (
                <Alert color="info" className="d-flex flex-wrap gap-3 justify-content-between" style={{position:'sticky', top:0, zIndex:1020}}>
                    <span>Tu saldo actual: <strong>${reserva.saldo.toFixed(2)}</strong></span>
                    <span>Total de tu reserva: <Badge color="dark">${reserva.total.toFixed(2)}</Badge></span>
                    <span role="timer" aria-live="polite">
                        Tiempo restante: {String(Math.floor(tiempoRestante / 60)).padStart(2, '0')}:
                        {String(tiempoRestante % 60).padStart(2, '0')}
                    </span>
                </Alert>
            )}

            {reserva?.confirmada && (
                <Alert color="success" role="status" className="d-flex flex-wrap gap-3 justify-content-between align-items-center" style={{position:'sticky', top:0, zIndex:1020}}>
                    <span>Reserva hecha con éxito, ¿volver al inicio?</span>
                    <Button color="success" onClick={onVolverLogin}>
                        Volver al inicio
                    </Button>
                </Alert>
            )}

            {reservaExpirada && (
                <Alert color="warning" role="alert" style={{position:'sticky', top:0, zIndex:1020}}>
                    El tiempo para reservar terminó y el carrito se vació. ¿Quieres intentarlo nuevamente?
                    <Button
                        color="warning"
                        className="ms-3"
                        onClick={onVolverLogin}
                    >
                        Volver a intentarlo
                    </Button>
                </Alert>
            )}
            {enviandoId !== null && <p role="status">Guardando cambios...</p>}
            {limpiandoReserva && <p role="status">El tiempo terminó; vaciando la reserva...</p>}
            {limpiezaFallida && (
                <Button color="warning" outline onClick={() => vaciarReservaPorTiempo(true)}>
                    Reintentar vaciar la reserva
                </Button>
            )}

            {cargando && <p role="status">Cargando menu...</p>}
           {/*  {!cargando && error && (
                <Button color="secondary" outline onClick={() => window.location.reload()}>
                    Volver a cargar
                </Button>
            )} */}
            {!cargando && !error && menu.length === 0 && <p>No hay platos disponibles hoy.</p>}

            <div className="menuReservaLayout">
                <div className="maincardContainer">
                    {menu.map(plato => (
                        <article className="cardContainer" key={plato.id} aria-label={plato.nombre}>
                            <div className="cardContainer-content" style={{alignItems:'center'}}>
                                <h2 className="cardContainer-name" style={{ textAlign: "center" }}>{plato.nombre}</h2>
                                <p className="menuCategoria">Categoria: {plato.categoria}</p>

                                <img className="menuImagen" src={plato.img} alt={plato.nombre} />
            
                                <Label className="menuDescripcion" for={`cantidad-${plato.id}`}>
                                    {plato.descripcion}
                                </Label>

                                <p
                                    className="menuStock"
                                    style={{
                                        fontSize: '14px',
                                        color: '#B43E17'
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
                                        enviandoId !== null ||
                                        confirmandoReserva ||
                                        reserva?.confirmada ||
                                        limpiandoReserva ||
                                        tiempoRestante === 0
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
                                        enviandoId !== null ||
                                        confirmandoReserva ||
                                        reserva?.confirmada ||
                                        limpiandoReserva ||
                                        tiempoRestante === 0
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
                <div className="reservaSidebar">
                    <BandejaReserva
                        reserva={reserva}
                        menu={menu}
                        error={error}
                        mensaje={mensaje}
                        mensajeVisible={mensajeVisible}
                        errorVisible={errorVisible}
                        cargando={cargando}
                        ocupado={
                            enviandoId !== null ||
                            confirmandoReserva ||
                            reserva?.confirmada ||
                            limpiandoReserva ||
                            tiempoRestante === 0
                        }
                        onActualizar={actualizarPorciones}
                        onQuitar={quitarPlato}
                        onConfirmar={confirmarReserva}
                        confirmandoReserva={confirmandoReserva}
                    />
                </div>
            </div>
        </section>
    );
}

export default MenuCatalog;
