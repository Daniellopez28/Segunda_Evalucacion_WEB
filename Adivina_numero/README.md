#Ejercicio 1

Se solicita la creacion de un videojuego el cual sea una adivinanza de un numero aleatorio en el reango de 
1-100.

*Pasos a seguir para ejecutarlo"

*Desde la terminal en la carpeta de backend:*
node index.js

*Desde la terminanl en el frontend:*
npm install
npm install reactstrap boostrap 
npm run dev

Tomar el siguiente url para la ejecucion de la pagina:
"http://localhost:5173"

Aspectos a cumplir en el Ejercicio 1:
En el Backend (Express):
    - Crea una variable en el servidor que genere un número aleatorio entre 1 y 100 al iniciar.
    - Crea una ruta POST /guess, que reciba un número del cliente y responda si el número
    oculto es "mayor", "menor" o "correcto".
    - Crea una ruta POST /reset para generar un nuevo número.

En el Frontend (React):
    - Usa un formulario con un input numérico y un botón para enviar el intento.
    - Controla el estado del juego (useState): guarda los intentos fallidos, el mensaje del
    servidor y si el usuario ya ganó.
    - Muestra una lista dinámica con el historial de todos los números que el usuario ya ha
    intentado en la sesión actual

Para organización y buena división de los aspectos de el proyecto, dividimos en dos carpetas, con su nombre respectivo:
Adivina_numero
food_DEII
<img width="262" height="76" alt="imagen" src="https://github.com/user-attachments/assets/a90b8353-ef83-46ef-9f03-efffcfbcc510" />

Apartado de backend:
La estructura que seguimos para poder trabajar el backend es con los siguientes archivos:
<img width="225" height="112" alt="imagen" src="https://github.com/user-attachments/assets/9158c0d5-f92f-45ab-9373-0b6737906c6f" />

index.js:
Hacemos la implementacion de e express y corss, al igual que planteamos la constante a utilizar para usar express:
<img width="377" height="160" alt="imagen" src="https://github.com/user-attachments/assets/d3fc0abc-77c1-4c7e-b2fa-2f6906ef68b4" />

plantemaos una constante para generar el numero a adivinar, para eso usamos el objeto global de math, para poder generar el numero, 
como lo que nos estrega es un numero "decimal" lo multiplicamos por 100 para poder hacer que sea un entero y agregamos el +1, porque 
nos entrega un numero de el 0-99 pero como queremos de el 0-100 el +1 hace que el 0 se vuelva 1 y el 99 se haga 100. Luego planteamos 
numero como numeroSecreto.
<img width="662" height="120" alt="imagen" src="https://github.com/user-attachments/assets/1dea1098-58cb-448e-bf00-fdfcfc7d0f1b" />

Comenzamos con los endpoints de el index, primero registramos el intento, donde si es diferente a u numero en general nos devolvera un
bad request (400), prosigue con tres validaciones, si el numero qeu ingresa es menor al numero que se genera devolvera un (200) diciendo que 
el numero oculto es mayor al ingresado, la segunda validacion cumple el caso de si el numero ingresado se pasa de el oculto y cierra validando
con el numero que sea correcto.
<img width="1332" height="537" alt="imagen" src="https://github.com/user-attachments/assets/9b43b0f4-437f-43d6-afb2-10d208d96b81" />

El segundo endpoint plantea el reset para que el usuario decida si quiere volver a jugar, vuelve a generar un numero secreto y le da el mensaje 
(200). Cierra con la inicializacion de el puerto de el servidor de express el cual corre en el puerto 4000.
<img width="785" height="232" alt="imagen" src="https://github.com/user-attachments/assets/952a7807-2775-4188-bf12-6ec8b91dd686" />

