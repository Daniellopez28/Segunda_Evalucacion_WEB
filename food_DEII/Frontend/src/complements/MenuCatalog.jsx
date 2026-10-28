import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Input } from 'reactstrap';
import BandejaReserva from './BandejaReserva.jsx';
import '../MenuCatalog.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function leerRespuesta(respuesta) {
    const datos = await respuesta.json();
    // Un 400 tambien trae un mensaje que debemos mostrar.
    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo completar la solicitud');
    }
    return datos;
}



function MenuCatalog() {
    const [menu, setMenu] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [reserva, setReserva] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [enviandoId, setEnviandoId] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [mensajeVisible, setMensajeVisible] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);

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

    useEffect(() => {
        const controller = new AbortController();

        async function cargarMenu() {
            try {
                const [platos, cuenta] = await Promise.all([
                    fetch(`${API}/menu`, { signal: controller.signal }).then(leerRespuesta),
                    fetch(`${API}/reserva`, { signal: controller.signal }).then(leerRespuesta),
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
                if (!controller.signal.aborted) setCargando(false);
            }
        }

        cargarMenu();
        return () => controller.abort();
    }, []);

    async function agregarReserva(plato) {
        const cantidad = Number(cantidades[plato.id] ?? 1);
        setError('');
        setErrorVisible(false);
        setMensaje('');
        setMensajeVisible(false);

        // Enviamos una cantidad numerica para evitar concatenaciones.
        if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
            setErrorVisible(true);
            setError('La cantidad debe ser un entero positivo');
            return;
        }

        const guardado = await enviarCambio(plato.id, '/reserva/agregar', 'POST', {
            alimentoId: plato.id, cantidad,
        });
        if (guardado) {
            setCantidades(anteriores => ({ ...anteriores, [plato.id]: 1 }));
        }
    }

    async function enviarCambio(id, ruta, metodo, body) {
        setError('');
        setErrorVisible(false);
        setMensaje('');
        setMensajeVisible(false);
        setEnviandoId(id);
        try {
            const respuesta = await fetch(`${API}${ruta}`, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: body === undefined ? undefined : JSON.stringify(body),
            });
            const datos = await leerRespuesta(respuesta);
            setMensajeVisible(true);
            setMensaje(datos.mensaje);

            // Consultamos de nuevo para mostrar las cuentas reales del servidor.
            const [platos, cuenta] = await Promise.all([
                fetch(`${API}/menu`).then(leerRespuesta),
                fetch(`${API}/reserva`).then(leerRespuesta),
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
        // El backend existente recibe la cantidad final con este nombre.
        return enviarCambio(id, `/reserva/actualizar-porciones/${id}`, 'PUT', { nuevaCantidad });
    }

    function quitarPlato(id) {
        return enviarCambio(id, `/reserva/eliminar/${id}`, 'DELETE');
    }

    return (
        <section aria-labelledby="titulo-menu">
            <h1 id="titulo-menu" className="h3 mb-4">Menu del dia</h1>

            {reserva && (
                <Alert color="info" className="d-flex flex-wrap gap-3 justify-content-between" style={{position:'sticky', top:0, zIndex:1020}}>
                    <span>Tu saldo actual: <strong>${reserva.saldo.toFixed(2)}</strong></span>
                    <span>Total de tu reserva: <Badge color="dark">${reserva.total.toFixed(2)}</Badge></span>
                </Alert>
            )}
            {enviandoId !== null && <p role="status">Guardando cambios...</p>}
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
                                <p className="mb-2" style={{ fontSize: "14px", color:'#c13310'}}>Categoria: {plato.categoria}</p>

                                <img style={{width: '90%', height:'180px'}} src={plato.img} />
                                <p className='card-text-description' for={`cantidad-${plato.id}`} style={{fontSize:'14px'}}>{plato.descripcion}</p>

                                <p className="mt-3" style={{fontSize: "14px", color:'#c13310'}}>
                                    Stock disponible: <strong>{plato.stock}</strong>
                                </p>

                                <p className="cardContainer-price" style={{ textAlign: "left" }}>Precio: ${plato.precio.toFixed(2)}</p>

                                <Input
                                    id={`cantidad-${plato.id}`}
                                    type="number"
                                    className="inputCantidad"
                                    min="1"
                                    step="1"
                                    value={cantidades[plato.id] ?? 1}
                                    disabled={plato.stock === 0 || enviandoId !== null}
                                    onChange={event => setCantidades(anteriores => ({
                                        ...anteriores, [plato.id]: event.target.value,
                                    }))}
                                />
                                <Button
                                    className={`mt-3 w-100 botonReserva ${plato.stock === 0 ? 'agotado' : ''}`}
                                    disabled={plato.stock === 0 || enviandoId !== null}
                                    onClick={() => agregarReserva(plato)}
                                >
                                    {plato.stock === 0 ? 'Agotado'
                                        : enviandoId === plato.id ? 'Guardando...' : 'Anadir a la Reserva'}
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
                        ocupado={enviandoId !== null}
                        onActualizar={actualizarPorciones}
                        onQuitar={quitarPlato}
                    />
                </div>
            </div>
        </section>
    );
}

export default MenuCatalog;