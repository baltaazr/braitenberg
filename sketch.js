class Sensor {
    constructor(vehicle, motor, loc) {
        this.vehicle = vehicle
        this.motor = motor
        this.loc = loc
    }
    senseHeat() {
        let cords = this.getAbsoluteCords()
        let totalHeat = 0
        heatObjects.forEach(heatObject => {
            let d = dist(cords.x, cords.y, heatObject.cords.x, heatObject.cords.y);
            totalHeat += heatObject.intensity / Math.pow(d, 2)

        });
        return totalHeat
    }
    getAbsoluteCords() {
        let amplitude = Math.sqrt(Math.pow(this.loc.x, 2) + Math.pow(this.loc.y, 2))
        let angle = atan(this.loc.y / this.loc.x) - this.vehicle.direction
        let x, y
        if (this.loc.x > 0) {
            x = amplitude * cos(angle) + this.vehicle.cords.x
            y = amplitude * sin(angle) + this.vehicle.cords.y
        } else {

            x = -amplitude * cos(angle) + this.vehicle.cords.x
            y = -amplitude * sin(angle) + this.vehicle.cords.y
        }

        return createVector(x, y)
    }
}

class Vehicle {
    constructor(sensors, direction, cords, width, height, color) {
        sensors.forEach(sensor => {
            sensor.vehicle = this
        });
        this.sensors = sensors
        this.direction = direction
        this.cords = cords
        this.width = width
        this.height = height
        this.color = color
    }
    move() {
        let left = 0
        let right = 0
        this.sensors.forEach(sensor => {
            if (sensor.motor == 'Left') {
                left += sensor.senseHeat()
            } else if (sensor.motor == 'Right') {
                right += sensor.senseHeat()
            } else if (sensor.motor == 'Both') {
                left += sensor.senseHeat()
                right += sensor.senseHeat()
            }
        });
        left = Math.min(left, 40)
        right = Math.min(right, 40)
        let degreeChange = 0
        if (left != right) {
            let high = 0
            let low = 0
            high = Math.max(left, right)
            low = Math.min(left, right)
            let a = atan(low / this.width)
            let b = acos((Math.pow(low, 2) + Math.pow(high, 2)) / (2 * high * Math.sqrt(Math.pow(this.width, 2) + Math.pow(low, 2))))
            degreeChange = 90 - a - b
            left > right ? this.direction -= degreeChange : this.direction += degreeChange
        }
        let movement = (left + right) / 2
        this.cords.x += cos(this.direction) * movement
        this.cords.y -= sin(this.direction) * movement
        if (this.cords.x < 0) {
            this.cords.x = width * 3 / 4
        } else if (this.cords.x > width * 3 / 4) {
            this.cords.x = 0
        }
        if (this.cords.y < 0) {
            this.cords.y = height * 3 / 4
        } else if (this.cords.y > height * 3 / 4) {
            this.cords.y = 0
        }
    }
}

class HeatSource {
    constructor(cords, intensity) {
        this.cords = cords
        this.intensity = intensity
    }
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20);
    angleMode(DEGREES);
    heatObjects = []
    vehicles = []
    createMode = false
    editMode = -1
    addSensor = null
    sensorsCreate = []
    vehicleCreate = null
    createModeButton = createButton('Toggle Create Mode');
    createModeButton.position(width - 300, 10);
    createModeButton.mouseClicked(() => {
        createMode = !createMode
    });
    addVehicleButton = createButton('Add Vehicle');
    addVehicleButton.position(width - 100, 10);
    addVehicleButton.mouseClicked(() => {
        vehicles.push(vehicleCreate)
        sensorsCreate = []
    })
    heatStrengthSlider = createSlider(10000, 1000000, 10000);
    heatStrengthSlider.position(width - 300, 70);
    directionSlider = createSlider(0, 360, 0);
    directionSlider.position(width - 300, 70);
    cordsXSlider = createSlider(0, width * 3 / 4, 100);
    cordsXSlider.position(width - 300, 130);
    cordsYSlider = createSlider(0, height * 3 / 4, 75);
    cordsYSlider.position(width - 240, 130);
    widthSlider = createSlider(10, 100, 20);
    widthSlider.position(width - 300, 190);
    heightSlider = createSlider(10, 100, 50);
    heightSlider.position(width - 300, 250);
    colorRSlider = createSlider(0, 255, 255);
    colorRSlider.position(width - 300, 310);
    colorGSlider = createSlider(0, 255, 255);
    colorGSlider.position(width - 240, 310);
    colorBSlider = createSlider(0, 255, 0);
    colorBSlider.position(width - 180, 310);
    addLeftSensorButton = createButton('Add Sensor to Left Motor')
    addLeftSensorButton.position(width - 300, 350)
    addLeftSensorButton.mouseClicked(() => {
        addSensor = 'Left'
    })
    addRightSensorButton = createButton('Add Sensor to Right Motor')
    addRightSensorButton.position(width - 300, 390)
    addRightSensorButton.mouseClicked(() => {
        addSensor = 'Right'
    })
    addBothSensorButton = createButton('Add Sensor to Both Motors')
    addBothSensorButton.position(width - 300, 430)
    addBothSensorButton.mouseClicked(() => {
        addSensor = 'Both'
    })
    removeSensorButton = createButton('Remove a Sensor')
    removeSensorButton.position(width - 300, 470)
    removeSensorButton.mouseClicked(() => {
        addSensor = 'Remove'
    })
    heatObjects.push(new HeatSource(createVector(mouseX, mouseY), 10000))
    let sensors1 = [new Sensor(null, 'Right', createVector(25, -10)), new Sensor(null, 'Left', createVector(25, 10))]
    vehicles.push(new Vehicle(sensors1, 0, createVector(100, 75), 20, 50, color(66, 134, 244)))
    let sensors2 = [new Sensor(null, 'Left', createVector(25, -10)), new Sensor(null, 'Right', createVector(25, 10))]
    vehicles.push(new Vehicle(sensors2, 0, createVector(100, 150), 20, 50, color(244, 66, 66)))
}

function draw() {
    background(color(175, 175, 175))
    fill(255)
    rect(0, 0, width * 3 / 4, height * 3 / 4)
    if (!createMode && editMode == -1) {
        toggleCreate()
        vehicles.forEach(vehicle => {
            showVehicle(vehicle)
            vehicle.move()
        });
        heatObjects[0].intensity = heatStrengthSlider.value()
        if (mouseX < width * 3 / 4 && mouseY < height * 3 / 4) {
            heatObjects[0].cords.x = mouseX
            heatObjects[0].cords.y = mouseY
        }
        heatObjects.forEach(heatObject => {
            fill(255, 204, 0);
            ellipse(heatObject.cords.x, heatObject.cords.y, 10);
        });
        fill(color(175, 175, 175))
        rect(0, height * 3 / 4, width, height / 4)
        rect(width * 3 / 4, 0, width / 4, height)
        showBottomVehicles()
    } else {
        vehicleCreate = new Vehicle(sensorsCreate, directionSlider.value(), createVector(cordsXSlider.value(), cordsYSlider.value()), widthSlider.value(), heightSlider.value(), color(colorRSlider.value(), colorGSlider.value(), colorBSlider.value()))
        showVehicle(vehicleCreate)
        fill(color(175, 175, 175))
        rect(0, height * 3 / 4, width, height / 4)
        rect(width * 3 / 4, 0, width / 4, height)
        toggleCreate()
        fill(0);
        text('Direction (In Degrees): ' + directionSlider.value(), width - 300, 55);
        text('Coordinates (x,y): (' + cordsXSlider.value() + ', ' + cordsYSlider.value() + ')', width - 300, 115);
        text('Width: ' + widthSlider.value(), width - 300, 175);
        text('Height: ' + heightSlider.value(), width - 300, 235);
        text('Color (R,G,B): (' + colorRSlider.value() + ', ' + colorGSlider.value() + ', ' + colorBSlider.value() + ')', width - 300, 295);
        fill('green');
        if (addSensor === 'Left' || addSensor === 'Right' || addSensor === 'Both') {
            text('Click inside the white box \nwhere you want to add the \nsensor', width - 300, 510)
        }
        if (addSensor === 'Remove') {
            text('Click the sensor you want to remove', width - 300, 510)
        }
        showBottomVehicles()
    }
}

toggleCreate = () => {
    if (createMode) {
        addVehicleButton.show()
        directionSlider.show()
        cordsXSlider.show()
        cordsYSlider.show()
        widthSlider.show()
        heightSlider.show()
        colorRSlider.show()
        colorGSlider.show()
        colorBSlider.show()
        addLeftSensorButton.show()
        addRightSensorButton.show()
        addBothSensorButton.show()
        removeSensorButton.show()

        heatStrengthSlider.hide()
    } else {
        addVehicleButton.hide()
        directionSlider.hide()
        cordsXSlider.hide()
        cordsYSlider.hide()
        widthSlider.hide()
        heightSlider.hide()
        colorRSlider.hide()
        colorGSlider.hide()
        colorBSlider.hide()
        addLeftSensorButton.hide()
        addRightSensorButton.hide()
        addBothSensorButton.hide()
        removeSensorButton.hide()

        heatStrengthSlider.show()
    }
}

function mouseClicked() {
    if ((addSensor === 'Right' || addSensor === 'Left' || addSensor === 'Both') && mouseX < width * 3 / 4 && mouseY < height * 3 / 4) {
        let loc = createVector(mouseX - cordsXSlider.value(), mouseY - cordsYSlider.value())
        let amplitude = Math.sqrt(Math.pow(loc.x, 2) + Math.pow(loc.y, 2))
        let angle = atan(loc.y / loc.x) + directionSlider.value()
        let x, y
        if (loc.x > 0) {
            x = amplitude * cos(angle)
            y = amplitude * sin(angle)
        } else {

            x = amplitude * -cos(angle)
            y = amplitude * -sin(angle)
        }
        sensorsCreate.push(new Sensor(null, addSensor, createVector(x, y)))
        addSensor = null
    } else if (addSensor === 'Remove' && mouseX < width * 3 / 4 && mouseY < height * 3 / 4) {
        sensorsCreate.forEach((sensor, index, array) => {
            if (dist(mouseX, mouseY, sensor.getAbsoluteCords().x, sensor.getAbsoluteCords().y) <= 10) {
                array.splice(index, 1)
            }
        });
    }
}

function showVehicle(vehicle) {
    push()
    fill(vehicle.color)
    translate(vehicle.cords.x, vehicle.cords.y)
    rotate(-vehicle.direction)
    rectMode(CENTER)
    fill(51)
    rect(-vehicle.height * 3 / 8, -vehicle.width / 2, vehicle.height / 5, vehicle.width / 5)
    rect(vehicle.height * 3 / 8, -vehicle.width / 2, vehicle.height / 5, vehicle.width / 5)
    rect(-vehicle.height * 3 / 8, vehicle.width / 2, vehicle.height / 5, vehicle.width / 5)
    rect(vehicle.height * 3 / 8, vehicle.width / 2, vehicle.height / 5, vehicle.width / 5)
    fill(vehicle.color)
    rect(0, 0, vehicle.height, vehicle.width)
    fill(255)
    rect(vehicle.height * 7 / 16, -vehicle.width * 3 / 8, vehicle.height / 8, vehicle.width / 4)
    rect(vehicle.height * 7 / 16, vehicle.width * 3 / 8, vehicle.height / 8, vehicle.width / 4)
    fill('red')
    rect(-vehicle.height * 7 / 16, -vehicle.width * 3 / 8, vehicle.height / 8, vehicle.width / 4)
    rect(-vehicle.height * 7 / 16, vehicle.width * 3 / 8, vehicle.height / 8, vehicle.width / 4)
    pop()
    vehicle.sensors.forEach(sensor => {
        fill(0)
        ellipse(sensor.getAbsoluteCords().x, sensor.getAbsoluteCords().y, 10)
        push()
        stroke(color(255, 0, 0))
        if (sensor.motor == 'Right' || sensor.motor == 'Both') {
            line(sensor.getAbsoluteCords().x, sensor.getAbsoluteCords().y, vehicle.cords.x + (vehicle.width / 2) * sin(vehicle.direction), vehicle.cords.y + (vehicle.width / 2) * cos(vehicle.direction))
        }
        if (sensor.motor == 'Left' || sensor.motor == 'Both') {
            line(sensor.getAbsoluteCords().x, sensor.getAbsoluteCords().y, vehicle.cords.x - (vehicle.width / 2) * sin(vehicle.direction), vehicle.cords.y - (vehicle.width / 2) * cos(vehicle.direction))
        }
        pop()
    });
}

function showBottomVehicles() {
    let n = 0
    vehicles.forEach(vehicle => {
        let v
        v = new Vehicle([], 0, createVector(vehicle.cords.x, vehicle.cords.y), vehicle.width, vehicle.height, vehicle.color)
        v.cords.x = n + 70
        v.cords.y = height * 3 / 4 + 70
        showVehicle(v)
        n += 110
    });
}