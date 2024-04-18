import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js'; // Importa Tween.js para las animaciones
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

let camera, scene, renderer;
let player, platforms,lastPlatform, coins, star;
let score = 0;

let velocity = 0; // Velocidad inicial
const gravity = 0.01; // Gravedad
let jumping = false; // Variable para controlar si el cubo está en medio de un salto



function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 0.5, 0);


    // Crear una luz direccional frontal
    const directionalLightFront = new THREE.DirectionalLight(0xffffff, 5);
    directionalLightFront.position.set(0, 1, 0); // Ajusta la posición de la luz en el eje Y para que esté arriba
    directionalLightFront.target.position.set(0, 0, 0); // Establece el objetivo de la luz en el centro de la escena
    scene.add(directionalLightFront);

    // Crear una luz ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    scene.add(ambientLight);

    // Cargar la textura del cielo y las nubes
    const textureLoader = new THREE.TextureLoader();
    const skyTexture = textureLoader.load('img/cieloConNubes.jpg'); // Reemplaza 'sky.jpg' con la ruta a tu imagen del cielo y las nubes

    // Crear un material utilizando la textura cargada
    const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });

    // Crear una geometría grande para el cielo y las nubes
    const skyGeometry = new THREE.BoxGeometry(2000, 1000, 1000); // Ajusta el tamaño del cubo según tus necesidades

    // Crear una malla con la geometría y el material del cielo y las nubes
    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);

    // Agregar la malla al escenario
    scene.add(skyMesh);

    platforms = new THREE.Group();
    scene.add(platforms);

    coins = new THREE.Group();
    scene.add(coins);

    // Mostrar el pop-up de instrucciones al iniciar el juego
    const instructionsPopup = document.getElementById('instructions-popup');

    // Event listener para cerrar el pop-up de instrucciones
    document.getElementById('close-instructions').addEventListener('click', function () {
        instructionsPopup.style.display = 'none';
    });

    
    const loader = new GLTFLoader();

    // Cargar el modelo de la plataforma
    const platformPath = 'models3d/round_platform.glb';
    loader.load(platformPath, function (gltf) {
        const platformModel = gltf.scene; // Obtener la escena del modelo

        // Aplicar una escala al modelo para ajustar su tamaño
        const scaleFactor = 1; // Factor de escala (ajústalo según sea necesario)
        platformModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Iterar para colocar el modelo en lugar de las plataformas
        for (let i = 1; i <= 20; i++) {
            // Clonar el modelo
            const platform = platformModel.clone();

            // Calcular la posición de la plataforma (ajústala según tus necesidades)
            platform.position.set(0, i * 2.3, 0);

            // Agregar la plataforma al grupo de plataformas
            platforms.add(platform);

            // Si es la última plataforma, establecerla como referencia
            if (i === 20) {
                lastPlatform = platform;

                // Colocar la estrella en la posición de la última plataforma
                const starPath = 'models3d/shining_star_low_poly.glb';
                loader.load(starPath, function (gltfstar) {
                    const starModel = gltfstar.scene; // Obtener la escena del modelo

                    // Aplicar una escala al modelo para ajustar su tamaño
                    const scaleFactor = 2; // Factor de escala (ajústalo según sea necesario)
                    starModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    // Configurar la posición de la estrella
                    star = starModel.clone();
                    star.position.copy(lastPlatform.position);
                    star.position.y += 4; // Elevar la estrella para que esté encima de la última plataforma
                    scene.add(star);

                });
            }

            // Resto del código para la configuración de las plataformas...
            // Creamos una animación Tween.js para hacer que la plataforma se mueva de un lado a otro
            const platformMovement = new TWEEN.Tween(platform.position)
            .to({ x: Math.random() > 0.5 ? 5 : -5 }, 1600) // Mueve la plataforma a una posición aleatoria a la derecha o izquierda
            .easing(TWEEN.Easing.Quadratic.InOut) // Aplica una función de easing para suavizar la animación
            .yoyo(true) // Hace que la animación se invierta automáticamente después de completarse
            .repeat(Infinity) // Hace que la animación se repita infinitamente
            .delay(Math.random() * 2000) // Agrega un pequeño retraso aleatorio para cada plataforma
            .start(); // Inicia la animación
        }
    });

    
    // Ruta del modelo de la moneda
    const coinPath = 'models3d/coin.glb';

    // Cargar el modelo de la moneda
        loader.load(coinPath, function (gltf) {
            const coinModel = gltf.scene;

            // Realiza las operaciones necesarias con el modelo cargado
            coinModel.scale.set(0.08, 0.08, 0.08); // Ajusta la escala de la moneda según sea necesario

            // Iterar para colocar las monedas en posiciones aleatorias en las plataformas
            for (let i = 1; i <= 20; i++) {
                // Agregar monedas a la plataforma (si es necesario)
                const numCoins = Math.floor(3); // Entre 1 y 3 monedas por plataforma
                for (let j = 0; j < numCoins; j++) {
                    const coin = coinModel.clone(); // Clonar el modelo de moneda
                    const randomX = Math.random() * 5.5 - 2; // Posición X aleatoria entre -2 y 4
                    const randomNegX = Math.random() * -5.5 + 2; // Posición X aleatoria entre -2 y -6
                    coin.position.set(Math.random() > 0.5 ? randomX : randomNegX, i * 2.3 + 0.8 , -1); // La posición X puede ser positiva o negativa
                    coins.add(coin); // Agregar la moneda al grupo de monedas
                }
            }

            // Se reinicia el juego cuando ganas
        document.getElementById('reset-button').addEventListener('click', function () {
            // Reiniciar el puntaje a cero
            score = 0;
            document.getElementById('points').textContent = score;

            // Eliminar todas las monedas restantes
            coins.children = [];

            // Reiniciar la posición del jugador
            player.position.set(0, 0.1, 0);

            // Reiniciar la posición de las plataformas
            platforms.children.forEach(platform => {
                platform.position.x = 0; // Reiniciar posición en el eje X
            });

            // Volver a generar las monedas
            for (let i = 1; i <= 20; i++) {
                // Agregar monedas a la plataforma (si es necesario)
                const numCoins = Math.floor(3); // Entre 1 y 3 monedas por plataforma
                for (let j = 0; j < numCoins; j++) {
                    const coin = coinModel.clone(); // Clonar el modelo de moneda
                    const randomX = Math.random() * 5.5 - 2; // Posición X aleatoria entre -2 y 4
                    const randomNegX = Math.random() * -5.5 + 2; // Posición X aleatoria entre -2 y -6
                    coin.position.set(Math.random() > 0.5 ? randomX : randomNegX, i * 2.3 + 0.8 , -1); // La posición X puede ser positiva o negativa
                    coins.add(coin); // Agregar la moneda al grupo de monedas
                }
            }

            // Ocultar el pop-up de "Ganaste"
            document.getElementById('container-popup').style.display = 'none';

            // Reactivar el juego
            resetGame();
        });

        // Se reinicia el juego cuando perdes
        document.getElementById('reset-button-lose').addEventListener('click', function () {
            // Reiniciar el puntaje a cero
            score = 0;
            document.getElementById('points').textContent = score;

            // Eliminar todas las monedas restantes
            coins.children = [];

            // Reiniciar la posición del jugador
            player.position.set(0, 0.1, 0);

            // Reiniciar la posición de las plataformas
            platforms.children.forEach(platform => {
                platform.position.x = 0; // Reiniciar posición en el eje X
            });

            // Volver a generar las monedas
            for (let i = 1; i <= 20; i++) {
                // Agregar monedas a la plataforma (si es necesario)
                const numCoins = Math.floor(3); // Entre 1 y 3 monedas por plataforma
                for (let j = 0; j < numCoins; j++) {
                    const coin = coinModel.clone(); // Clonar el modelo de moneda
                    const randomX = Math.random() * 5.5 - 2; // Posición X aleatoria entre -2 y 4
                    const randomNegX = Math.random() * -5.5 + 2; // Posición X aleatoria entre -2 y -6
                    coin.position.set(Math.random() > 0.5 ? randomX : randomNegX, i * 2.3 + 0.8 , -1); // La posición X puede ser positiva o negativa
                    coins.add(coin); // Agregar la moneda al grupo de monedas
                }
            }

        // Ocultar el pop-up de "Perdiste"
        document.getElementById('container-popup-lose').style.display = 'none';

        gameOverPopupShown = false; // Variable para controlar si el popup de "Perdiste" ya se ha mostrado
        gameOver = false; // Variable global para seguir el estado del juego
    });

    });


    const fbxLoader = new FBXLoader();

    fbxLoader.load('models3d/Raton/Mousee.fbx', function (fbx) {
        // Escala el modelo para hacerlo más pequeño
        fbx.scale.set(0.011, 0.011, 0.011);
    
        // Agrega el modelo a la escena
        scene.add(fbx);
    
        // Asigna el modelo cargado a la variable player
        player = fbx;
    
        // Reproducir la animación
        const mixer = new THREE.AnimationMixer(player);
        const idleAction = mixer.clipAction(player.animations[0]); // Suponiendo que la quinta animación es la de Idle
        idleAction.play();
    
        // Actualizar la animación en cada cuadro
        function animate() {
            mixer.update(0.016); // Puedes ajustar este valor según la velocidad de tu juego
            requestAnimationFrame(animate);
        }
    
        document.addEventListener('keydown', function (event) {
            if (event.code === 'Space') { // Verifica si se ha pulsado la barra espaciadora
                jump(); // Llama a la función de salto
    
                // Detener la animación actual
                mixer.stopAllAction();
    
                // Reproducir la animación de salto una vez con easing
                const jumpAction = mixer.clipAction(player.animations[1]); // Suponiendo que la segunda animación es la de salto
                jumpAction.clampWhenFinished = true; // Asegura que la animación se detenga al finalizar
                jumpAction.loop = THREE.LoopOnce; // Reproducir una vez

                // Ajusta la velocidad de reproducción y aplica easing
                jumpAction.timeScale = 0.001; // Ajusta la velocidad de reproducción (cambia el valor según sea necesario)
                jumpAction.setEffectiveTimeScale(3); // Ajusta el efecto de escala de tiempo para aplicar easing (cambia el valor según sea necesario)

                jumpAction.play();
    
                // Programar la reanudación de la animación de inactividad (idle) después de que termine la animación de salto
                setTimeout(function () {
                    mixer.stopAllAction();
                    idleAction.play(); // Vuelve a reproducir la animación de idle
                }, jumpAction._clip.duration * 660); // Espera el tiempo de duración de la animación de salto antes de reproducir la animación de inactividad
            }
        });


        // Event listener para detectar la pulsación continua de las teclas A y D
        document.addEventListener('keydown', function (event) {
            if (event.code === 'KeyA') { // Verifica si se ha pulsado la tecla A (moverse a la izquierda)
                const runLeftAction = mixer.clipAction(player.animations[2]); // Suponiendo que la tercera animación es la de correr hacia la izquierda
                player.rotation.y = 5; //Restablecer la rotación del modelo (mirando hacia la izquierda)
                if (runLeftAction && !runLeftAction.isRunning()) {
                    // Inicia la animación de correr hacia la izquierda si no se está reproduciendo
                    runLeftAction.play();
                }
            } else if (event.code === 'KeyD') { // Verifica si se ha pulsado la tecla D (moverse a la derecha)
                const runRightAction = mixer.clipAction(player.animations[2]); // Suponiendo que la tercera animación es la de correr hacia la derecha
                player.rotation.y = 20;// Restablecer la rotación del modelo (mirando hacia la derecha)
                if (runRightAction && !runRightAction.isRunning()) {
                    // Inicia la animación de correr hacia la derecha si no se está reproduciendo
                    runRightAction.play();
                }
            }
        });

        // Event listener para detectar el levantamiento de las teclas A y D
        document.addEventListener('keyup', function (event) {
            if (event.code === 'KeyA') { // Verifica si se ha soltado la tecla A (moverse a la izquierda)
                const runLeftAction = mixer.clipAction(player.animations[2]); // Suponiendo que la tercera animación es la de correr hacia la izquierda
                if (runLeftAction && runLeftAction.isRunning()) {
                    // Detiene la animación de correr hacia la izquierda si se está reproduciendo
                    runLeftAction.stop();
                }
            } else if (event.code === 'KeyD') { // Verifica si se ha soltado la tecla D (moverse a la derecha)
                const runRightAction = mixer.clipAction(player.animations[2]); // Suponiendo que la tercera animación es la de correr hacia la derecha
                if (runRightAction && runRightAction.isRunning()) {
                    // Detiene la animación de correr hacia la derecha si se está reproduciendo
                    runRightAction.stop();
                }
            }
        });

        // Variables para almacenar las coordenadas táctiles iniciales
        let touchStartX = 0;
        let touchStartY = 0;

        // Variable para almacenar la acción de correr actual
        let currentRunAction = null;

        // Factor de escala para ajustar la velocidad de movimiento
        const movementScaleFactor = 0.25; // Puedes ajustar este valor según tu preferencia

        // Evento touchstart
        document.addEventListener('touchstart', function (event) {
            // Obtener las coordenadas táctiles iniciales
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;

            // Determinar si el toque está en la mitad izquierda o derecha de la pantalla
            if (touchStartX < window.innerWidth / 2) { // Si el toque está en la mitad izquierda
                // Ejecuta la lógica para moverse a la izquierda
                moveLeft();
            } else { // Si el toque está en la mitad derecha
                // Ejecuta la lógica para moverse a la derecha
                moveRight();
            }
        });

        // Evento touchmove
        document.addEventListener('touchmove', function (event) {
            // Evita que la página se desplace verticalmente durante el desplazamiento del dedo
            event.preventDefault();

            // Obtener las coordenadas táctiles actuales
            const touchCurrentX = event.touches[0].clientX;
            const touchCurrentY = event.touches[0].clientY;

            // Calcular la distancia horizontal y vertical desplazada
            const deltaX = (touchCurrentX - touchStartX) * movementScaleFactor; // Ajustar la velocidad horizontal
            const deltaY = touchCurrentY - touchStartY;

            // Determinar si el movimiento es horizontal o vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Movimiento horizontal
                if (deltaX > 0) {
                    // Desplazamiento hacia la derecha
                    moveRight();
                } else {
                    // Desplazamiento hacia la izquierda
                    moveLeft();
                }
            } else {
                // Movimiento vertical
                if (deltaY < -10) {
                    // Desplazamiento hacia arriba (saltar)

                    // Detener la animación actual
                    mixer.stopAllAction();

                    // Reproducir la animación de salto una vez con easing
                    const jumpAction = mixer.clipAction(player.animations[1]); // Suponiendo que la segunda animación es la de salto
                    jumpAction.clampWhenFinished = true; // Asegura que la animación se detenga al finalizar
                    jumpAction.loop = THREE.LoopOnce; // Reproducir una vez

                    // Ajusta la velocidad de reproducción y aplica easing
                    jumpAction.timeScale = 0.001; // Ajusta la velocidad de reproducción (cambia el valor según sea necesario)
                    jumpAction.setEffectiveTimeScale(3); // Ajusta el efecto de escala de tiempo para aplicar easing (cambia el valor según sea necesario)

                    jumpAction.play();

                    // Programar la reanudación de la animación de inactividad (idle) después de que termine la animación de salto
                    setTimeout(function() {
                        mixer.stopAllAction();
                        idleAction.play(); // Vuelve a reproducir la animación de idle
                    }, jumpAction._clip.duration * 3000); // Espera el tiempo de duración de la animación de salto antes de reproducir la animación de inactividad
                }
            }

            // Actualizar las coordenadas táctiles iniciales para el siguiente evento
            touchStartX = touchCurrentX;
            touchStartY = touchCurrentY;
        });

        // Evento touchend
        document.addEventListener('touchend', function (event) {
            // Detener la animación actual si existe
            if (currentRunAction) {
                currentRunAction.stop();
            }

            // Lógica para detener el movimiento o cualquier otra acción al levantar el dedo
        });

        // Función para moverse hacia la izquierda
        function moveLeft() {
            // Reproducir la animación de correr hacia la izquierda
            currentRunAction = mixer.clipAction(player.animations[2]); // Suponiendo que la tercera animación es la de correr hacia la izquierda
            player.rotation.y = 5; // Restablecer la rotación del modelo (mirando hacia la izquierda)
            if (currentRunAction && !currentRunAction.isRunning()) {
                // Inicia la animación de correr hacia la izquierda si no se está reproduciendo
                currentRunAction.play();
            }
        }

        // Función para moverse hacia la derecha
        function moveRight() {
            // Reproducir la animación de correr hacia la derecha
            currentRunAction = mixer.clipAction(player.animations[2]); // Suponiendo que la tercera animación es la de correr hacia la derecha
            player.rotation.y = 20; // Restablecer la rotación del modelo (mirando hacia la derecha)
            if (currentRunAction && !currentRunAction.isRunning()) {
                // Inicia la animación de correr hacia la derecha si no se está reproduciendo
                currentRunAction.play();
            }
        }


            
        animate(); // Inicia la animación después de cargar el modelo
    });

    

    // Cargar el modelo 3D del terreno
    const terrainLoader = new GLTFLoader();
    terrainLoader.load('models3d/low_poly_environments_01.glb', function (gltf) {
        const terrain = gltf.scene;

        // Ajustar la escala del terreno
        terrain.scale.set(4, 4, 4); // Ajusta según sea necesario

        // Ajustar la posición del terreno para que esté debajo del eje Y
        terrain.position.set(0, -0.95, 45); // Por ejemplo, para que esté 10 unidades debajo del eje Y

        terrain.rotation.y = 4.7;

        // Agregar el terreno a la escena
        scene.add(terrain);
    });

    animate();
}


function handleCoinCollision() {
    coins.children.forEach(coin => {
        // Obtener los límites del modelo del jugador
        const playerBoundingBox = new THREE.Box3().setFromObject(player);

        // Obtener los límites del modelo de la moneda
        const coinBoundingBox = new THREE.Box3().setFromObject(coin);

        // Verificar si hay colisión entre los dos modelos
        if (playerBoundingBox.intersectsBox(coinBoundingBox)) {
            coins.remove(coin);
            score++;
            document.getElementById('points').textContent = score;
        }
    });
}

function updateCamera() {
    const targetY = player.position.y + 1; // Altura deseada de la cámara sobre el cubo
    const targetX = player.position.x; // Posición X del cubo
    const currentY = camera.position.y;
    const currentX = camera.position.x;
    const deltaY = targetY - currentY; // Diferencia en el eje Y
    const deltaX = targetX - currentX; // Diferencia en el eje X

    // Ajustamos la posición de la cámara para seguir al cubo en el eje Y
    camera.position.y += deltaY * 0.1; // Factor de suavizado para la transición suave en el eje Y

    // Ajustamos la posición de la cámara para seguir al cubo en el eje X
    camera.position.x += deltaX * 0.1; // Factor de suavizado para la transición suave en el eje X

    camera.lookAt(player.position); // La cámara sigue mirando al cubo
}

let gameOver = false; // Variable global para seguir el estado del juego

function update() {

    handleCoinCollision();

    console.log("Posicion del cubo " + player.position.y);
    console.log(velocity);
    console.log('gravedad'+gravity);

    // Verificar si el jugador ha caído lo suficiente como para perder
    if (velocity < -0.35 && player.position.y <= 50) {
        // Aquí el jugador pierde, puedes llamar a una función para manejar la pérdida del juego
        gameOver = true;
        showGameOverPopup();
    }

    if (player.position.y > 0 || velocity > 0) {
        // Verifica si el cubo está en contacto con alguna plataforma
        const collisionPlatforms = platforms.children.filter(platform => {
            // Calculamos los límites del cubo
            const playerBottomY = player.position.y - 0.3;
            const playerTopY = player.position.y + 0.3;
            const playerLeftX = player.position.x - 0.5;
            const playerRightX = player.position.x + 0.5;

            // Calculamos los límites de la plataforma (teniendo en cuenta el movimiento)
            const platformTopY = platform.position.y + 0.1;
            const platformBottomY = platform.position.y - 0.1;
            const platformLeftX = platform.position.x - 2.5; // La plataforma tiene 5 de ancho, por lo que restamos 2.5 para obtener el límite izquierdo
            const platformRightX = platform.position.x + 2.5; // Sumamos 2.5 para obtener el límite derecho

            // Verificamos si hay colisión en el eje Y y en el eje X
            const collidingY = playerTopY >= platformBottomY && playerBottomY <= platformTopY;
            const collidingX = playerRightX >= platformLeftX && playerLeftX <= platformRightX;

            return collidingY && collidingX;
        });

        if (collisionPlatforms.length > 0 && velocity < 0) { // Si el cubo está en una plataforma y está cayendo
            const lowestPlatform = collisionPlatforms.reduce((prev, curr) => {
                return prev.position.y < curr.position.y ? prev : curr;
            }); // Encuentra la plataforma más baja
            player.position.y = lowestPlatform.position.y + 0.1; // Posiciona el cubo en la plataforma
            velocity = 0; // Detiene la caída
            jumping = false; // Marca que el cubo ha terminado el salto
        } else { // Si el cubo no está en una plataforma o está subiendo
            velocity -= gravity; // Aplica la gravedad
            player.position.y += velocity; // Actualiza la posición del cubo
        }
    } else {
        player.position.y = 0; // Asegura que el cubo no se hunda en el suelo
        velocity = 0; // Resetea la velocidad cuando toca el suelo
        jumping = false; // Marca que el cubo ha terminado el salto
    }


    // Actualizamos la posición de las plataformas
    platforms.children.forEach(platform => {
        platform.position.x += 0.0001; // Modifica aquí la velocidad y dirección del movimiento de la plataforma
    });

    render();
}

let winAlertShown = false; // Variable para controlar si la alerta de victoria ya se ha mostrado
let winPopup = document.getElementById('container-popup'); // Obtener el elemento del pop-up

// Crear estrella gigante
const starGeometry = new THREE.BoxGeometry(2, 2, 2);
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
star = new THREE.Mesh(starGeometry, starMaterial);
star.position.y = 1000

function checkWin() {


    const playerBox = new THREE.Box3().setFromObject(player);
    const starBox = new THREE.Box3().setFromObject(star);

    document.getElementById('total-score').textContent = score;

    if (playerBox.intersectsBox(starBox) && !winAlertShown) {
        winPopup.style.display = 'block'; // Mostrar el pop-up
        winAlertShown = true; // Marca que el pop-up ya se ha mostrado

        // Pausar el juego
        cancelAnimationFrame(animationID); // Detener la actualización del bucle de animación
    }
}

let gameOverPopupShown = false; // Variable para controlar si el popup de "Perdiste" ya se ha mostrado

function showGameOverPopup() {
    if (!gameOverPopupShown) {
        document.getElementById('container-popup-lose').style.display = 'block';
        gameOverPopupShown = true; // Marcar que el popup ya se ha mostrado
    }
}


function jump() {
    if (gameOver) return; // Si el juego ha terminado, no permitir saltar
    if (!jumping) { // Verifica si el cubo no está ya en medio de un salto
        velocity = 0.25; // Reducimos la velocidad inicial hacia arriba para un salto más pequeño
        jumping = true; // Marca que el cubo está en medio de un salto
    }
}

function moveLeft() {
    if (gameOver) return; // Si el juego ha terminado, no ejecutar el movimiento
    const newPosition = player.position.x - 0.14; // Calcula la nueva posición X del cubo al moverlo a la izquierda
    if (newPosition >= -10) { // Verifica si el cubo no se saldrá del límite izquierdo de la pantalla
        player.position.x = newPosition; // Actualiza la posición X del cubo
    } else {
        player.position.x = -10; // Establece la posición X en el límite izquierdo si el movimiento excede el límite
    }
}

function moveRight() {
    if (gameOver) return; // Si el juego ha terminado, no ejecutar el movimiento
    const newPosition = player.position.x + 0.14; // Calcula la nueva posición X del cubo al moverlo a la derecha
    if (newPosition <= 10) { // Verifica si el cubo no se saldrá del límite derecho de la pantalla
        player.position.x = newPosition; // Actualiza la posición X del cubo
    } else {
        player.position.x = 10; // Establece la posición X en el límite derecho si el movimiento excede el límite
    }
}

function render() {
    renderer.render(scene, camera);
}

function resetGame() {
    // Reiniciar la variable de control de alerta de victoria
    winAlertShown = false;

    // Reactivar la actualización del bucle de animación
    animate();
}

let animationID;

function animate() {
    animationID = requestAnimationFrame(animate); // Almacenar el ID de la animación

    update();

    TWEEN.update(); // Actualizamos las animaciones Tween.js

    updateCamera(); // Actualizamos la posición de la cámara

    checkWin(); // Verificamos si el jugador ganó

    render();
}

// Event listener para detectar la pulsación de la barra espaciadora
document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') { // Verifica si se ha pulsado la barra espaciadora
        jump(); // Llama a la función de salto
    } else if (event.code === 'KeyA') { // Verifica si se ha pulsado la tecla A
        moveLeft(); // Llama a la función para mover el cubo a la izquierda
    } else if (event.code === 'KeyD') { // Verifica si se ha pulsado la tecla D
        moveRight(); // Llama a la función para mover el cubo a la derecha
    }
});

// Variables para almacenar las coordenadas táctiles iniciales
let touchStartX = 0;
let touchStartY = 0;

// Factor de escala para ajustar la velocidad de movimiento
const movementScaleFactor = 0.25; // Puedes ajustar este valor según tu preferencia

// Evento touchstart
document.addEventListener('touchstart', function (event) {
    // Obtener las coordenadas táctiles iniciales
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

// Evento touchmove
document.addEventListener('touchmove', function (event) {
    // Obtener las coordenadas táctiles actuales
    const touchCurrentX = event.touches[0].clientX;
    const touchCurrentY = event.touches[0].clientY;

    // Calcular la distancia horizontal y vertical desplazada
    const deltaX = (touchCurrentX - touchStartX) * movementScaleFactor; // Ajustar la velocidad horizontal
    const deltaY = touchCurrentY - touchStartY;

    // Determinar si el movimiento es horizontal o vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Movimiento horizontal
        if (deltaX > 0) {
            // Desplazamiento hacia la derecha
            moveRight();
        } else {
            // Desplazamiento hacia la izquierda
            moveLeft();
        }
    } else {
        // Movimiento vertical
        if (deltaY < -10) {
            // Desplazamiento hacia arriba (saltar)
            jump();
        }
    }

    // Actualizar las coordenadas táctiles iniciales para el siguiente evento
    touchStartX = touchCurrentX;
    touchStartY = touchCurrentY;
});


window.onload = init;
