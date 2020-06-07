document.querySelector('#configSubmit').addEventListener('click', function (event) {
    event.preventDefault();
    setup();
}, false);


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const graph = document.getElementById('graph');
const graphCtx = graph.getContext('2d');

let people;
let removedPeople;
let graphTimeline;
let healthy;
let infectedCount;
let notDeadCount;
let initialTime;
let yIncrement;
let loopInterval;

// Person Config
let speed;
let size;
let probDirection;
let probInfection;
let probDead;
let maxDirectionAngle;
let infectionTime;
let infectionRadius;

let randomGen;

function distBetween(person1, person2) {
    return parseFloat(Math.sqrt(Math.pow(person1.x - person2.x, 2) + Math.pow(person1.y - person2.y, 2))).toFixed(8)
}

function setup() {
    randomGen = new LehmerRng(12345);
    people = [];
    removedPeople = [];
    graphTimeline = [];
    healthy = document.querySelector('#peopleQuantity').value = '' ? 100 : parseFloat(document.querySelector('#peopleQuantity').value);
    infectedCount = 0;
    notDeadCount = 0;
    initialTime = 0;
    yIncrement = graphCtx.canvas.clientHeight / healthy;

    // Person Config
    speed = document.querySelector('#speed').value = '' ? 2 : parseFloat(document.querySelector('#speed').value);
    size = document.querySelector('#size').value = '' ? 5 : parseFloat(document.querySelector('#size').value);
    probDirection = document.querySelector('#probDirection').value = '' ? 0.2 : parseFloat(document.querySelector('#probDirection').value);
    probInfection = document.querySelector('#probInfection').value = '' ? 0.2 : parseFloat(document.querySelector('#probInfection').value);
    probDead = document.querySelector('#probDead').value = '' ? 0.2 : parseFloat(document.querySelector('#probDead').value);
    maxDirectionAngle = document.querySelector('#maxDirectionAngle').value = '' ? 30 : parseFloat(document.querySelector('#maxDirectionAngle').value);
    infectionTime = document.querySelector('#infectionTime').value = '' ? 3000 : parseFloat(document.querySelector('#infectionTime').value);
    infectionRadius = document.querySelector('#infectionRadius').value = '' ? 3 : parseFloat(document.querySelector('#infectionRadius').value);

    for (let i = 0; i < healthy; i++) {
        people.push(
            new Person(
                randomGen.Next() * canvas.clientWidth,
                randomGen.Next() * canvas.clientHeight,
                speed,
                size,
                probDirection,
                probDead,
                maxDirectionAngle,
                infectionTime,
                infectionRadius,
                ctx
            )
        );
    }
    people[0].infect();
    healthy--;

    if (loopInterval != null) clearInterval(loopInterval);
    loopInterval = setInterval(loop, 32);
}

//Update people data
function update() {
    infectedCount = 0;
    notDeadCount = 0;
    people.forEach(person => {
        person.update();
    });
    removedPeople.forEach(removedPerson => {
        if (removedPerson.state != "Dead") {
            removedPerson.update();
            notDeadCount++;
        }
    });

    people.forEach((person1, index) => {

        if (person1.state == "Infected") {
            infectedCount++;
            people.forEach(person2 => {
                if (person2.state == "Susceptible"
                    && distBetween(person1, person2) < infectionRadius * person1.size
                    && randomGen.Next() < probInfection) {
                    person2.infect();
                    healthy--;
                }
            });
        }
        if (person1.state == "Removed" || person1.state == "Dead") {
            people.splice(index, 1);
            removedPeople.push(person1);
        }
    });

    // Update graph
    if (Date.now() - initialTime >= 1000 && infectedCount > 0) {
        graphTimeline.push(
            new GraphData(
                healthy,
                infectedCount,
                removedPeople.length,
                removedPeople.length - notDeadCount,
            )
        );
    }
}

//Render people
function render() {
    // Clear canvas before draw
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    removedPeople.forEach(el => {
        el.show();
    });
    people.forEach(el => {
        el.show();
    });

    ctx.fillStyle = "white";
    ctx.font = '10px sans-serif';
    ctx.fillText('Healthy: ' + healthy, 15, 15);

    // Render graph
    if (Date.now() - initialTime >= 1000) {
        graphCtx.clearRect(0, 0, graph.clientWidth, graph.clientHeight);

        let xIncrement = graphCtx.canvas.clientWidth / (graphTimeline.length - 1);
        let xCoor = 0;

        //Infected line
        graphCtx.beginPath();
        graphCtx.moveTo(0, graphCtx.canvas.clientHeight);
        //graph.lineTo(150, 60);
        graphTimeline.forEach(
            el => {
                graphCtx.lineTo(xCoor, graphCtx.canvas.clientHeight - (el.infected * yIncrement));
                xCoor += xIncrement
            }
        );
        graphCtx.lineTo(xCoor, graphCtx.canvas.clientHeight);
        graphCtx.closePath();
        graphCtx.fillStyle = STATUS["Infected"];
        graphCtx.fill();

        xCoor = 0;
        //Removed line
        graphCtx.beginPath();
        graphCtx.moveTo(0, 0);
        //graph.lineTo(150, 60);
        graphTimeline.forEach(
            el => {
                graphCtx.lineTo(xCoor, (el.removed * yIncrement));
                xCoor += xIncrement
            }
        );
        graphCtx.lineTo(xCoor, 0);
        graphCtx.closePath();
        graphCtx.fillStyle = STATUS["Removed"];
        graphCtx.fill();

        xCoor = 0;
        //Dead line
        graphCtx.beginPath();
        graphCtx.moveTo(0, 0);
        //graph.lineTo(150, 60);
        graphTimeline.forEach(
            el => {
                graphCtx.lineTo(xCoor, (el.dead * yIncrement));
                xCoor += xIncrement
            }
        );
        graphCtx.lineTo(xCoor, 0);
        graphCtx.closePath();
        graphCtx.strokeStyle = '#000';
        graphCtx.stroke();

        //Update time reference
        initialTime = Date.now();
    }
}

//Game Loop
function loop() {
    if (initialTime == 0) initialTime = Date.now();
    update();
    render();
}

//Start
setup();