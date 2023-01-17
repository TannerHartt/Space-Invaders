function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * This function calculates the distance between two objects using pythagorean theorem.
 * Pass in the center of the object for best results.
 * @param x1 Object 1 x position.
 * @param y1 Object 1 y position.
 * @param x2 Object 2 x position.
 * @param y2 Object 2 y position.
 * @returns {number} // The distance between the two objects.
 */
function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

addEventListener('keydown', ({ key }) => {
  if (game.over) return;

  switch (key) {
    case 'a':
          keys.a.pressed = true;
          break;
    case 'd':
      keys.d.pressed = true;
      break;
    case ' ':
        keys.space.pressed = true;
        if (player.powerUp === 'MachineGun') return;

        audio.shoot.play();
        projectiles.push(
              new Projectile({
                    position: {
                      x: player.position.x + player.width / 2,
                      y: player.position.y
                    },
                    velocity: {
                      x: 0,
                      y: -8
                    }
              })
        );
      break;
  }
});

addEventListener('keyup', ({ key }) => {
  switch (key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;
  }
});

startButton.addEventListener('click', () => {
    audio.backgroundMusic.play();
    audio.select.play();
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('startMenu').style.userSelect = 'none';
    init();
    spawnBackgroundStars();
    animate();
});

restartButton.addEventListener('click', () => {
    document.querySelector('#endGameMenu').style.display = 'none';
    document.getElementById('endGameMenu').style.userSelect = 'none';
    scoreEl.style.display = 'block';
    audio.select.play();
    init();
    spawnBackgroundStars();
    animate();
});

/**
 * This function is responsible for spawning the background stars on the canvas.
 */
function spawnBackgroundStars() {
  for (let i = 0; i < 100; i++) {
    particles.push(
        new Particle({
          position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
          },
          velocity: {
            x: 0,
            y: 0.4
          },
          radius: Math.random() * 2,
          color: 'white'
        })
    );
  }
}

/**
 * This function creates a particle effect at a target object's location and with a random x and y velocity.
 * @param object Target object to spawn the particles at.
 * @param color Desired color for the particles default is light pink.
 * @param fades Boolean value that determines if the particles are to fade out.
 */
function createParticles({ object, color, fades }) {
  for (let i = 0; i < 15; i++) {
    particles.push(
        new Particle({
          position: {
            x: object.position.x + object.width / 2,
            y: object.position.y + object.height / 2
          },
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
          },
          radius: Math.random() * 3,
          color: color || '#BAA0DE',
          fades: fades
        })
    );
  }
}

/**
 * This function is used to dynamically create score labels at the passed object's location and
 * add them to the DOM. It applies necessary styles and then animates the label to fade away.
 * After animation is complete, it removes it from the DOM (Garbage collection).
 * @param score A desired score to apply to the label, default is 100.
 * @param object The object you want to place the label on.
 */
function createScoreLabel({ score = '100', object }) {
    const scoreLabel = document.createElement('label'); // Create element
    scoreLabel.innerHTML = score; // Update score on template
    scoreLabel.style.position = 'absolute';
    scoreLabel.style.color = 'white'; // White text
    scoreLabel.style.top = object.position.y + 'px'; // Object's y position
    scoreLabel.style.left = object.position.x + 'px'; // Object's x position
    scoreLabel.style.userSelect = 'none'; // Non-selectable
    document.querySelector('#parentDiv').appendChild(scoreLabel); // Append it to the DOM

    gsap.to(scoreLabel, { // Animating label
        opacity: 0,
        y: -30,
        duration: .75,
        onComplete: () => {
            document.querySelector('#parentDiv').removeChild(scoreLabel); // Remove it from the DOM
        }
    });
}

/**
 * This function handles the calculation of circle object to circle object collisions.
 * It takes in two circle objects and a radius of the first circle.
 * Both objects must have an x and y coordinates and a radius value
 * @param circle1 First circle object
 * @param circle2 Second circle object
 * @param circle1Radius Optional circle value for if the first circle object doesn't have a radius property.
 */
function checkCircleToCircleCollision({ circle1, circle2, circle1Radius = circle1.radius }) {
    return (
        Math.hypot(
        circle1.position.x - circle2.position.x,
        circle1.position.y - circle2.position.y) < circle1Radius + circle2.radius)
}

/**
 * This function handles the calculation for collision detection between two rectangle objects.
 * Both objects must have an x and y coordinate and height and width properties.
 * @param rectangle1 First rectangle object
 * @param rectangle2 Second rectangle object
 * @returns {boolean} Returns true if there's a collision, false otherwise.
 */
function checkRectangularCollision({ rectangle1, rectangle2 }) {
 return (rectangle1.position.y + rectangle1.height >= rectangle2.position.y
     && rectangle1.position.x + rectangle1.width >= rectangle2.position.x
     && rectangle1.position.x <= rectangle2.position.x + rectangle2.width)
}

/**
 * This function checks collisions between a circle and a rectangle object.
 * @param circle Circle object that must contain an x and y coordinates and a radius.
 * @param rectangle Rectangle object that must have x and y coordinates and height and width properties.
 * @returns {boolean} Returns true if there's a collision, false otherwise.
 */
function checkCircleToRectangleCollision({ circle, rectangle }) {
    return (circle.position.y - circle.radius <= rectangle.position.y + rectangle.height
        && circle.position.x + circle.radius >= rectangle.position.x
        && circle.position.x - circle.radius <= rectangle.position.x + rectangle.width
        && circle.position.y + circle.radius >= rectangle.position.y)
}

/**
 * This function ends the game, removes the player and creates particle effects.
 */
function endGame() {
    console.log('you lose');
    // audio.gameOver.play();

    // Makes player disappear
    setTimeout(() => {
        player.opacity = 0;
        game.over = true;
    }, 0);

    // stops game computation
    setTimeout(() => {
        game.active = false;
        document.getElementById('endGameMenu').style.display = 'flex';
        document.querySelector('.gameOverScore').innerHTML = score;
        scoreEl.style.display = 'none';
    }, 2000);

    createParticles({
        object: player,
        color: 'white',
        fades: true
    });
}
