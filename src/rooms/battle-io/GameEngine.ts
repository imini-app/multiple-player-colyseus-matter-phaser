import Matter from 'matter-js'
export default class GameEngine {
    world = null
    state = null
    engine = null
    mapWidth = 1920 / 1.32 * 3.6
    mapHeight = 1920 / 1.32 * 3.6

    constructor(roomState) {
        this.engine = Matter.Engine.create()
        this.world = this.engine.world

        this.state = roomState

        this.engine.gravity.y = 0
        this.setup()
    }

    setup() {
        const boundarys = [
            // Top wall
            Matter.Bodies.rectangle(this.mapWidth / 2, 0, this.mapWidth, 50, { isStatic: true }),
            // Bottom wall
            Matter.Bodies.rectangle(this.mapWidth / 2, this.mapHeight, this.mapWidth, 50, { isStatic: true, label: 'boundary' }),
            // Right wall
            Matter.Bodies.rectangle(this.mapWidth, this.mapHeight / 2, 50, this.mapHeight, { isStatic: true, label: 'boundary' }),
            // Left wall
            Matter.Bodies.rectangle(0, this.mapHeight / 2, 50, this.mapHeight, { isStatic: true, label: 'boundary' })
        ]

        Matter.Composite.add(this.world, boundarys)
    }

    setupUpdate() {
        Matter.Events.on(this.engine, "afterUpdate", () => {

        })
    }

    collision() {
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            const bodyPairs = event.pairs;
            for (const body of bodyPairs) {
                let bodyA = body.bodyA
                let bodyB = body.bodyB
            }
        })
    }

    processPlayerMovement(sessionId, moveData) {
        // TODO: Add logic
    }
}