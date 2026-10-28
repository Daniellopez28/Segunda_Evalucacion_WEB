import { Badge, Button, ButtonGroup, ListGroup, ListGroupItem } from 'reactstrap';

function BandejaReserva({ reserva, menu, cargando, ocupado, onActualizar, onQuitar }) {
    const items = reserva?.itemsReservados ?? [];

    return (
        <aside className="bandejaReserva" aria-labelledby="titulo-reserva">
            <h2 id="titulo-reserva" className="h4">Tu bandeja de reserva</h2>
            {cargando && <p>Cargando reserva...</p>}
            {!cargando && !reserva && <p>No se pudo consultar la reserva.</p>}
            {reserva && (
                <>
                    {items.length === 0 && <p>Tu bandeja esta vacia. Elige un plato del menu.</p>}
                    <ListGroup className="my-3">
                        {items.map(item => {
                            const plato = menu.find(plato => plato.id === item.id);
                            const nombre = plato?.nombre ?? `Plato ${item.id}`;

                            return (
                                <ListGroupItem key={item.id} aria-label={`Reserva de ${nombre}`}>
                                    <h3 className="h6">{nombre}</h3>
                                    {plato && <p className="mb-2">Subtotal: ${(plato.precio * item.cantidad).toFixed(2)}</p>}
                                    <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                                        <ButtonGroup size="sm" aria-label={`Porciones de ${nombre}`}>
                                            <Button
                                                color="secondary" outline
                                                disabled={ocupado || item.cantidad <= 1}
                                                aria-label={`Reducir porciones de ${nombre}`}
                                                onClick={() => onActualizar(item.id, item.cantidad - 1)}
                                            >
                                                -
                                            </Button>
                                            <span className="porcionesReserva" aria-label={`Cantidad reservada de ${nombre}`}>
                                                {item.cantidad}
                                            </span>
                                            <Button
                                                color="secondary" outline
                                                disabled={ocupado}
                                                aria-label={`Aumentar porciones de ${nombre}`}
                                                onClick={() => onActualizar(item.id, item.cantidad + 1)}
                                            >
                                                +
                                            </Button>
                                        </ButtonGroup>
                                        <Button
                                            color="danger" outline size="sm"
                                            disabled={ocupado}
                                            aria-label={`Quitar ${nombre}`}
                                            onClick={() => onQuitar(item.id)}
                                        >
                                            Quitar
                                        </Button>
                                    </div>
                                </ListGroupItem>
                            );
                        })}
                    </ListGroup>
                    <p className="mb-2">Total: <Badge color="dark">${reserva.total.toFixed(2)}</Badge></p>
                    <p>Saldo disponible: <strong>${reserva.saldo.toFixed(2)}</strong></p>
                    {items.length > 0 && <p className="small text-muted mt-3">Para eliminar la ultima porcion, usa Quitar.</p>}
                </>
            )}
        </aside>
    );
}

export default BandejaReserva;