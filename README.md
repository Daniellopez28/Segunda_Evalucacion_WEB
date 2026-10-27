# Segunda_Evalucacion_WEB

Food DEI: catalogo de platos conectado al backend de Express.

## Ejecutar en dos terminales

En la raiz del repositorio, iniciar el backend:

```sh
npm ci
node index.js
```

En otra terminal, iniciar el frontend:

```sh
cd frontend
npm ci
npm run dev
```

Abrir la direccion que muestra Vite, normalmente http://localhost:5173.
El backend escucha en http://localhost:3000.

El catalogo consulta GET /api/menu y GET /api/reserva al abrir la pantalla.
Al agregar comida envia POST /api/reserva/agregar y vuelve a consultar
el stock, saldo y total. Los rechazos del servidor se muestran como alertas.
La bandeja lista la reserva real y permite subir o bajar porciones con PUT
/api/reserva/actualizar-porciones/:id, enviando { nuevaCantidad: numero }.
Quitar usa DELETE /api/reserva/eliminar/:id. Al bajar o quitar platos,
el backend devuelve stock y dinero. Para eliminar la ultima porcion se usa Quitar.
Los botones esperan la respuesta del servidor antes de permitir otro cambio.
Los datos se guardan en memoria: reiniciar Express restaura los $25 y el stock.

Para usar otro backend, definir VITE_API_URL en un archivo frontend/.env,
por ejemplo VITE_API_URL=http://localhost:3000/api, y reiniciar Vite.

## Comprobar el frontend

Desde frontend, ejecutar npm run build para compilar y npm run lint para
revisar el codigo. La carpeta dist contiene el resultado de la compilacion.

