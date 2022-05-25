import Matter from 'matter-js'

export class GameEngine {
    world = null
    state = null
    engine = null
    screenWidth = 1920 * 5
    screenHeight = 1080 * 5

    constructor(roomState) {
        this.engine = Matter.Engine.create()
        this.world = this.engine.world

        this.state = roomState

        this.engine.gravity.y = 0;
        this.setup()
    }

    setup() {
        // TODO: set up someting else if needed


        let walls = [
            // Top wall
            Matter.Bodies.rectangle(this.screenWidth / 2, 0, this.screenWidth, 20),
            // Bottom wall
            Matter.Bodies.rectangle(this.screenWidth / 2, this.screenHeight, this.screenWidth, 20),
            // Right wall
            Matter.Bodies.rectangle(this.screenWidth, this.screenHeight / 2, 20, this.screenHeight),
            // Left wall
            Matter.Bodies.rectangle(0, this.screenHeight / 2, 20, this.screenHeight)
        ]

        Matter.Composite.add(this.world, walls)
    }
}