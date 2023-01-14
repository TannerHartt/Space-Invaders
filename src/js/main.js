const canvas = document.querySelector('canvas');
const scoreEl = document.getElementById('scoreEl');
const c = canvas.getContext('2d');

// Implementation
let projectiles = [];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
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


// Animation Loop
function animate() {
    // If the game is not active, return immediately and do not animate.
    if (!game.active) return;

    requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    if (frames % 200 === 0 && bombs.length < 3) {
        bombs.push(
            new Bomb({
                position: {
                    x: randomIntFromRange(Bomb.radius, canvas.width - Bomb.radius),
                    y: randomIntFromRange(Bomb.radius, canvas.height - Bomb.radius)
                },
                velocity: {
                    x: (Math.random() - 0.5) * 6,
                    y: (Math.random() - 0.5) * 6
                }
            })
        )
    }

    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];

        if (bomb.opacity <= 0) {
            bombs.splice(i, 1)
        } else {
            bomb.update();
        }
    }

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


    for (let index = projectiles.length - 1; index >= 0; index--) {
        const projectile = projectiles[index]; // Individual projectile

        for (let bombIndex = bombs.length - 1; bombIndex >= 0; bombIndex--) {
            const bomb = bombs[bombIndex];

            // If bomb touches
            if (Math.hypot(projectile.position.x - bomb.position.x, projectile.position.y - bomb.position.y) < projectile.radius + bomb.radius
                && !bomb.active ) {
                projectiles.splice(index, 1);
                bomb.explode();

            }
        }

        if (projectile.position.y + projectile.radius <= 0) {
            projectiles.splice(index, 1);
        } else {
            projectile.update();
        }
    }

    grids.forEach((grid, gridIndex) => {
        grid.update();
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }

        for (let invaderIndex = grid.invaders.length - 1; invaderIndex >= 0; invaderIndex--) {
            const invader = grid.invaders[invaderIndex];

            invader.update({velocity: grid.velocity});

            // If bomb touches' invader, remove invader.
            for (let bombIndex = bombs.length - 1; bombIndex >= 0; bombIndex--) {
                const bomb = bombs[bombIndex];
                const invaderRadius = 15;

                // If bomb touches
                if (
                    Math.hypot(
                        invader.position.x - bomb.position.x,
                        invader.position.y - bomb.position.y) < invaderRadius + bomb.radius
                        && bomb.active
                ) {
                    score += 50;
                    scoreEl.innerHTML = score;
                    grid.invaders.splice(invaderIndex, 1);
                    createScoreLabel({object: invader, score: 50});
                    createParticles({object: invader, fades: true});
                }
            }

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
                            createScoreLabel({object: invader});

                            createParticles({object: invader, fades: true}); // Creates particles when an invader is hit.

                            grid.invaders.splice(invaderIndex, 1); // Remove the invader from computation
                            projectiles.splice(projectileIndex, 1); // Remove the bullet from computation

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
        }
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
