import Matter from 'matter-js'

export class GameEngine {
    world = null
    state = null
    engine = null
    players = {}
    screenWidth = 1920 / 1.32
    screenHeight = 1080 / 1.5

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
            Matter.Bodies.rectangle(this.screenWidth / 2, 0, this.screenWidth, 5, { isStatic: true }),
            // Bottom wall
            Matter.Bodies.rectangle(this.screenWidth / 2, this.screenHeight, this.screenWidth, 5, { isStatic: true }),
            // Right wall
            Matter.Bodies.rectangle(this.screenWidth, this.screenHeight / 2, 5, this.screenHeight, { isStatic: true }),
            // Left wall
            Matter.Bodies.rectangle(0, this.screenHeight / 2, 5, this.screenHeight, { isStatic: true })
        ]

        Matter.Composite.add(this.world, walls)

        this.setupUpdateEvents()
    }

    setupUpdateEvents() {
        // Register events
        Matter.Events.on(this.engine, "afterUpdate", () => {
            // Update the state
            // apply the x position of the physics ball object back to the colyseus ball object
            // loop over all physics players and apply their properties back to colyseus players objects

            for (const key in this.players) {
                if (!this.state.clients.get(key) || !this.players[key]) {
                    continue;
                }
                this.state.clients.get(key).x = this.players[key].position.x;
                this.state.clients.get(key).y = this.players[key].position.y;
            }
        });
    }

    addPlayer(sessionId, name) {
        const startX = Math.random() * this.screenWidth
        const startY = Math.random() * this.screenHeight

        /*
        Create a player then asign to `this.players[sessionId]`.
        Also create player and add it to the world.
        Plus create a client/player in the state.
        */
        const player = Matter.Bodies.circle(startX, startY, 50)
        this.players[sessionId] = player
        this.state.createPlayer(sessionId, name, startX, startY)
        Matter.Composite.add(this.world, [player])
    }

    removePlayer(sessionId) {
        const player = this.players[sessionId]
        this.state.removePlayer(sessionId)
        Matter.Composite.remove(this.world, [player]);
    }

    processPlayerAction(sessionId, data) {
        // TODO: Change Velocity
        console.log("Session Id", sessionId, "Data", data)
        let vy = data?.y
        let vx = data?.x

        let player = this.players[sessionId]
        if (!player) {
            return
        }

        const currentVelocity = player.velocity

        if (data.x) {
            vx = data.x
        } else {
            vx = currentVelocity.x
        }

        if (data.y) {
            vy = data.y
        } else {
            vy = currentVelocity.y
        }
        // I am trying to change the x and y of the player.

        Matter.Body.setVelocity(player, { x: vx, y: vy })
    }
}