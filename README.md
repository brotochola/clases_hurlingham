**UNIVERSIDAD NACIONAL DE HURLINGHAM**  
**Programación de Videojuegos 1**  
**Profesor Facundo Saiegh**  
**https://www.linkedin.com/in/facundo-saiegh-60189664/**  
**https://github.com/brotochola**  

**Objetivos de la Materia:**

El propósito de este cuatrimestre es introducir a los estudiantes en los conceptos fundamentales de JavaScript y PixiJS, y familiarizarlos con el entorno de desarrollo de Google Chrome.  
A lo largo del curso, los estudiantes adquirirán las habilidades necesarias para desarrollar un videojuego 2D utilizando la librería PixiJS.

**Trabajo Práctico Final:**

Organizados en grupos de dos personas, los estudiantes deberán desarrollar y presentar un videojuego 2D que cumpla con los siguientes requisitos:

1. **Cantidad de Personajes**: El juego debe incluir un número significativo de personajes (más de 50\) que implementen el algoritmo Boids o una variación similar.  
2. **Interactividad**: El usuario debe tener la capacidad de interactuar con el juego en tiempo real mediante el uso del mouse y/o teclado.  
3. **Ejemplos de Juegos**: Algunas posibles ideas incluyen:  
   * Juego de matar hordas de zombis.  
   * Un perro que arrea ganado.  
   * Simulador de pesca.  
   * Pelea entre grandes grupos de personas.  
   * Defender a una celebridad de sus fanáticos enloquecidos.

**Requisitos Técnicos:**

El juego desarrollado deberá incluir, como mínimo, los siguientes aspectos técnicos:

* **Input del Usuario**: Interacción a través de mouse y/o teclado.  
* **Spatial Hashing**: Optimización espacial para manejar grandes cantidades de personajes.  
* **Spritesheets**: Uso de múltiples spritesheets por personaje.  
* **Algoritmo Boids**: Implementación del algoritmo Boids para la simulación de comportamiento grupal.  
* **Movimiento de Cámara**: Movimiento suave de cámara utilizando interpolación lineal (Lerp).  
* **Finite State Machine (FSM)**: Implementación de una máquina de estados finitos para gestionar las transiciones y comportamientos de los personajes.

**Elementos Opcionales:**

El juego puede también incorporar uno o más de los siguientes elementos opcionales, que serán abordados en clase, aunque con menor profundidad que los elementos obligatorios:

* **Perlin Noise**: Aplicación del ruido Perlin en algún aspecto del juego.  
* **Técnicas de Optimización Algorítmica**: Aplicación de optimizaciones avanzadas en el algoritmo o simulación.  
* **Motor de Física 2D**: Implementación de un motor de física como MatterJS, Box2D, PlanckJS, entre otros.  
* **Serialización**: Capacidad de guardar y cargar partidas.  
* **Flowfield**: Implementación de campos de flujo para guiar el movimiento de los personajes.  
* **Path Finding**: Algoritmos de búsqueda de caminos, como A\* o similares.


**Estructura de las Clases:**

Cada clase del curso estará dividida en dos partes:
1. **Primera Parte:** Durante la primera mitad de la clase, se dedicarán a resolver dudas y brindar apoyo a los estudiantes en la implementación de los contenidos vistos en la clase anterior dentro de sus proyectos  
2. **Segunda Parte:** En la segunda mitad de la clase, se presentarán nuevos contenidos que los estudiantes deberán implementar en sus proyectos a lo largo de la semana. Estos nuevos conceptos serán fundamentales para la progresión del desarrollo del juego y su complejidad.



---





### **Plan de Clases:**

El curso está estructurado en 12 clases, cada una con un enfoque específico. A continuación, se detalla el contenido de las mismas:

1.  **Conceptos Básicos de JavaScript**  
   * **Uso de las Herramientas de Desarrollo de Google Chrome**:  
      1. **Pestaña Network**: Monitoreo de solicitudes de red.  
      2. **Pestaña Sources**: Exploración del código fuente y manejo de archivos.  
      3. **Consola**: Ejecución de comandos y debugging en tiempo real.  
      4. **Debugger y Breakpoints**: Uso de breakpoints para depurar código.  
      5. **LocalStorage**: Almacenamiento local en el navegador.  
   *  **JavaScript Básico**:  
      1. **Tipos de Datos y sintaxis**: Introducción a JavaScript.  
      2. **Gameloop**: Concepto de bucle de juego y su implementación básica.  
      3. **setTimeout, setInterval, RequestAnimationFrame**: Uso de `requestAnimationFrame` para sincronizar la animación con la tasa de refresco de la pantalla.  
   *  **Uso de ChatGPT para Generación de Código**: Introducción al uso de herramientas de inteligencia artificial como ChatGPT para asistencia en la programación.

--

      
2. **PixiJS y Carga de Imágenes**  
   *  **Introducción a PixiJS**: Presentación de la librería PixiJS y su importancia en el desarrollo de videojuegos 2D.  
   *  **Panel de Desarrolladores de PixiJS**: Exploración del panel de herramientas de desarrollo específico de PixiJS.  
   *  **Contenedores en PixiJS**: Creación y manejo de contenedores para organizar elementos gráficos.  
   *  **Carga de Imágenes**: Métodos para cargar y mostrar imágenes en PixiJS.  
   *  **CORS**: Explicación sobre las restricciones de CORS
   *  **WebServer**: introducción a servidores web y NodeJS  
   *  **NPM y Servidores Locales**: Instalación y uso de algun paquete de Node para levantar un servidor local.  

--

3. **Movimiento del Personaje con Teclado y/o Mouse**  
   *  **Eventos en JavaScript**: Captura y manejo de eventos de teclado y mouse.  
   *  **Gestión de Input**: Almacenamiento y procesamiento de la entrada del usuario dentro de la estructura del juego.  
   *  **Asignación de Velocidad al Protagonista**: Implementación de movimiento basado en la entrada del usuario.  
   *  **Uso de Spritesheets**: Introducción al uso de spritesheets para animar el personaje.  
   *  **Herramientas Externas para el manejo de SpriteSheets**
 
 --

4. **Entidades en Posiciones y Movimientos**  
   *  **Creación de Clase Entidad**: Estructuración del código en una clase genérica de la cual heredan los demás tipos de objetos  
   *  **Desarrollo de Clases para Personajes y Objetos**: Creación de clases específicas para el protagonista, NPCs, y objetos estáticos como árboles o edificios.  
   *  **Física Básica**: Implementación de conceptos de física newtoniana, como posición, velocidad, aceleración y fuerza.  
   *  **Manejo de Vectores**: Introducción y aplicación de vectores para manejar posiciones y movimientos.  
   *  **Update vs Render**: Cálculo de posiciones y representación en pantalla.  
   *  **Comportamientos de Persecución y Evasión**: Implementación de comportamientos como ‘perseguir’ y ‘escapar’.  

--  

5. **NPCs y Algoritmo Boids**  
   *  **Implementación de NPCs**: Creación de personajes no jugables (NPCs) que interactúan con el protagonista.  
   *  **Comportamientos Complejos**:  
      1. **Zombies persiguiendo al protagonista**.  
      2. **Personajes que huyen de los zombies**.  
      3. **Personajes que persiguen al protagonista**.  
   *  **Algoritmo Boids**:  
      1. **Alineación**: Coordinación de la dirección de los NPCs.  
      2. **Separación**: Evitar colisiones entre NPCs.  
      3. **Cohesión**: Mantener a los NPCs agrupados.  
   *  **Uso del zIndex**: Control de la superposición de los elementos gráficos en pantalla.
      
--

6. **Movimiento de Cámara \+ Interpolación Lineal**  
   *  **Cálculo del Movimiento de Cámara**: Descripción del proceso para implementar un movimiento de cámara que sigue al protagonista del juego, moviendo todo el escenario de forma fluida.  
   *  **Aplicación de Lerp al Movimiento de Cámara**: Implementación de interpolación lineal (Lerp) para suavizar el movimiento de la cámara  
   *  **Explicación de Lerp**: Introducción al concepto de Lerp (Linear Interpolation), su funcionamiento y su aplicación en el contexto del desarrollo de videojuegos.  
   *  **Aplicación de Lerp a la Velocidad del Personaje**: O a otras variables de física.  
   *  **Interpolación Exponencial y Logarítmica**: Explicación de métodos avanzados de interpolación, como la exponencial y logarítmica, así como la función sigmoidea, para crear transiciones de movimiento más naturales.  

--

7. **Grid y Tiles: Spatial Hashing**  
   *  **Problemas con el Cálculo del Teorema de Pitágoras en Múltiples Objetos**: Análisis de las dificultades y limitaciones que surgen al calcular la distancia entre muchos objetos utilizando el teorema de Pitágoras, especialmente en términos de rendimiento computacional en juegos con numerosos elementos móviles.  
   *  **Spatial Hashing: Funcionamiento Detallado**: Exploración en detalle del concepto de Spatial Hashing, una técnica que divide el espacio en celdas y asigna objetos a estas celdas para reducir el número de cálculos necesarios.

--

8. **Finite State Machine (FSM)**  
   *  **Introducción a las Finite State Machines (FSM)**: Explicación de los conceptos básicos de una FSM y cómo se utilizan para gestionar comportamientos complejos en videojuegos.  
   *  **Estados, acciones y sprites**  
   *  **Cambio de Estado** según variables propias y del entorno de cada NPC, y toma de decisiones según estado.  
     
--

9. **Sistema de Animación**   
   * **Entorno \-\> Estado \-\> Acción \-\> Selección de Sprite**: Según el estado proporcionado por la FSM, las propias variables del NPC y de su entorno, el sistema de animación selecciona y muestra la secuencia de imágenes o sprites adecuados para representar el comportamiento del NPC en ese estado.

--

10. **Colisiones y Motor de Física 2D**
*  **Colisiones sin motor de física**  
*  **Motores de física 2D**:  
   1. Introducción a motores como Matter.js y Box2D.  
   2. Integración básica de MatterJS con PixiJS.  
   3. Ejemplos de uso: simulación de gravedad, rebotes, fricción, etc.

--

11. **Optimización**
    *  **Secuencia de frames vs Animación Esqueletal:** Spine, Adobe Animate  
    *  **Quadtree**:  
       1. Explicación del algoritmo Quadtree para optimización de colisiones.  
       2. Implementación de un Quadtree básico en JavaScript.  
       3. Ejemplos de cómo un Quadtree mejora el rendimiento en detección de colisiones.  
    *  **Aproximación de Pitágoras**:  
       1. Explicación del cálculo de distancias utilizando el teorema de Pitágoras.  
       2. Métodos de aproximación para evitar cálculos complejos.  
       3. Implementación de aproximaciones y su impacto en el rendimiento.  
    *  **Distancias Precalculadas**:  
       1. Concepto de precálculo y caching en el desarrollo de juegos.  
       2. Ejemplo de una lookup table para distancias entre celdas en una grid.  
       3. Comparación de rendimiento entre cálculos en tiempo real y distancias precalculadas.

--     

12. ### **Cordova, ElectronJS, Itch.io, PWAs.**
   *  **Publicación de juegos en diferentes plataformas**:  
      1. Introducción a Cordova/Capacitor y ElectronJS para portar juegos a dispositivos móviles y escritorio.  
      2. Pasos básicos para empaquetar un juego con Cordova y ElectronJS.  
      3. Progressive Web Apps, pros y contras.  
   *  **Marketing y estrategia de lanzamiento**:  
      1. "Venderlo primero y desarrollarlo después": La importancia de validar ideas antes de invertir tiempo y recursos.  
      2. Proof of Concept: Cómo desarrollar una demo básica para obtener feedback temprano.  
      3. Plan de negocios para un juego independiente: cómo estructurar una propuesta de valor.  
   *  **Reflexión sobre el desarrollo de software y Monetización**:  
      1. Discusiones sobre diferentes modelos de negocios aplicados al desarrollo de videojuegos independientes; costo de adquisición publicitaria por usuario.

--

### Links / Material

**Ejemplo Zombies**
https://brotochola.github.io/clases_hurlingham/ejemplo/ejemplo.html  
**Ejempo Ovejas**
https://brotochola.github.io/clases_hurlingham/ejemplo3%20-%20ovejas/ovejas.html  
**requestAnimationFrame**
https://developer.mozilla.org/es/docs/Web/API/Window/requestAnimationFrame  
**CORS**
https://developer.mozilla.org/es/docs/Web/HTTP/CORS  
**PixiJS**
https://pixijs.com/  
**NodeJS**
https://nodejs.org/en  
**Serve**
https://www.npmjs.com/package/serve  
**Free Texture Packer**
https://free-tex-packer.com/app/  
**Spritesheet Generator**
https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/  
**PIXI.AnimatedSprite**
https://www.youtube.com/watch?v=FjiQSwohBVs  
**Fuerzas Gravitatorias**
https://www.youtube.com/watch?v=EpgB3cNhKPM  
**Agentes Autónomos**
https://www.youtube.com/watch?v=P_xJMH8VvAE  
**BOIDS**
https://www.youtube.com/watch?v=6dJlhv3hfQ0  
https://www.youtube.com/watch?v=bqtqltqcQhw  
**LERP**
https://www.youtube.com/watch?v=8uLVnM36XUc  
**Spatial Hashing**
https://www.youtube.com/watch?v=i0OHeCj7SOw  
https://www.youtube.com/watch?v=sx4IIQL0x7c  
https://www.youtube.com/watch?v=h1xXcSvj7Io  
**Finite State Machine**
https://www.youtube.com/watch?v=9lt_nDBiHLY  
**MatterJS**
https://www.youtube.com/watch?v=TDQzoe9nslY  
**Apache Cordova (apps híbridas)**
https://www.youtube.com/watch?v=Aqzuakon7S0  

--


**EXTRAS**  
    Técnicas para el desarrollo de juegos web: https://developer.mozilla.org/es/docs/Games/Techniques  
    Game of Life: https://www.youtube.com/watch?v=FWSR_7kZuYg  
    Lenia, tipo Game of Life: https://www.youtube.com/watch?v=6kiBYjvyojQ  
    Particles Life: https://www.youtube.com/watch?v=p4YirERTVF0          
    Steering Behaviours by Craig Reynolds: https://www.red3d.com/cwr/steer/  
    Quadtree: https://www.youtube.com/watch?v=OJxEcs0w_kE  
    Quadtree, ejemplos: https://codepen.io/_bm/pen/ExPBMrW
                        https://codepen.io/afterburn/pen/pQVYXp

    Flowfield + Perlin Noise: https://www.youtube.com/watch?v=BjoM9oKOAKY  
    Filtros en PixiJS: https://www.youtube.com/watch?v=WAoDOM8PSw8  
    Diferentes Métodos para simular física: https://www.youtube.com/watch?v=-GWTDhOQU6M
    Animación Esquelética: https://www.youtube.com/watch?v=sq6mnix8eAg
    Dual Grid System: https://www.youtube.com/watch?v=jEWFSv3ivTg  