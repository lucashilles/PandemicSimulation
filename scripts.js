const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let people = [];
let removedPeople = [];
let healthy = 100;
for (let i = 0; i < healthy; i++) {
    people.push(new Person(Math.random() * canvas.clientWidth, Math.random() * canvas.clientHeight, ctx));
}
people[0].infect();
healthy--;

function distBetween(person1, person2) {
    return Math.sqrt(Math.pow(person1.x - person2.x, 2) + Math.pow(person1.y - person2.y, 2))
}

//Update people data
function update() {
    people.forEach(person => {
        person.update();
    });
    removedPeople.forEach(removedPerson => {
        if (removedPerson.state != "Dead") removedPerson.update();
    });

    people.forEach((person1, index) => {
        if (person1.state == "Infected") {
            people.forEach(person2 => {
                if (person2.state == "Susceptible"
                    && distBetween(person1, person2) < 3 * person1.size
                    && Math.random() < 0.2) {
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
}

//Game Loop
function loop() {
    update();
    render();
}

let loopInterval = setInterval(loop, 32);