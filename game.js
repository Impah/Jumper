import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js'; // Importa Tween.js para las animaciones

let camera, scene, renderer;
let player, platforms, coins, star;
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
    scene.add(player);


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

    // Agregar plataformas y monedas
    const platformGeometry = new THREE.BoxGeometry(5, 0.2, 5);
    const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const coinGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const coinMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    let lastPlatform;

    for (let i = 1; i <= 20; i++) {
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, i * 2.3, 0); // Posiciones de ejemplo, puedes ajustarlas según tus necesidades

        if (i === 20) {
            lastPlatform = platform;
        }

        const numCoins = Math.floor(Math.random() * 3) + 1; // Entre 1 y 3 monedas por plataforma
        for (let j = 0; j < numCoins; j++) {
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            coin.position.set(Math.random() * 6 - 2, i * 2.3 + 1, 0); // Posición aleatoria encima de la plataforma
            coins.add(coin);
        }

        // Creamos una animación Tween.js para hacer que la plataforma se mueva de un lado a otro
        const platformMovement = new TWEEN.Tween(platform.position)
            .to({ x: Math.random() > 0.5 ? 5 : -5 }, 1600) // Mueve la plataforma a una posición aleatoria a la derecha o izquierda
            .easing(TWEEN.Easing.Quadratic.InOut) // Aplica una función de easing para suavizar la animación
            .yoyo(true) // Hace que la animación se invierta automáticamente después de completarse
            .repeat(Infinity) // Hace que la animación se repita infinitamente
            .delay(Math.random() * 2000) // Agrega un pequeño retraso aleatorio para cada plataforma
            .start(); // Inicia la animación

        platforms.add(platform);
    }

    // Crear estrella gigante
    const starGeometry = new THREE.BoxGeometry(2, 2, 2);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.copy(lastPlatform.position); // Colocar la estrella en la posición de la última plataforma
    star.position.y += 4; // Elevar la estrella para que esté encima de la última plataforma
    scene.add(star);

    // Se reinicia el juego cuando ganas
document.getElementById('reset-button').addEventListener('click', function () {
    // Reiniciar el puntaje a cero
    score = 0;
    document.getElementById('points').textContent = score;

    // Eliminar todas las monedas restantes
    coins.children = [];

    // Reiniciar la posición del jugador
    player.position.set(0, 0.5, 0);

    // Reiniciar la posición de las plataformas
    platforms.children.forEach(platform => {
        platform.position.x = 0; // Reiniciar posición en el eje X
    });

    // Volver a generar las monedas
    for (let i = 1; i <= 20; i++) { // Suponiendo que hay 5 plataformas en total
        const numCoins = Math.floor(Math.random() * 3) + 1; // Entre 1 y 3 monedas por plataforma
        for (let j = 0; j < numCoins; j++) {
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            const platformIndex = Math.floor(Math.random() * platforms.children.length);
            const platform = platforms.children[platformIndex];
            coin.position.set(Math.random() * 6 - 2, platform.position.y + 1, 0); // Posición aleatoria encima de la plataforma
            coins.add(coin);
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
        player.position.set(0, 0.5, 0);

        // Reiniciar la posición de las plataformas
        platforms.children.forEach(platform => {
            platform.position.x = 0; // Reiniciar posición en el eje X
        });

        // Volver a generar las monedas
        for (let i = 1; i <= 20; i++) { // Suponiendo que hay 5 plataformas en total
            const numCoins = Math.floor(Math.random() * 3) + 1; // Entre 1 y 3 monedas por plataforma
            for (let j = 0; j < numCoins; j++) {
                const coin = new THREE.Mesh(coinGeometry, coinMaterial);
                const platformIndex = Math.floor(Math.random() * platforms.children.length);
                const platform = platforms.children[platformIndex];
                coin.position.set(Math.random() * 6 - 2, platform.position.y + 1, 0); // Posición aleatoria encima de la plataforma
                coins.add(coin);
            }
        }

        // Ocultar el pop-up de "Ganaste"
        document.getElementById('container-popup-lose').style.display = 'none';

        gameOverPopupShown = false; // Variable para controlar si el popup de "Perdiste" ya se ha mostrado
        gameOver = false; // Variable global para seguir el estado del juego
    });



    animate();
}


function handleCoinCollision() {
    const playerBottomY = player.position.y - 0.5;
    const playerTopY = player.position.y + 0.5;
    const playerLeftX = player.position.x - 0.5;
    const playerRightX = player.position.x + 0.5;

    coins.children.forEach(coin => {
        const coinBottomY = coin.position.y - 0.25;
        const coinTopY = coin.position.y + 0.25;
        const coinLeftX = coin.position.x - 0.25;
        const coinRightX = coin.position.x + 0.25;

        if (playerTopY >= coinBottomY && playerBottomY <= coinTopY &&
            playerRightX >= coinLeftX && playerLeftX <= coinRightX) {
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
            const playerBottomY = player.position.y - 0.5;
            const playerTopY = player.position.y + 0.5;
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
            player.position.y = lowestPlatform.position.y + 0.6; // Posiciona el cubo en la plataforma
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

function checkWin() {
    const playerBox = new THREE.Box3().setFromObject(player);
    const starBox = new THREE.Box3().setFromObject(star);

    document.getElementById('total-score').textContent = score;

    if (playerBox.intersectsBox(starBox) && !winAlertShown) {
        winPopup.style.display = 'block'; // Mostrar el pop-up
        winAlertShown = true; // Marca que el pop-up ya se ha mostrado
        
        // Pausar el juego
        cancelAnimationFrame(animationID); // Detener la actualización del bucle de animación
        document.removeEventListener('keydown', handleKeyDown); // Desactivar el event listener del teclado
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

    // Reactivar el event listener del teclado
    document.addEventListener('keydown', handleKeyDown);
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
document.addEventListener('touchstart', function(event) {
    // Obtener las coordenadas táctiles iniciales
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

// Evento touchmove
document.addEventListener('touchmove', function(event) {
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

// Evento touchend
document.addEventListener('touchend', function(event) {
    // Aquí puedes agregar lógica adicional si lo necesitas
});





window.onload = init;
