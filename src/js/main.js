const canvas = document.querySelector('canvas');
const scoreEl = document.getElementById('scoreEl');
const c = canvas.getContext('2d');

// Implementation
let projectiles = [];
let invaderProjectiles = [];
let particles = [];
const player = new Player();
const grids = [];
let frames = 0;
let randomInterval = Math.floor((Math.random() * 500) + 500);
let game = {
    over: false,
    active: true
}
let score = 0;

canvas.width = 1024;
canvas.height = 576;

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
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

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

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

// Animation Loop
function animate() {
    // If the game is not active, return immediately and do not animate.
    if (!game.active) return;

    requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    //
    particles.forEach((particle, particleIndex) => {

        // If background star particles reach the bottom of the screen.
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width; // Move them to a new random x position.
            particle.position.y = -particle.radius; // And at the top of the screen just before it enters vision.
        }

        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(particleIndex, 1);
            }, 0);
        } else {
            particle.update();
        }
    });

    invaderProjectiles.forEach((invaderProjectile, index) => {
        // If invader projectile leaves the screen, remove it from computation.
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        } else {
            invaderProjectile.update();
        }

        // Game over, enemy projectile hits player.
        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y
            && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width) {

            // Removes the player after being hit and triggers the end game sequence.
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
            }, 0);

            // Continue execution for 2 seconds after the game ends.
            setTimeout(() => {
                game.active = false;
            }, 2000);
            createParticles({object: player, color: 'white', fades: true});
        }
    });


    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        } else {
            projectile.update();
        }
    });

    grids.forEach((grid, gridIndex) => {
        grid.update();
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }
        grid.invaders.forEach((invader, invaderIndex) => {
            invader.update({velocity: grid.velocity});

            // Projectiles hit invader.
            projectiles.forEach((projectile, projectileIndex) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height
                    && projectile.position.x + projectile.radius >= invader.position.x
                    && projectile.position.x - projectile.radius <= invader.position.x + invader.width
                    && projectile.position.y + projectile.radius >= invader.position.y) {

                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(
                            (invader2) => invader2 === invader
                        );


                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 === projectile
                        );

                        // Removing invaders and projectiles when they collide
                        if (invaderFound && projectileFound) {
                            score += 100;
                            scoreEl.innerHTML = score;

                            // Create dynamic score labels
                            const scoreLabel = document.createElement('label');
                            scoreLabel.innerHTML = '100';
                            scoreLabel.style.position = 'absolute';
                            scoreLabel.style.color = 'white';
                            scoreLabel.style.top = invader.position.y + 'px';
                            scoreLabel.style.left = invader.position.x + 'px';
                            scoreLabel.style.userSelect = 'none';
                            document.querySelector('#parentDiv').appendChild(scoreLabel);

                            gsap.to(scoreLabel, { // Animating label
                                opacity: 0,
                                y: -30,
                                duration: .75,
                                onComplete: () => {
                                    document.querySelector('#parentDiv').removeChild(scoreLabel);
                                }
                            });

                            createParticles({object: invader, fades: true}); // Creates particles when an invader is hit.

                            grid.invaders.splice(invaderIndex, 1); // Remove the invader from the array when a
                            projectiles.splice(projectileIndex, 1);

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]; // Grabs the left most invader.
                                const lastInvader = grid.invaders[grid.invaders.length - 1]; // Grabs the right most invader.

                                // Adjusts the right side of each invader grid to account for invaders being removed.
                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                // Adjusts the left side of each invader grid to account for invaders being removed.
                                grid.position.x = firstInvader.position.x;
                            } else {
                                // Garbage collection on empty invader grids.
                                grids.splice(gridIndex, 1);
                            }
                        }
                    }, 0);
                }
            });
        });
    });

    if (keys.a.pressed && player.position.x > 0) {
        player.velocity.x = -5;
        player.rotation = -0.15;
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5;
        player.rotation = 0.15;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    // Spawning invader grids randomly
    if (frames % randomInterval === 0) {
        grids.push(new Grid());
        randomInterval = Math.floor((Math.random() * 500) + 500);
    }
    frames++;
}

spawnBackgroundStars();
animate();
