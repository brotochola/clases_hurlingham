PROGRAMACION DE VIDEOJUEGOS 1


TEMAS:
- pixi js
- spatial hashing
- tabla de distancias precalculada
- juegos de 0 jugadores: game of life, particulas q hacen cosas
- boids
- flowfield
- finite state machine
- path finding
- fisica 2d con matterjs, box2d
- optimizacion (no calcular cosas de mas)
- mov de camara (mover todo el mundo)
- mouse y teclado, manejar algo del juego
- perlin noise
- serializacion, guardar, cargar

https://developer.mozilla.org/en-US/docs/Games/Techniques

https://www.red3d.com/cwr/steer/


LINK DE ZOOM:
https://us06web.zoom.us/j/81260618107


--

CLASES:


0 - js, chrome, github

    - quien soy
    https://www.linkedin.com/in/facundo-saiegh-60189664/
    https://github.com/brotochola

    - mencionar mi github, y la url del repositorio de esta clase
    - hacer grupo de whatsapp


    -qué vamos a hacer: 
        -mostrar juego de los zombies:
            https://brotochola.github.io/clases_hurlingham/ejemplo/ejemplo.html            
        -mostrar juego q perro espanta ovejas
            https://brotochola.github.io/clases_hurlingham/ejemplo3%20-%20ovejas/ovejas.html
        -gta 1
            https://brotochola.github.io/clases_hurlingham/ejemplo2/auto.html
        -esquivar obstaculos
            https://brotochola.github.io/clases_hurlingham/ejemplo4%20-%20avoid.html
        -boids como una masa, con imgs blureadas ?


        -otros juegos q seguro usan, o podrian usar, algun algoritmo similar:
        https://www.youtube.com/watch?v=ZgOfBvD4avw
        asteroids
        2d hockey
        https://www.youtube.com/watch?v=P3YNV1iOdh0
        2d futbol
        https://www.youtube.com/watch?v=_SrIcF_uPGY
        

        -explicar qué tienen los ejemplos:
            -grilla (spatial hashing)
            -vectores
            -boids
            -manejo de sprites animados

        -preguntar y debatir que podemos hacer con vectores, boids, vista isometrica, etc
        -mostrar programa de la materia y preguntar quien sabe q es cada tema.

        ----

        -q cada uno se presente, edad, laburo, cuanto programa
    
        -la primer mitad de la clase vemos como cada uno pudo implementar en su juego lo visto en la clase anterior
        -la segunda mitad de la clase yo voy a pasar contenidos nuevos, q cada grupo deberia implementar durante la semana en su juego y subirlo a su repositorio

        -explicar TP final
        
        -vamos a ponernos en grupos de a 2

        
   

    


            

    
    // CONTENIDO DE LA CLASE 0:

    -Porqué js, la web, cantidad de usuarios, lo facil q es, etc
    -webgl: 'hoy dia la web tambien usa el gpu':
        https://threejs.org/examples/#webgl_animation_keyframes

    
    -Todo es codigo abierto en la web, mostrar algun juego random
        * Angry birds abierto: https://funhtml5games.com/angrybirds/index.html
        * Arkanoid ofuscado: https://play.arkanoid.online/?lang=en

        
    -Chrome, la consola, el ojito, emulador de dispositivos, sources, debugger, ir paso por paso

    -LocalStorage

    -arrancar un html de cero, con bloc de notas.
    -despues pasar al visual studio code, q es un editor de texto para codigo: te pone colorcitos
    -en js todo es un objeto y mencionar el objeto window y sus propiedades
    
    -chatgpt es un capo/a

    -gameloop
    -request animation frame


1 - "Pixi y levantar imagenes"
    Pixi,
    Mostrar el panel de desarrolladores de pixi,        
    contenedores,
    cargar imagenes,    
    -momento CORS, hablar de webservers y Node, el NPM, y vamos a instalar "serve"


2 - "mover a un personaje con el teclado y mouse, touches en celu"
    - Eventos en JS
    - Meter la data del teclado y del mouse en la clase Juego
    - Asignar velocidad al protagonista
    - Spritesheet
    
    https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/


3 - "entidades en posiciones y movimientos"
    - Clase entidades,
    - Clase para personajes, protagonista, arboles,
    - Posicion, velocidad, aceleracion (y fuerza), Newton (f=m*a)
    - Vectores
    - update (calcular) y render (mostrar)
    - perseguir, escapar, etc

https://www.youtube.com/watch?v=P_xJMH8VvAE

    
4 - NPC, Boids
    Zombies persiguen al protagonista
    Otros personajes se escapan de los zombies
    Otros personajes persiguen al protagonista 
    Alineacion
    Separacion
    Cohesion
    Los personajes q perseguian al protagonista le hacen boids
    - zIndex


    https://www.youtube.com/watch?v=6dJlhv3hfQ0


    
5 - "movimiento de camara suave con lerp"
    - calcular mov de camara, moviendo todo el stage
    - meter todo en un contenedor y moverlo para no tocar el stage
    - lerp al mov de camara
    - explicar lerp
    - aplicarl lerp a la velocidad del personaje
    - interpolacion exporencial/logaritmica (rapido-lento, o lento-rapido), sigmoid
    - mencionar zoom


6 - grid y tiles (quadtrees)
    precalcular istancias para no tener q ahcer el teorema de pitagoras todo el tiempo
    https://www.youtube.com/watch?v=eED4bSkYCB8
    mencionar game of life:
    https://www.youtube.com/watch?v=FWSR_7kZuYg
    game of life mas flashero:
    https://www.youtube.com/watch?v=6kiBYjvyojQ
    particles life
    https://www.youtube.com/watch?v=p4YirERTVF0&t=25s
    dual grid system:
    https://www.youtube.com/watch?v=jEWFSv3ivTg

https://lh6.googleusercontent.com/proxy/lfRcg88KS29QBrEBqxi8bhDnSeHUvtrP2N2yA69I1_tZXE6twcutntlMkUlvHZbDL4rXfvzVKJKDf6qiTGPkresv1aGvpbJdJKx_tCnsojw
    
7 - finite state machine
    conceptualmente

8 - graficos segun estado

9 - colisiones y motor de fisica 2d

10 - optimizacion
    -quadtree
    -aproximacion de pitagoras
    -distancias precalculadas

11 - cordova, electron, itch.io
    - "venderlo primero y desarrollarlo despues"
    - proof of concept
    - plan de negocios
    - no esperar al final para generar todos los graficos necesarios (de hecho esto tiene q ver con el marketing)    
    - "el desarrollo de software es una gran estafa piramidal, esquema ponzi"

