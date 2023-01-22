import Matter from 'matter-js'
import random from "../../../../phaser-examples/src/games/-useful-stuff-/math/randomMinimumMaximum"
export default class GameEngine {
    world = null
    state = null
    engine = null
    mapWidth = 1920 / 1.32 * 3.6
    mapHeight = 1920 / 1.32 * 3.6
    players = {}
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
            objects: 0
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

        let team = ""
        const blueTeam = this.teams.blue
        const redTeam = this.teams.red
        const blueTeamScore = blueTeam.score + (blueTeam.kills * 10)
        const redTeamScore = redTeam.score + (redTeam.kills * 10)

        this.selectTeamBlueVsRed(blueTeamScore, redTeamScore, blueTeam, redTeam)

        const player = Matter.Bodies.circle(
            x,
            y,
            size,
            { label: "player" }
        )

        this.players[sessionId] = player
        this.state.createPlayer(sessionId, x, y, 100, initialScore, name, team)
        Matter.Composite.add(this.world, [player])
    }

    removePlayer(sessionId) {
        const player = this.players[sessionId]
        this.state.removePlayer(sessionId)
        Matter.Composite.remove(this.world, [player])
    }

    selectTeamBlueVsRed(teamBlueScore, teamRedScore, blueTeam, redTeam) {
        let team = ""
        const blueTeamScore = teamBlueScore
        const redTeamScore = teamRedScore
        if (blueTeamScore < redTeamScore) {
            team = "blue"
        } else if (redTeamScore < blueTeamScore) {
            team = "red"
        } else if (blueTeamScore == redTeamScore) {
            const blueTeamPlayers = blueTeam.players
            const redTeamPlayers = redTeam.players
            if (blueTeamPlayers < redTeamPlayers) {
                team = "blue"
            } else if (redTeamPlayers < blueTeamPlayers) {
                team = "red"
            } else if (blueTeamPlayers == redTeamPlayers) {
                const randomNumber = random(1, 2)
                if (randomNumber == 1) {
                    team = "blue"
                } else if (randomNumber == 2) {
                    team = "red"
                }
            }
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