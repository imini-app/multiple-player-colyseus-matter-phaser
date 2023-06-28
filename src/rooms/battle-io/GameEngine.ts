import Matter from 'matter-js'
import random from "../../../../phaser-examples/src/games/-useful-stuff-/math/randomMinimumMaximum"
import weaponStats from "./weapons"



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
            // Bottom wa
            Matter.Bodies.rectangle(this.mapWidth / 2, this.mapHeight, this.mapWidth, 50, { isStatic: true, label: 'boundary' }),
            // Right wall
            Matter.Bodies.rectangle(this.mapWidth, this.mapHeight / 2, 50, this.mapHeight, { isStatic: true, label: 'boundary' }),
            // Left wall
            Matter.Bodies.rectangle(0, this.mapHeight / 2, 50, this.mapHeight, { isStatic: true, label: 'boundary' })
        ]

        // Set Timer:
        this.setTimer(3600)

        Matter.Composite.add(this.world, boundarys)
    }

    setupUpdate() {
        Matter.Events.on(this.engine, "afterUpdate", () => {
            // TODO: Add the update events stuff

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

        const team = this.selectTeam(2, [
            {
                name: "blue",
                score: blueTeamScore,
                team: blueTeam
            },

            {
                name: "red",
                score: redTeamScore,
                team: redTeam
            }
        ])

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

    addWeapon(playerSessionId, weapon) {
        const currentWeaponStats = weaponStats[String(weapon)]

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
        let newTeamName = ""
        const teams = []
        for (let x = 0; x < amountOfTeams; x++) {
            const team = {
                teamName: null,
                teamScore: null,
                teamPlayerAmount: 0,
            }

            team.teamName = teamObjects[x].name
            team.teamScore = teamObjects[x].score
            team.teamPlayerAmount = teamObjects[x].team.players

            teams.push(team)
        }

        let lowestScore = 0
        const equalScoreTeams = []

        for (const team of teams) {
            if (lowestScore > team.score) {
                lowestScore = team.score
                newTeamName = team.teamName
            }

            if (lowestScore == team.score) {
                equalScoreTeams.push(team)
            }
        }

        let leastPlayers = 21
        const equalAmountPlayersTeams = []

        if (equalScoreTeams.length > 1) {
            for (const team of equalScoreTeams) {
                if (leastPlayers > team.teamPlayerAmount) {
                    leastPlayers = team.teamPlayerAmount
                    newTeamName = team.teamName
                }

                if (leastPlayers == team.teamPlayerAmount) {
                    equalAmountPlayersTeams.push(team)
                }

            }
        }

        if (equalAmountPlayersTeams.length > 1) {
            newTeamName = equalAmountPlayersTeams[random(0, equalAmountPlayersTeams.length - 1)].teamName
        }


        return newTeamName
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

    setTimer(seconds) {
        const time = seconds * 1000
        setTimeout(() => {
            this.gameover()
        }, time)

    }

    processPlayerAttack(sessionId, playerData) {
        if (!playerData) {
            return
        }

        const dataFightingStyle = playerData?.fightingStyle
        const dataWeapon = playerData?.weapon
        const dataMastery = playerData?.mastery
        const dataTime = playerData?.time
        const dataType = playerData?.moveType
        let moveDamage

        const currentWeaponStats = weaponStats[dataWeapon]

        if (dataType == "X") {
            if (currentWeaponStats.XMasteryUnlock == dataMastery) {
                if (dataTime.time <= 0.5) {
                    moveDamage = currentWeaponStats.XMasteryDamage / 0.6
                }
                if (dataTime.time <= 1 && dataTime.time > 0.5) {
                    moveDamage = currentWeaponStats.XMasteryDamage / 0.75
                }

                if (dataTime.time <= 1.5 && dataTime.time > 1) {
                    moveDamage = currentWeaponStats.XMasteryDamage / 0.90
                }

                if (dataTime.time > 1.5) {
                    moveDamage = currentWeaponStats.XMasteryDamage
                }
            } else {
                console.log("Mastery To Low, Try Again")
            }
        }

        if (dataType == "Z") {
            if (currentWeaponStats.ZMasteryUnlock == dataMastery) {
                moveDamage == currentWeaponStats.ZMasteryDamage
            } else {
                console.log("Mastery To Low, Try Again")
            }
        }

        const player = this.players[sessionId]
        let nearestPlayer = {
            positionScore: Infinity,
            health: 100
        }


        for (const key in this.players) {
            if (key == sessionId) continue
            const otherPlayer = this.players[key]
            const positionScore = Math.abs(player.x - otherPlayer.x) + Math.abs(player.y - otherPlayer.y)
            if (positionScore < nearestPlayer.positionScore) {
                nearestPlayer = otherPlayer
                nearestPlayer.positionScore = positionScore
            }
        }

        if (dataType == "X") {
            setTimeout(() => {
                nearestPlayer.health -= moveDamage
            }, Number(nearestPlayer.positionScore * 10))

        }

        // TODO: Inflict Damage on target
    }



    gameover() {
        const winningTeamObject = {
            teamName: "",
            teamScore: 0,
            teamKills: 0,
            playerAmount: 0
        }

        // AI
        const AITeam = this.teams.AI

        // Blue team
        const blueTeam = this.teams.blue
        const blueTeamsScore = ((blueTeam.score + (blueTeam.kills * 100)) - (blueTeam.players * 100))
        const finalBlueTeamScore = blueTeamsScore * (AITeam.players / 25 + 1)

        // Red team
        const redTeam = this.teams.red
        const redTeamsScore = ((redTeam.score + (redTeam.kills * 100)) - (redTeam.players * 100))
        const finalRedTeamScore = redTeamsScore * (AITeam.players / 25 + 1)

        let continueMethod = true

        if (blueTeamsScore > redTeamsScore) {
            winningTeamObject.teamName = "Blue Team"
            winningTeamObject.teamScore = finalBlueTeamScore
            winningTeamObject.teamKills = blueTeam.kills
            winningTeamObject.playerAmount = blueTeam.players
            continueMethod = true
        } else if (redTeamsScore > blueTeamsScore) {
            winningTeamObject.teamName = "Red Team"
            winningTeamObject.teamScore = finalRedTeamScore
            winningTeamObject.teamKills = redTeam.kills
            winningTeamObject.playerAmount = redTeam.players
            continueMethod = true
        } else {
            this.setTimer(300)
            continueMethod = false
        }

        if (!continueMethod) {
            return
        }
        const AITeamFinalScore = ((AITeam.score + (AITeam.kills * 100)) - (AITeam.players * 100)) * (winningTeamObject.playerAmount / 25 + 1)
        if (AITeamFinalScore > winningTeamObject.teamScore) {
            winningTeamObject.teamName = "AI Team"
            winningTeamObject.teamScore = AITeamFinalScore
            winningTeamObject.teamKills = AITeam.kills
            winningTeamObject.playerAmount = AITeam.players
        }

    }

}