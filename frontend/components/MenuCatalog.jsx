import React from 'react';
import '../src/MenuCatalog.css';

function MenuCatalog() {
    return (
        <div>
            <h3 className="cardContainer-title">Menú del Día</h3>
            <div className="row">
                <div className="col-md-4 mb-3">
                    <div className="menu-item p-3 border rounded shadow-sm">
                        <h3>Menú Ejecutivo (Pollo)</h3>
                        <p className="text-success fw-bold">$5.50</p>
                        <button className="btn btn-outline-success btn-sm">Añadir a la Reserva</button>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="menu-item p-3 border rounded shadow-sm">
                        <h3>Pasta Carbonara Artesanal</h3>
                        <p className="text-success fw-bold">$6.00</p>
                        <button className="btn btn-outline-success btn-sm">Añadir a la Reserva</button>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="menu-item p-3 border rounded shadow-sm">
                        <h3>Ensalada César con Pollo</h3>
                        <p className="text-success fw-bold">$4.50</p>
                        <button className="btn btn-secondary btn-sm" disabled>Agotado</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MenuCatalog;