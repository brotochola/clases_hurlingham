DATOS A RECOLECTAR POR CADA JUGADOR:

-posiciones de mis compañeros
-posiciones de los adversarios

-pos de la pelota

-puntaje para cada compañero, es decir asignarles un puntaje segun qué tanto sentido tiene hacerles el pase
-su distancia al arco

-distancia a los jugadores contrincantes
-distancia de los contrincantes al punto mas cercano de la linea q se traza entre la pelota y el compañero

-tengo la pelota o no

-probabilidad de q si mi compañero me pasa la pelota ahora, adonde yo estoy, el pase llegue bien
-contrincantes entre la pelota y yo
-calcular mismas probabilidad de recepcion exitosa del pase, si en vez de estar ACA, estoy en cada una de las otras 8 celdas alrededor mio

-ARQUERO:
-ultimo jugador contrincante
-si el ultimo jugador contrincante esta dentro del area grande
-si el ultimo jugador contrincante esta dentro del area chica

ESTADOS

ARQUERO
-IDLE
-HAY UN ATACANTE SOLO, NO QUEDAN DEFENSORES
-NOS VIENEN, PERO HAY AL MENOS UN DEFENSOR

DEFENSOR
-IDLE
-NOS VIENEN, NO ES DE MI LADO
-NOS VIENEN Y SI ES DE MI LADO
-buscar el espacio para hacer un pase (no deberia durar mas q 3 tiempo)

MEDIO
-idle
-desmarcarse buscando q me la pasen
-buscar el espacio para hacer un pase (no deberia durar mas q 3 tiempo)
-NOS VIENEN, NO ES DE MI LADO
-NOS VIENEN Y SI ES DE MI LADO

ATACANTE
-IDLE
-desmarcarse buscando q me la pasen
-buscar el espacio para tirar al arco
-buscar el espacio para hacer un pase (no deberia durar mas q 3 tiempo)

---

Q DEBERIA HACER SEGUN CADA ESTADO:
-arquero
-idle:
-se para en algun lugar entre el arco y la pelota,
-'hay un atacante solo'
-si el contrincante esta dentro del area grande, sale
-sino, se para en algun lugar entre el area chica y al area grande, en algun punto entre la pelota y el arco
-"no vienen pero hay un defensor al menos"
-idem anterio pero no sale

-DEFENSOR
-tengo la pelota y la tengo q pasar

      -asignar un puntaje a cada jugador, segun cuánto conviene y q tan factible es hacerle el pase.
      -idem para cada una de las otras 8 posiciones mias posibles (moviendome 1m en cada direccion desde donde estoy).
      -Es decir q me quedan 9(posiciones)*10(jugadores), 90 posibilidades, si la mejor no es desde el punto en el cual estoy, me muevo. Y si la mejor (q ademas cumple el minimo de requisitos) sí es desde donde estoy, hago el pase.

-NOS VIENEN, NO ES DE MI LADO
-si hay un atacante de mi lado, ir a marcarlo:
trazar un vector q va desde el atacante q viene de mi lado sin la pelota y la pelota, y ponerme en el medio, a X metros del atacante sin pelota.

-NOS VIENEN Y SI ES DE MI LADO
-perseguir al q tiene la pelota
