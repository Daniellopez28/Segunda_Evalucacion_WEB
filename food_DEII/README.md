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

La estructura de el ejercicio dos esta en la carpeta food_DEII, llevando la siguiente estructura:

<img width="266" height="712" alt="imagen" src="https://github.com/user-attachments/assets/4d946d64-5e3c-4e55-9368-17fe68bf5573" />

En el apartado de el backend:
Encontramos el archivo encargado de el servidor el cual es index.js:

importamos de la manera de ES_Module, para que cumpla con el formato moderno y oficial de JS, plantiamos el puerto el cual se ejecuta
en el puerto (3000)

<img width="376" height="187" alt="imagen" src="https://github.com/user-attachments/assets/9a415b3e-a57b-4435-814b-761b7fa95713" />

Ahora continuamos creando un arreglo el cual tendra de manera quemada los menus de el restaurante, cada plato cuenta con los siguientes atributos:

-id: identificador único del producto.
-nombre: nombre del plato.
-img: dirección de la imagen del producto.
-descripcion: descripción del alimento.
-precio: precio del producto.
-stock: cantidad disponible en el inventario.
-categoria: categoría a la que pertenece el plato.

En total contamos con seis productos: menú ejecutivo de pollo, pasta Alfredo, ensalada César, jugo natural, refresco de Jamaica y refresco de horchata.
Estos productos se utilizan para mostrar el catálogo en el frontend y permiten realizar operaciones de reserva, validando las cantidades disponibles y los precios.

<img width="1122" height="671" alt="imagen" src="https://github.com/user-attachments/assets/59431da0-0ff1-464c-a133-89a8403c7b5f" />

## Usuarios del sistema

Planteamos un arreglo llamado usuarios, el cual contiene los usuarios registrados que se utilizan para iniciar sesión en la aplicación.
Cada usuario contiene los siguientes datos:

-id: identificador del usuario.
-nombre: nombre que se muestra en la aplicación.
-usuario: nombre de usuario para iniciar sesión.
-password: contraseña del usuario.
-saldo: saldo disponible para realizar reservas.

Actualmente contamos con tres usuarios de prueba:

-Usuario
Contraseña
Saldo inicial
-ana, 1234, $25.00
-carlos, 1234, $30.00
-maria, 1234, $55.00

Estos usuarios están definidos directamente en el backend. El sistema verifica las credenciales al iniciar sesión y devuelve los datos públicos del usuario, sin incluir su contraseña.

<img width="851" height="165" alt="imagen" src="https://github.com/user-attachments/assets/4aec05c0-2364-4fa3-9f89-6003d5317ed6" />

Reservas individuales y confirmación
En este apartado planteamos un objeto inicialmente vacío llamado reservasPorUsuario, donde se almacenan temporalmente las reservas de cada usuario.
La clave utilizada es el identificador del usuario, lo que permite mantener separadas las reservas. De esta manera, cada persona puede agregar, actualizar o eliminar sus propios productos sin modificar directamente la lista de artículos reservados de otro usuario.
También creamos un conjunto llamado reservasConfirmadas, utilizando un Set para almacenar los identificadores de los usuarios que han confirmado su reserva. Esto permite comprobar si una reserva ya fue confirmada y evitar que se modifique posteriormente.

<img width="985" height="462" alt="imagen" src="https://github.com/user-attachments/assets/12e2bd9c-3d95-42be-aa17-1a0308eec5d4" />

Creamos la función obtenerUsuario(req), que lee el encabezado x-usuario-id de la petición HTTP y busca al usuario correspondiente dentro del arreglo usuarios.
Este mecanismo permite identificar qué usuario está realizando las operaciones sobre su reserva.

<img width="462" height="182" alt="imagen" src="https://github.com/user-attachments/assets/498214b7-3f35-4a54-9570-89c35dc935c8" />

La función obtenerReservaUsuario(idUsuario) obtiene la reserva correspondiente al usuario. Si todavía no existe una reserva para ese identificador, crea un arreglo vacío y lo devuelve.

Función rechazarSiReservaConfirmada()

<img width="747" height="246" alt="imagen" src="https://github.com/user-attachments/assets/15db29bb-bcec-4c86-8149-9be6e5f8c8ba" />

La función rechazarSiReservaConfirmada(res, idUsuario) comprueba si el usuario ya confirmó su reserva. Si está confirmada, responde con el código HTTP 409 e impide continuar con la modificación solicitada.

Función reiniciarReservaUsuario()

<img width="782" height="417" alt="imagen" src="https://github.com/user-attachments/assets/b7d8a6b8-df9b-475d-8622-2280fbe2081b" />

La función reiniciarReservaUsuario(idUsuario) permite reiniciar una reserva no confirmada. Antes de vaciarla, devuelve al inventario las porciones que estaban reservadas y elimina sus artículos.

Esta función se ejecuta durante el inicio de sesión. Si la reserva ya está confirmada, conserva su estado de confirmación y no devuelve las porciones al inventario.

## Endpoints

Los endpoints son las rutas que permiten al frontend comunicarse con el backend mediante solicitudes HTTP. Todas las rutas de la API utilizan el prefijo:
http://localhost:3000/api

1. Obtener el menú
Método: GET
Ruta: /api/menu

<img width="827" height="817" alt="imagen" src="https://github.com/user-attachments/assets/51fe04eb-32c4-4b31-a018-fc4185f22e76" />

Este endpoint devuelve el arreglo completo de productos del restaurante, incluyendo sus precios, imágenes, categorías, descripciones y stock actual.
La respuesta se devuelve con el código HTTP 200, indicando que la solicitud se realizó correctamente.

2. Iniciar sesión
Método: POST
Ruta: /api/login

<img width="890" height="542" alt="imagen" src="https://github.com/user-attachments/assets/4cfecfb9-12ee-46af-8137-c5c41b09c135" />

Este endpoint recibe el usuario y la contraseña enviados desde el formulario de inicio de sesión. Después busca una coincidencia en el arreglo de usuarios.
Si las credenciales son correctas, devuelve los datos públicos del usuario y su saldo. Si son incorrectas, devuelve el código HTTP 401 junto con un mensaje de error.

Ejemplo del cuerpo de la petición:
{
  "usuario": "ana",
  "password": "1234"
}

3. Obtener los usuarios
Método: GET
Ruta: /api/usuarios

<img width="466" height="160" alt="imagen" src="https://github.com/user-attachments/assets/0df4319d-f62e-45e9-9c65-ae731aa82ae9" />

Este endpoint devuelve la lista de usuarios registrados, excluyendo sus contraseñas mediante la desestructuración de los objetos.

4. Consultar la reserva
Método: GET
Ruta: /api/reserva

<img width="1065" height="647" alt="imagen" src="https://github.com/user-attachments/assets/61f851cc-9218-4644-b217-5116b265d5df" />

Este endpoint obtiene la reserva del usuario identificado y calcula el total de los productos reservados.

La respuesta incluye:
saldo: saldo disponible del usuario.
itemsReservados: productos incluidos en la reserva y sus cantidades.
total: importe total calculado.
confirmada: indica si la reserva ya fue confirmada.
Para identificar al usuario es necesario enviar el encabezado x-usuario-id.

5. Agregar un plato
Método: POST
Ruta: /api/reserva/agregar
Este endpoint permite agregar un producto a la reserva del usuario. Recibe el identificador del alimento y la cantidad solicitada.

<img width="1047" height="812" alt="imagen" src="https://github.com/user-attachments/assets/af0eb673-c529-4ada-be03-0e75318e383e" />

<img width="986" height="750" alt="imagen" src="https://github.com/user-attachments/assets/c7224cc7-2b57-4f8e-91ad-e23474234d2e" />

Antes de agregarlo, verifica que el producto exista, que la cantidad sea un entero positivo, que haya suficiente stock y que el total de la reserva no supere el saldo disponible.

Si el producto ya se encuentra en la reserva, incrementa su cantidad. Si no existe, lo agrega como un nuevo artículo. Finalmente, descuenta del inventario las porciones solicitadas.

Ejemplo del cuerpo de la petición:
{
  "alimentoId": 101,
  "cantidad": 2
}
6. Actualizar porciones
Método: PUT
Ruta: /api/reserva/actualizar-porciones/:id

<img width="887" height="762" alt="imagen" src="https://github.com/user-attachments/assets/09d19f37-fc53-4300-b6eb-5bc4a4343508" />

<img width="1022" height="792" alt="imagen" src="https://github.com/user-attachments/assets/59a7e52b-29c4-4193-9c3c-65d2966ac1ff" />

<img width="801" height="497" alt="imagen" src="https://github.com/user-attachments/assets/2a376ba3-636d-4b8f-8f9b-20c96c9af0ae" />

Este endpoint permite modificar la cantidad final de un producto que ya se encuentra en la reserva.
Recibe el parámetro id en la URL y la propiedad nuevaCantidad en el cuerpo de la petición.
El sistema valida que la cantidad sea un entero igual o mayor que cero, que exista el producto y que se mantengan las condiciones de saldo y stock.
Si la nueva cantidad es cero, el producto se elimina de la reserva y sus porciones se devuelven al inventario.

7. Eliminar un plato
Método: DELETE
Ruta: /api/reserva/eliminar/:id

<img width="862" height="825" alt="imagen" src="https://github.com/user-attachments/assets/168bd6f7-9421-447f-8b56-2cf02a5f9c25" />

<img width="480" height="311" alt="imagen" src="https://github.com/user-attachments/assets/4efeebf1-0889-4918-afcc-450dead014c0" />

Este endpoint elimina un producto específico de la reserva del usuario. Después de eliminarlo, devuelve al inventario las porciones que estaban reservadas.
Si el producto no se encuentra en la reserva, devuelve el código HTTP 404.

8. Confirmar la reserva
Método: POST
Ruta: /api/reserva/confirmar

<img width="855" height="607" alt="imagen" src="https://github.com/user-attachments/assets/6142e2cf-0033-47c4-80f9-7271b1d2a0a5" />

Este endpoint permite confirmar la reserva del usuario. Primero verifica que el usuario esté identificado y que la reserva contenga al menos un producto.
Cuando la confirmación se realiza correctamente, el identificador del usuario se almacena en el conjunto reservasConfirmadas. Desde ese momento, las operaciones de agregar, actualizar, eliminar o vaciar la reserva son rechazadas.
Si la reserva está vacía, devuelve el código HTTP 400.

9. Vaciar la reserva

Método: DELETE
Ruta: /api/reserva

<img width="917" height="686" alt="imagen" src="https://github.com/user-attachments/assets/5ee2705b-295a-4bf2-b9c5-b95c515490a1" />

Este endpoint elimina todos los productos de la reserva y devuelve las porciones correspondientes al inventario.
La operación solamente se permite cuando la reserva no está confirmada. Si el usuario ya confirmó su reserva, el sistema rechaza la solicitud con el código HTTP 409.
Este endpoint permite reiniciar la reserva cuando termina el tiempo disponible, para que el usuario pueda realizar otra.


