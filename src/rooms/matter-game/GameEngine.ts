import Matter from 'matter-js'

export class GameEngine {
    world = null
    state = null
    engine = null
    players = {}
    orbs = {}
    playerIds = {}
    screenWidth = 1920 / 1.32 * 10
    screenHeight = 1920 / 1.32 * 10

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

        for (let x = 0; x < 200 * this.screenWidth / 1454.54545455; x++) {
            this.generateOrb()
        }
        this.setupUpdateEvents()
        this.collision()
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

    collision() {
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            const pairs = event.pairs;
            for (const pair of pairs) {
                let bodyA = pair.bodyA
                let bodyB = pair.bodyB
                if (bodyA.label == "player" && bodyB.label == "orb") {
                    this.playEatOrb(bodyA, bodyB)
                }

                if (bodyA.label == "orb" && bodyB.label == "player") {
                    this.playEatOrb(bodyB, bodyA)
                }
            }

        })
    }

    playEatOrb(player, orb) {
        const id = this.playerIds[player.id]
        const statePlayer = this.state.clients.get(id)
        const currentSize = statePlayer.size
        const newSize = currentSize + 1
        statePlayer.size = newSize
        const scaleUp = newSize / currentSize
        Matter.Body.scale(player, scaleUp, scaleUp)

        this.state.removeBall(orb.id)
        Matter.Composite.remove(this.world, [orb])
        this.generateOrb()
    }

    generateOrb() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.circle(x, y, 20, { label: 'orb' })
        this.orbs[orb.id] = orb
        console.log(orb.id, 'id')
        this.state.createBall(orb.id, x, y)
        Matter.Composite.add(this.world, [orb])
    }

    addPlayer(sessionId, name) {
        const startX = Math.random() * this.screenWidth
        const startY = Math.random() * this.screenHeight

        const initialSize = 25

        /*
        Create a player then asign to `this.players[sessionId]`.
        Also create player and add it to the world.
        Plus create a client/player in the state.
        */
        const player = Matter.Bodies.circle(startX, startY, initialSize, { label: "player" })
        this.players[sessionId] = player
        this.playerIds[player.id] = sessionId
        this.state.createPlayer(sessionId, name, startX, startY, initialSize)
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