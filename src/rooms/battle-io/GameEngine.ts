import Matter from 'matter-js'
import random from "../../../../phaser-examples/src/games/-useful-stuff-/math/randomMinimumMaximum"
export default class GameEngine {
    world = null
    state = null
    engine = null
    mapWidth = 1920 / 1.32 * 3.6
    mapHeight = 1920 / 1.32 * 3.6
    players = {}
    AIEnemys = {}
    teams = {
        blue: {
            players: 0,
            kills: 0,
            score: 0,
        },
        red: {
            players: 0,
            kills: 0,
            score: 0
        },

        AI: {
            players: 0,
            kills: 0,
            score: 0
        }
    }

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

    addPlayer(sessionId, name) {
        const initialScore = 0
        const x = random(100, this.mapWidth - 100)
        const y = random(100, this.mapHeight - 100)
        const size = 35

        const blueTeam = this.teams.blue
        const redTeam = this.teams.red
        const blueTeamScore = blueTeam.score + (blueTeam.kills * 10)
        const redTeamScore = redTeam.score + (redTeam.kills * 10)

        const team = this.selectTeam(2, {
            "blue": {
                score: blueTeamScore,
                team: blueTeam
            },

            "red": {
                score: redTeamScore,
                team: redTeam
            }
        })

        const player = Matter.Bodies.circle(
            x,
            y,
            size,
            { label: "player" }
        )

        this.players[sessionId] = player
        this.teams[team].players += 1
        this.state.createPlayer(sessionId, x, y, 100, initialScore, name, team)
        Matter.Composite.add(this.world, [player])
    }

    removePlayer(sessionId) {
        const player = this.players[sessionId]
        const statePlayer = this.state.players.get(String(sessionId))
        this.teams[statePlayer.team].players -= 1
        this.state.removePlayer(String(sessionId))
        Matter.Composite.remove(this.world, [player])
    }

    addEnemyAI(sessionId) {
        const initialScore = 0
        const x = random(100, this.mapWidth - 100)
        const y = random(100, this.mapHeight - 100)
        const size = 35

        const team = "AI"

        const enemy = Matter.Bodies.circle(
            x,
            y,
            size,
            { label: "AI" }
        )

        this.AIEnemys[sessionId] = enemy
        this.teams[team].players += 1
        this.state.createAIEnemy(sessionId, x, y, 100, initialScore)
        Matter.Composite.add(this.world, [enemy])
    }

    generateBarricade() {
        const x = random(350, this.mapWidth - 350)
        const y = random(350, this.mapHeight - 350)
        const width = random(150, 250)
        const height = random(150, 250)

        const barricade = Matter.Bodies.rectangle(x, y, width, height, { isStatic: true, label: "barricade" })
        this.state.createBarricade(barricade.id, x, y, width, height)
        Matter.Composite.add(this.world, [barricade])
    }

    selectTeam(amountOfTeams, teamObjects) {
        let team = ""

        for (let x = 0; x < amountOfTeams; x++) {

        }


        return team
    }
    processPlayerMovement(sessionId, movementData) {
        const dataVelocityX = movementData?.x
        const dataVelocityY = movementData?.y
        let velocityX = 0
        let velocityY = 0

        const player = this.players[sessionId]
        if (!player) {
            return
        }

        const currentPlayerVelocity = player.velocity

        if (dataVelocityX) {
            velocityX = dataVelocityX
        } else {
            velocityX = currentPlayerVelocity.x
        }

        if (dataVelocityY) {
            velocityY = dataVelocityY
        } else {
            velocityY = currentPlayerVelocity.y
        }

        Matter.Body.setVelocity(player, { x: velocityX, y: velocityY })
    }
}