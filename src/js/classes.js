class Player {
    constructor() {
        const image = new Image();
        image.src = './img/spaceship.png';
        image.onload = () => {
            const playerScale = 0.15;
            this.image = image;
            this.width = image.width * playerScale;
            this.height = image.height * playerScale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 30
            }
        }

        this.velocity = {
            x: 0,
            y: 0
        }
        this.rotation = 0;
        this.opacity = 1;
        this.powerUp = '';
        this.particles = [];
        this.frames = 0;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
        c.rotate(this.rotation);
        c.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        c.restore();
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
        }

        if (this.opacity !== 1) return
        this.frames++;
        if (this.frames % 3 === 0 && !game.over) {
            this.particles.push(
                new Particle({
                    position: {
                        x: this.position.x + this.width / 2,
                        y: this.position.y + this.height
                    },
                    velocity: {
                        x: (Math.random() - 0.5) * 1.5,
                        y: 1.4
                    },
                    radius: Math.random() * 2,
                    color: 'white',
                    fades: true
                })
            );
        }
    }
}

class Projectile {
    constructor({ position, velocity, color = 'red' }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 4;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    static radius = 15;
    constructor({ position }) {
        const image = new Image();
        image.src = './img/invader.png';
        image.onload = () => {
            const playerScale = 1;
            this.image = image;
            this.width = image.width * playerScale;
            this.height = image.height * playerScale;
            this.position = {
                x: position.x,
                y: position.y
            }
        }

        this.velocity = {
            x: 0,
            y: 0
        }
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update({ velocity }) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(
            new InvaderProjectile({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                velocity: {
                    x: 0,
                    y: 5
                }
            })
        );
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        };
        this.velocity = {
            x: 2,
            y: 0
        };
        this.invaders = [];

        const rows = Math.floor(Math.random() * 5 + 2);
        const columns = Math.floor(Math.random() * 15 + 5);

        this.width = columns * 30;

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {

                this.invaders.push(
                    new Invader({
                        position: {
                            x: x * 30,
                            y: y * 30
                        }
                    }));
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0;

        // Screen boundary collision detection.
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x * 1.10; // 1.10 makes the enemies more progressively faster.

            this.velocity.y += 30;
        }
    }
}

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.fillStyle = 'white';
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.fades) {
            this.opacity -= 0.01;
        }
    }
}

class Bomb {
    static radius = 30;
    constructor({ position, velocity, color = 'red' }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 0;
        this.color = color;
        this.opacity = 1;
        this.active = false;

        gsap.to(this, {
           radius: 30
        });
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath()
        c.restore();
    }

    update() {
        this.draw();

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x + this.radius + this.velocity.x >= canvas.width || this.position.x - this.radius + this.velocity.x <= 0) {
            this.velocity.x = -this.velocity.x;
        } else if (this.position.y + this.radius + this.velocity.y >= canvas.height || this.position.y - this.radius + this.velocity.y <= 0) {
            this.velocity.y = -this.velocity.y;
        }
    }

    explode() {
        this.active = true;
        this.velocity.x = 0;
        this.velocity.y = 0;

        gsap.to(this, {
            radius: 170,
            color: 'white',
        });

        gsap.to(this, {
            delay: .1,
            opacity: 0,
            duration: .15
        });
    }
}

class PowerUp {
    static radius = 15;
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

