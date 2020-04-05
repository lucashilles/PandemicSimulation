const STATUS = { "Susceptible": "#5fc1cf", "Infected": "#f5644f", "Removed": "#505050", "Dead": "#505050" };
Object.freeze(STATUS);

class Person {
    size = 5;
    speed = 2;
    direction = Math.random() * 2 * Math.PI;
    state = "Susceptible"
    auraSize = 0;
    infectionTimer = 0;

    constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
    }

    update() {
        //Update cood based on direction and speed
        let dirChange = Math.random() < 0.2 ? (Math.random() * 30 - 15) * Math.PI / 180 : 0;
        let xChange = Math.cos(this.direction + dirChange) * this.speed;
        let yChange = Math.sin(this.direction + dirChange) * this.speed;

        if (this.x + xChange < 0 || this.x + xChange > ctx.canvas.clientWidth) xChange *= -1;
        if (this.y + yChange < 0 || this.y + yChange > ctx.canvas.clientHeight) yChange *= -1;

        this.direction = Math.atan2(yChange, xChange);

        this.x += xChange;
        this.y += yChange;

        if (this.state == "Infected") {
            this.auraSize = this.auraSize > 3 * this.size ? 0 : this.auraSize + 0.5;
            if (Date.now() - this.infectionTimer > 3000)
                this.state = Math.random() < 0.2 ? "Dead" : "Removed";
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