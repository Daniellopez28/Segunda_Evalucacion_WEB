import '../src/MenuCatalog.css';

function MenuCatalog() {
    return (
        <div>
            <div className="maincardContainer">
                {/* Aquí se pueden agregar más tarjetas de productos según sea necesario */}
                <div className="cardContainer">
                    <div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Imagen de ejemplo" className="cardContainer-image" />
                        <div className="cardContainer-content">
                            <div className="cardContainer-name">Nombre del producto</div>
                            <div className="cardContainer-price">Precio: $10.00</div>
                        </div>
                    </div>
                </div>
                <div className="cardContainer">
                    <div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Imagen de ejemplo" className="cardContainer-image" />
                        <div className="cardContainer-content">
                            <div className="cardContainer-name">Nombre del producto</div>
                            <div className="cardContainer-price">Precio: $10.00</div>
                        </div>
                    </div>
                </div>

                <div className="cardContainer">
                    <div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Imagen de ejemplo" className="cardContainer-image" />
                        <div className="cardContainer-content">
                            <div className="cardContainer-name">Nombre del producto</div>
                            <div className="cardContainer-price">Precio: $10.00</div>
                        </div>
                    </div>
                </div>

                <div className="cardContainer">
                    <div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Imagen de ejemplo" className="cardContainer-image" />
                        <div className="cardContainer-content">
                            <div className="cardContainer-name">Nombre del producto</div>
                            <div className="cardContainer-price">Precio: $10.00</div>
                        </div>
                    </div>
                </div>

                {/* Esta tarjeta pasa a la siguiente fila si ya no hay espacio */}
                <div className="cardContainer">
                    <div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Imagen de ejemplo" className="cardContainer-image" />
                        <div className="cardContainer-content">
                            <div className="cardContainer-name">Nombre del producto</div>
                            <div className="cardContainer-price">Precio: $10.00</div>
                        </div>
                    </div>
                </div>
                

            </div>
        </div>
    );
}

export default MenuCatalog;