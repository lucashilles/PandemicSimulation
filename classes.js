const STATUS = { "Susceptible": "#5fc1cf", "Infected": "#f5644f", "Removed": "#505050", "Dead": "#505050" };
Object.freeze(STATUS);

class LehmerRng {
    a = 16807;
    m = 2147483647;
    q = 127773;
    r = 2836;
    seed;
    constructor(seed) {
        if (seed <= 0 || seed == Number.MAX_SAFE_INTEGER)
            throw new Exception("Bad seed");
        this.seed = seed;
    }
    Next() {
        let hi = this.seed / this.q;
        let lo = this.seed % this.q;
        this.seed = (this.a * lo) - (this.r * hi);
        if (this.seed <= 0)
            this.seed = this.seed + this.m;
        return (this.seed * 1.0) / this.m;
    }
}

class GraphData {
    constructor(susceptible, infected, removed, dead) {
        this.susceptible = susceptible;
        this.infected = infected;
        this.removed = removed;
        this.dead = dead;
    }
}

class Person {
    direction = randomGen.Next() * 2 * Math.PI;
    state = "Susceptible"
    auraSize = 0;
    infectionTimer = 0;

    constructor(x, y, speed, size, probDirection, probDead, maxDirectionAngle, infectionTime, infectionRadius, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.speed = speed;
        this.size = size;
        this.probDirection = probDirection;
        this.probDead = probDead;
        this.maxDirectionAngle = maxDirectionAngle;
        this.infectionTime = infectionTime;
        this.infectionRadius = infectionRadius;
    }

    update() {
        //Update cood based on direction and speed
        let dirChange = randomGen.Next() < this.probDirection ? parseFloat(((Math.random() * this.maxDirectionAngle - this.maxDirectionAngle / 2) * Math.PI / 180).toFixed(6)) : 0;
        let xChange = parseFloat((Math.cos(this.direction + dirChange) * this.speed).toFixed(6));
        let yChange = parseFloat((Math.sin(this.direction + dirChange) * this.speed).toFixed(6));

        if (this.x + xChange < 0 || this.x + xChange > ctx.canvas.clientWidth) xChange *= -1;
        if (this.y + yChange < 0 || this.y + yChange > ctx.canvas.clientHeight) yChange *= -1;

        this.direction = parseFloat((Math.atan2(yChange, xChange)).toFixed(6));

        this.x += xChange;
        this.y += yChange;

        if (this.state == "Infected") {
            this.auraSize = this.auraSize > this.infectionRadius * this.size ? 0 : this.auraSize + 0.5;
            if (Date.now() - this.infectionTimer > this.infectionTime)
                this.state = Math.random() < this.probDead ? "Dead" : "Removed";
        }
    }

    show(ctx) {
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = STATUS[this.state];
        this.ctx.strokeStyle = STATUS[this.state];
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        if (this.state == "Dead") this.ctx.stroke();
        else this.ctx.fill();

        if (this.state == "Infected") {
            this.ctx.strokeStyle = STATUS[this.state];
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.auraSize, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    infect() {
        this.state = "Infected";
        this.infectionTimer = Date.now();
    }
}