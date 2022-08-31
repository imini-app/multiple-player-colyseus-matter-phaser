import Matter from 'matter-js'

export class GameEngine {
    world = null
    state = null
    engine = null
    maxPlayerCircleSize = 7
    players = {}
    circles = {}
    orbs = {}
    playerIds = {}
    screenWidth = 1920 / 1.32 * 2
    screenHeight = 1920 / 1.32 * 2

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
            for (const worldId in this.circles) {

                if (!this.state.playerCircles.get(worldId) || !this.circles[worldId]) {
                    continue;
                }
                this.state.playerCircles.get(worldId).x = this.circles[worldId].position.x;
                this.state.playerCircles.get(worldId).y = this.circles[worldId].position.y;
            }
        });
    }

    collision() {
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            const pairs = event.pairs;
            for (const pair of pairs) {
                let bodyA = pair.bodyA
                let bodyB = pair.bodyB
                if (bodyA.label == "playerCircle" && bodyB.label == "orb") {
                    this.playEatOrb(bodyA, bodyB)
                }

                if (bodyA.label == "orb" && bodyB.label == "playerCircle") {
                    this.playEatOrb(bodyB, bodyA)
                }

                // if (bodyA.label == "playerCircle" && bodyB.label == "playerCircle") {
                //     this.playerEatPlayer(bodyA, bodyB)

                // }
            }

        })
    }

    resetPlayer(statePlayer, oldBody) {
        const oldBodyId = oldBody.id
        const sessionId = this.playerIds[oldBodyId]
        // 1. remove the old body
        Matter.Composite.remove(this.world, [oldBody])
        // 2. add a new body
        const startX = Math.random() * this.screenWidth
        const startY = Math.random() * this.screenHeight

        const initialSize = 25
        const initialScore = 400

        const player = Matter.Bodies.circle(startX, startY, initialSize, { label: "player" })
        // 3. update state with the body
        this.circles[sessionId] = player
        this.playerIds[player.id] = sessionId
        delete this.playerIds[oldBodyId]

        Matter.Composite.add(this.world, [player])

        statePlayer.size = initialSize
        statePlayer.x = startX
        statePlayer.y = startY
        statePlayer.score = initialScore
    }

    playerEatPlayer(playerA, playerB) {
        const playerAId = this.playerIds[playerA.id]
        const playerAStatePlayer = this.state.clients.get(playerAId)

        const playerBId = this.playerIds[playerB.id]
        const playerBStatePlayer = this.state.clients.get(playerBId)

        let smallerPlayer = playerA
        let smallerBody = playerA

        if (playerAStatePlayer.size > playerBStatePlayer.size) {
            const currentASize = playerAStatePlayer.size
            const scoreUp = playerBStatePlayer.score
            playerAStatePlayer.score += scoreUp
            if (currentASize < this.screenWidth / this.maxPlayerCircleSize) {
                playerAStatePlayer.size += playerBStatePlayer.size
                const scaleUp = playerAStatePlayer.size / currentASize
                Matter.Body.scale(playerA, scaleUp, scaleUp)
            }
            smallerPlayer = playerBStatePlayer
            smallerBody = playerB
        }

        if (playerAStatePlayer.size < playerBStatePlayer.size) {
            const currentBSize = playerBStatePlayer.size
            const scoreUp = playerAStatePlayer.score
            playerBStatePlayer.score += scoreUp
            if (currentBSize < this.screenWidth / this.maxPlayerCircleSize) {
                playerBStatePlayer.size += playerAStatePlayer.size
                const scaleUp = playerBStatePlayer.size / currentBSize
                Matter.Body.scale(playerB, scaleUp, scaleUp)
            }
            smallerPlayer = playerAStatePlayer
            smallerBody = playerA
        }

        this.resetPlayer(smallerPlayer, smallerBody)
    }

    playEatOrb(playerCircle, orb) {
        const statePlayerCircle = this.state.playerCircles.get(String(playerCircle.id))
        const statePlayer = this.state.players.get(statePlayerCircle.playerId)
        const currentSize = statePlayerCircle.size
        const currentScore = statePlayer.score
        const newScore = currentScore + 10
        statePlayer.score = newScore
        if (currentSize < this.screenWidth / this.maxPlayerCircleSize) {
            const newSize = currentSize + 1
            statePlayerCircle.size = newSize
            const scaleUp = newSize / currentSize
            Matter.Body.scale(playerCircle, scaleUp, scaleUp)
        }

        this.state.removeOrb(orb.id)
        Matter.Composite.remove(this.world, [orb])
        this.generateOrb()
    }

    generateOrb() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.circle(x, y, 20, { label: 'orb' })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y)
        Matter.Composite.add(this.world, [orb])
    }

    addPlayer(sessionId, name) {
        const initialScore = 400
        this.state.createPlayer(sessionId, name, initialScore)
        this.addPlayerCircle(sessionId, 5)
    }

    addPlayerCircle(playerId, count = 1) {
        const startX = Math.random() * this.screenWidth
        const startY = Math.random() * this.screenHeight
        const initialSize = 25

        for (let x = 0; x < count; x++) {
            const circle = Matter.Bodies.circle(
                startX + (x * initialSize),
                startY + (x * initialSize),
                initialSize,
                { label: "playerCircle" }
            )
            this.circles[circle.id] = circle
            this.state.createPlayerCircle(circle.id, playerId, startX + (x * initialSize), startY + (x * initialSize), initialSize)
            Matter.Composite.add(this.world, [circle])
        }
    }

    findPlayerCircles(playerId) {
        const circles = []
        this.state.playerCircles.forEach((stateCircle, worldId) => {
            if (stateCircle.playerId == playerId) {
                const worldCircle = this.circles[worldId]
                circles.push(worldCircle)
            }
        });
        return circles
    }



    removePlayer(sessionId) {
        let stateCircleList = this.state.clients.get(sessionId).circles
        stateCircleList.forEach((value, key) => {
            // Key is the matter body id and value is the `UserCircleSchema`
            const circle = this.circles[key]
            Matter.Composite.remove(this.world, [circle]);
        });

        this.state.removePlayer(sessionId)

    }

    processPlayerAction(sessionId, data) {
        let vy = data?.y
        let vx = data?.x

        const playerCircles = this.findPlayerCircles(sessionId)

        for (const playerCircle of playerCircles) {
            if (!playerCircle) {
                return
            }

            const currentVelocity = playerCircle.velocity

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
            Matter.Body.setVelocity(playerCircle, { x: vx, y: vy })
        }
    }

    processPlayerSplit(sessionId, data) {
        let size = data?.size / 2
        let player = this.players[sessionId]
        let x = data?.x
        let y = data?.y

        const playerId = this.playerIds[player.id]
        const playerStatePlayer = this.state.clients.get(playerId)

        let targetSize = playerStatePlayer.size / 2

        let scale = targetSize / playerStatePlayer.size
        playerStatePlayer.size -= targetSize

        Matter.Body.scale(player, 0.5, 0.5)
        console.log(playerStatePlayer.size)

        // this.state.createPlayerDuplicate(sessionId, x, y, size, player)

    }
}