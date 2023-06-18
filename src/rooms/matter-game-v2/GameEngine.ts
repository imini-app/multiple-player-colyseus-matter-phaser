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
    screenWidth = 1920 / 1.32 * 12
    screenHeight = 1920 / 1.32 * 12


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

        for (let x = 0; x < 400 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generateOrb(), 5)
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

                if (bodyA.label == "playerCircle" && bodyB.label == "playerCircle") {
                    this.playerEatPlayer(bodyA, bodyB)

                }
            }

        })
    }

    resetPlayer(statePlayerCircle, oldBody, sameOrNot) {
        // 0. Find every circle for that player and count. If 1 or 0 reset, otherwise return.
        const statePlayer = this.state.players.get(statePlayerCircle.playerId)
        const playerCircles = this.findPlayerCircles(statePlayerCircle.playerId)

        // 1. remove the old body and Remove from state
        this.state.removePlayerCircle(oldBody.id)
        delete this.circles[oldBody.id]
        Matter.Composite.remove(this.world, [oldBody])


        if (!sameOrNot && playerCircles.length <= 1) {

            // 2. add a new body
            const startX = Math.random() * this.screenWidth
            const startY = Math.random() * this.screenHeight

            const initialSize = 25
            const initialScore = 400

            const playerCircle = Matter.Bodies.circle(startX, startY, initialSize, { label: "playerCircle" })
            // 3. update state with the body
            this.circles[playerCircle.id] = playerCircle

            Matter.Composite.add(this.world, [playerCircle])
            this.state.createPlayerCircle(playerCircle.id, statePlayerCircle.playerId, startX, startY, initialSize)
            if (statePlayer) statePlayer.score = initialScore
        }
    }

    playerEatPlayer(playerA, playerB) {
        const statePlayerACircle = this.state.playerCircles.get(String(playerA.id))
        const statePlayerA = this.state.players.get(statePlayerACircle.playerId)

        const statePlayerBCircle = this.state.playerCircles.get(String(playerB.id))
        const statePlayerB = this.state.players.get(statePlayerBCircle.playerId)

        let smallerPlayerCircle = playerA
        let smallerBody = playerA

        const samePlayer = statePlayerACircle.playerId == statePlayerBCircle.playerId

        if (statePlayerACircle.size >= statePlayerBCircle.size) {
            const currentASize = statePlayerACircle.size
            if (!samePlayer) {
                const scoreChange = statePlayerBCircle.size * 10
                statePlayerA.score += scoreChange
                statePlayerB.score -= scoreChange
                if (statePlayerB.score < 100) statePlayerB.score = 100
            }
            if (currentASize < this.screenWidth / this.maxPlayerCircleSize) {
                statePlayerACircle.size += statePlayerBCircle.size
                const scaleUp = statePlayerACircle.size / currentASize
                Matter.Body.scale(playerA, scaleUp, scaleUp)
            }
            smallerPlayerCircle = statePlayerBCircle
            smallerBody = playerB
        }

        if (statePlayerBCircle.size >= statePlayerACircle.size) {
            const currentBSize = statePlayerBCircle.size
            if (!samePlayer) {
                const scoreChange = statePlayerACircle.size * 10
                statePlayerB.score += scoreChange
                statePlayerA.score -= scoreChange
            }
            if (currentBSize < this.screenWidth / this.maxPlayerCircleSize) {
                statePlayerBCircle.size += statePlayerACircle.size
                const scaleUp = statePlayerBCircle.size / currentBSize
                Matter.Body.scale(playerB, scaleUp, scaleUp)
            }
            smallerPlayerCircle = statePlayerACircle
            smallerBody = playerA
        }

        this.resetPlayer(smallerPlayerCircle, smallerBody, samePlayer)
    }

    playEatOrb(playerCircle, orb) {
        const statePlayerCircle = this.state.playerCircles.get(String(playerCircle.id))
        if (!statePlayerCircle) return
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
        const initialScore = 800
        this.state.createPlayer(sessionId, name, initialScore)

        setTimeout(() => this.addPlayerCircle(sessionId, 1), 1000)
    }

    addPlayerCircle(playerId, count = 1, size = 50, initX = 0, initY = 0) {
        let startX = initX == 0 ? Math.random() * this.screenWidth : initX
        let startY = initY == 0 ? Math.random() * this.screenHeight : initY
        if (startX > this.screenWidth - 2.5) startX = this.screenWidth - 20
        if (startY > this.screenHeight - 2.5) startY = this.screenHeight - 20
        if (startX < 2.5) startX = 20
        if (startY < 2.5) startY = 20

        for (let x = 0; x < count; x++) {
            const circle = Matter.Bodies.circle(
                startX + (x * size * 2),
                startY + (x * size * 2),
                size,
                { label: "playerCircle" }
            )
            this.circles[circle.id] = circle
            this.state.createPlayerCircle(circle.id, playerId, startX + (x * size * 2), startY + (x * size * 2), size)
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
        let worldCircleList = this.findPlayerCircles(sessionId)
        for (const circle of worldCircleList) {
            this.state.removePlayerCircle(circle.id)
            Matter.Composite.remove(this.world, [circle]);
        }

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

    processPlayerSplit(sessionId) {
        const playerCircles = this.findPlayerCircles(sessionId)
        if (!playerCircles) return
        for (const circle of playerCircles) {
            let offset;
            // 1. change the size in the state to half
            const statePlayerCircle = this.state.playerCircles.get(String(circle.id))
            const currentSize = statePlayerCircle.size
            if (currentSize < 50) continue
            statePlayerCircle.size = Math.floor(currentSize / 2)
            // 2. scale the body in the matter to half
            const scaleDown = statePlayerCircle.size / currentSize
            Matter.Body.scale(circle, scaleDown, scaleDown)

            // 3. add new circle to the world and state
            offset = statePlayerCircle.size * 2
            this.addPlayerCircle(
                sessionId,
                1, // only one needed
                statePlayerCircle.size,
                statePlayerCircle.x + offset,
                statePlayerCircle.y + offset
            )
        }
    }
}