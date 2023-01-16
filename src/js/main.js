const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreEl');

// Implementation
let projectiles = [];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
let powerUps = [];
const player = new Player();
let grids = [];
let frames = 0;
let randomInterval = Math.floor((Math.random() * 500) + 500);
let game = {
    over: false,
    active: true
}
let score = 0;
let spawnInterval = 500;

canvas.width = 1024;
canvas.height = 576;


let keys = {
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

function init() { // Initialization, reset all game variables.
    projectiles = [];
    invaderProjectiles = [];
    particles = [];
    bombs = [];
    powerUps = [];
    grids = [];
    score = 0;
    frames = 0;
    randomInterval = Math.floor((Math.random() * 500) + 500);

    keys = {
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

    game = {
        over: false,
        active: true
    }
}


// Animation Loop
function animate() {
    // If the game is not active, return immediately and do not animate.
    if (!game.active) return;

    requestAnimationFrame(animate); // Begin animation
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Spawns bombs
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
        );
    }

    // Spawns power ups
    if (frames % 500 === 0) {
        powerUps.push(
            new PowerUp({
                position: {
                    x: 0,
                    y: Math.random() * 300 + PowerUp.radius
                },
                velocity: {
                    x: 4,
                    y: 0
                }
            })
        );
    }

    // Rendering power ups on screen
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];

        // Power up garbage collection
        if (powerUp.position.x - powerUp.radius >= canvas.width) {
            powerUps.splice(i ,1); // Remove from computation
        } else {
            powerUp.update(); // Animate power up
        }
    }

    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];

        if (bomb.opacity <= 0) {
            bombs.splice(i, 1);
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
        if (checkRectangularCollision({ rectangle1: invaderProjectile, rectangle2: player }))
        {
            invaderProjectiles.splice(index, 1);
            endGame();
        }
    });

    // Looping through all projectiles to track collisions
    for (let index = projectiles.length - 1; index >= 0; index--) {
        const projectile = projectiles[index]; // Individual projectile

        for (let bombIndex = bombs.length - 1; bombIndex >= 0; bombIndex--) {
            const bomb = bombs[bombIndex];

            // If projectile touches bomb
            if (checkCircleToCircleCollision({
                circle1: projectile,
                circle2: bomb,
                circle1Radius: projectile.radius
            }) && !bomb.active) {

                projectiles.splice(index, 1);
                bomb.explode();
            }
        }


        for (let j = powerUps.length - 1; j >= 0; j--) {
            const powerUp = powerUps[j];

            // If projectile hits power up object
            if (checkCircleToCircleCollision({
                circle1: projectile,
                circle2: powerUp,
                circle1Radius: projectile.radius
            })
            ){
                projectiles.splice(index, 1); // Remove the projectile from the game
                powerUps.splice(j, 1); // Remove the power up from the game
                player.powerUp = 'MachineGun'; // Give player power up

                setTimeout(() => {
                   player.powerUp = ''; // Reset power up property
                }, 5000); // After 4s
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

            invader.update({ velocity: grid.velocity });

            // Looping through all bombs to track collisions with invaders and projectiles.
            for (let bombIndex = bombs.length - 1; bombIndex >= 0; bombIndex--) {
                const bomb = bombs[bombIndex];
                const invaderRadius = 15;

                // If bomb touches' invader, remove invader.
                if (Math.hypot(
                    invader.position.x - bomb.position.x,
                    invader.position.y - bomb.position.y) < invaderRadius + bomb.radius
                    && bomb.active
                ) {
                    score += 50;
                    scoreEl.innerHTML = score;
                    grid.invaders.splice(invaderIndex, 1);
                    createScoreLabel({ object: invader, score: 50 });
                    createParticles({ object: invader, fades: true });
                }
            }

            // Projectiles hit invader.
            projectiles.forEach((projectile, projectileIndex) => {
                // If projectile hits invader
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
                            createScoreLabel({ object: invader });
                            createParticles({ object: invader, fades: true }); // Creates particles when an invader is hit.

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

            // Remove player if invader touches
            if (checkRectangularCollision({ rectangle1: invader, rectangle2: player }) && !game.over)
            {
                endGame();
            }
        } // End of invader grid loop
    });

    // Controls player side-to-side movement and animation
    if (keys.a.pressed && player.position.x > 0) {
        player.velocity.x = -5; // Move player left
        player.rotation = -0.15; // Slight rotation left
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5; // Move player right
        player.rotation = 0.15; // Slight rotation right
    } else {
        player.velocity.x = 0; // No movement
        player.rotation = 0; // No rotation
    }

    // Spawning invader grids randomly
    if (frames % randomInterval === 0) {
        spawnInterval = spawnInterval < 0 ? 100 : spawnInterval;
        grids.push(new Grid()); // Create new grid of invaders
        randomInterval = Math.floor((Math.random() * 500) + spawnInterval); // Set the next random interval
        frames = 0;
        spawnInterval -= 100;
    }

    // TODO fix bug where power up is always active.
    // Verified
    if (keys.space.pressed && player.powerUp === 'MachineGun' && frames % 3 === 0 && !game.over) {
        projectiles.push(
            new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -8
                },
                color: 'yellow'
            })
        );
    }
    frames++;
}

init();
spawnBackgroundStars();
animate();
