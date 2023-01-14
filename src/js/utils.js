function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomHue() {
  return `hsl(${Math.random()}, 50%, 50%)`;
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}


// Event Listeners
addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
});

addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

});


addEventListener('keydown', ({key}) => {
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

addEventListener('keyup', ({key}) => {
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

function createParticles({object, color, fades}) {
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

function createScoreLabel({ score = '100', object }) {
    const scoreLabel = document.createElement('label');
    scoreLabel.innerHTML = score;
    scoreLabel.style.position = 'absolute';
    scoreLabel.style.color = 'white';
    scoreLabel.style.top = object.position.y + 'px';
    scoreLabel.style.left = object.position.x + 'px';
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
