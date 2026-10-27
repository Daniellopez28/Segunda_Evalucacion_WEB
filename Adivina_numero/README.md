*Ejercicio 1*

Se solicita la creacion de un videojuego el cual sea una adivinanza de un numero aleatorio en el reango de 
1-100, se solicita que cunmpla con los siguientes aspectos:

Tomar el siguiente url para la ejecucion de la pagina:
"http://localhost:5173"

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
