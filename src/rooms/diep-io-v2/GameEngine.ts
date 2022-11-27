import Matter from 'matter-js'
import tankStats from './tanks'
export default class GameEngine {
    world = null
    state = null
    engine = null
    maxPlayerCircleSize = 34.968
    players = {}
    circles = {}
    orbs = {}
    bullets = {}
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
            Matter.Bodies.rectangle(this.screenWidth / 2, this.screenHeight, this.screenWidth, 5, { isStatic: true, label: 'mapEnd' }),
            // Right wall
            Matter.Bodies.rectangle(this.screenWidth, this.screenHeight / 2, 5, this.screenHeight, { isStatic: true, label: 'mapEnd' }),
            // Left wall
            Matter.Bodies.rectangle(0, this.screenHeight / 2, 5, this.screenHeight, { isStatic: true, label: 'mapEnd' })
        ]

        Matter.Composite.add(this.world, walls)

        for (let x = 0; x < 75 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generateSquare(), 1)
        }

        for (let x = 0; x < 25 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generateTriangle(), 1)
        }

        for (let x = 0; x < 8 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generatePentagon(), 1)
        }

        for (let x = 0; x < 2 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generateWall(), 1)
        }

        for (let x = 0; x < 7; x++) {
            setTimeout(() => this.generateAlphaPentagon(), 1)

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

            for (const worldId in this.bullets) {
                if (!this.state.playerBullets.get(worldId) || !this.bullets[worldId]) {
                    continue;
                }
                this.state.playerBullets.get(worldId).x = this.bullets[worldId].position.x;
                this.state.playerBullets.get(worldId).y = this.bullets[worldId].position.y;
            }
        });
    }

    collision() {
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            const pairs = event.pairs;
            for (const pair of pairs) {
                let bodyA = pair.bodyA
                let bodyB = pair.bodyB
                if (bodyA.label == "playerBullet" && bodyB.label == "orb") {
                    this.bulletHitOrb(bodyA, bodyB)
                }

                if (bodyA.label == "orb" && bodyB.label == "playerBullet") {
                    this.bulletHitOrb(bodyB, bodyA)
                }

                if (bodyA.label == "playerBullet" && bodyB.label == "wall") {
                    this.state.removePlayerBullet(bodyA.id)
                    Matter.Composite.remove(this.world, [bodyA])
                }

                if (bodyA.label == "wall" && bodyB.label == "playerBullet") {
                    this.state.removePlayerBullet(bodyB.id)
                    Matter.Composite.remove(this.world, [bodyB])
                }

                if (bodyA.label == "orb" && bodyB.label == "wall") {
                    switch (this.state.orbs.get(String(bodyA.id))?.type) {
                        case 'rectangle':
                            this.generateSquare()
                            break;
                        case 'triangle':
                            this.generateTriangle()
                            break;
                        case 'pentagon':
                            this.generatePentagon()
                            break;
                        case 'alphaPentagon':
                            this.generateAlphaPentagon()
                            break;
                    }
                    this.state.removeOrb(bodyA.id)
                    Matter.Composite.remove(this.world, [bodyA])
                    this.generateSquare()
                }

                if (bodyA.label == "wall" && bodyB.label == "orb") {
                    switch (this.state.orbs.get(String(bodyB.id))?.type) {
                        case 'rectangle':
                            this.generateSquare()
                            break;
                        case 'triangle':
                            this.generateTriangle()
                            break;
                        case 'pentagon':
                            this.generatePentagon()
                            break;
                        case 'alphaPentagon':
                            this.generateAlphaPentagon()
                            break;
                    }
                    this.state.removeOrb(bodyB.id)
                    Matter.Composite.remove(this.world, [bodyB])
                    this.generateSquare()
                }

                if (bodyA.label == "playerCircle" && bodyB.label == "playerCircle") {
                    this.playerTouchPlayer(bodyA, bodyB)

                }

                if (bodyA.label == "playerBullet" && bodyB.label == "playerBullet") {
                    this.bulletHitBullet(bodyA, bodyB)
                }

                if (bodyA.label == "playerBullet" && bodyB.label == "playerCircle") {
                    this.bulletHitPlayerCircle(bodyA, bodyB)
                }
                if (bodyA.label == "playerCircle" && bodyB.label == "playerBullet") {
                    this.bulletHitPlayerCircle(bodyB, bodyA)

                }

                if (bodyA.label == "wall" && bodyB.label == "mapEnd") {
                    this.state.removeWall(bodyA.id)
                    Matter.Composite.remove(this.world, [bodyA])
                    this.generateWall()
                }

                if (bodyA.label == "mapEnd" && bodyB.label == "wall") {
                    this.state.removeWall(bodyB.id)
                    Matter.Composite.remove(this.world, [bodyB])
                    this.generateWall()
                }

            }
        })
    }

    levelUp(statePlayerCircle) {
        const statePlayer = this.state.players.get(String(statePlayerCircle.playerId))
        const statePlayerScore = statePlayer.score
        const newLevel = Math.floor(statePlayerScore / 5) - 8
        statePlayer.level = newLevel
        this.upgradePlayer(newLevel, statePlayer)
    }

    upgradePlayer(level, statePlayer) {

        const currentTank = statePlayer.tankName
        const currentLevel = statePlayer.level
        if (level >= 15 || level >= 30 || level >= 45 || level >= 60 || level >= 105 || level >= 135 || level >= 270 || level >= 995) {

            const listOfTanksToUpgradeTo = []
            const tankKeys = []

            let x = 0
            for (const tankName of tankStats[currentTank].upgradesTo) {
                listOfTanksToUpgradeTo.push(tankName)
                tankKeys.push(x)
                x++
            }

            for (const tankName of listOfTanksToUpgradeTo) {
                if (tankStats[tankName].level > currentLevel) {
                    const id = listOfTanksToUpgradeTo.indexOf(tankName)
                    listOfTanksToUpgradeTo.splice(id, 1)
                }
            }

            statePlayer.tankUpgradeNames = JSON.stringify(listOfTanksToUpgradeTo)
        }
    }


    bulletHitBullet(bulletA, bulletB) {
        const stateBulletA = this.state.playerBullets.get(String(bulletA.id))
        if (!stateBulletA) return
        const stateBulletB = this.state.playerBullets.get(String(bulletB.id))
        if (!stateBulletB) return
        const sameOrNot = stateBulletA.playerId == stateBulletB.playerId
        if (sameOrNot) return

        const stateBulletAHealth = stateBulletA.health
        const stateBulletBHealth = stateBulletB.health

        let smallerBody = null

        if (stateBulletAHealth > stateBulletBHealth) {
            smallerBody = bulletB
            const healthDifference = stateBulletA.health - stateBulletB.health
            if (healthDifference > 0) {
                stateBulletA.health = healthDifference
            } else {
                this.state.removePlayerBullet(bulletA.id)
                Matter.Composite.remove(this.world, [bulletA])
            }
        }

        if (stateBulletBHealth > stateBulletAHealth) {
            smallerBody = bulletA
            const healthDifference = stateBulletB.health - stateBulletA.health
            if (healthDifference > 0) {
                stateBulletB.health = healthDifference
            } else {
                this.state.removePlayerBullet(bulletB.id)
                Matter.Composite.remove(this.world, [bulletB])
            }
        }

        if (stateBulletAHealth == stateBulletBHealth) {
            const damageDifference = stateBulletA.damage - stateBulletB.damage
            if (damageDifference > 0) {
                stateBulletA.damage = damageDifference
                smallerBody = bulletB
            } else if (damageDifference < 0) {
                stateBulletB.damage = stateBulletB.damage - stateBulletA.damage
                smallerBody = bulletA
            } else {
                this.state.removePlayerBullet(bulletA.id)
                Matter.Composite.remove(this.world, [bulletA])
                this.state.removePlayerBullet(bulletB.id)
                Matter.Composite.remove(this.world, [bulletB])
            }
        }


        if (!smallerBody) return
        this.state.removePlayerBullet(smallerBody.id)
        Matter.Composite.remove(this.world, [smallerBody])
    }

    bulletHitPlayerCircle(bullet, playerCircle) {
        const stateBullet = this.state.playerBullets.get(String(bullet.id))
        if (!stateBullet) return

        const statePlayerCircle = this.state.playerCircles.get(String(playerCircle.id))
        if (!statePlayerCircle) return
        if (stateBullet?.playerId == statePlayerCircle?.playerId) return

        const stateBulletCircle = this.state.playerCircles.get(String(stateBullet.circleId))
        if (!stateBulletCircle) return
        const hpLeft = statePlayerCircle.hp - stateBullet.damage
        if (hpLeft > 0) {
            statePlayerCircle.hp = hpLeft
            this.state.removePlayerBullet(bullet.id)
            Matter.Composite.remove(this.world, [bullet])
            return
        }
        const scoreFormula = statePlayerCircle.size * 10
        const scoreUp = scoreFormula >= 7500 ? 7500 : scoreFormula
        const sizeUp = statePlayerCircle.size
        this.state.players.get(statePlayerCircle.playerId).score -= scoreUp
        this.state.removePlayerBullet(bullet.id)
        Matter.Composite.remove(this.world, [bullet])
        this.resetPlayer(statePlayerCircle, playerCircle, false)

        if (!stateBulletCircle) return
        const matterBulletCircle = this.circles[stateBullet.circleId]
        const currentSize = stateBulletCircle.size
        const stateBulletPlayer = this.state.players.get(stateBullet.playerId)
        stateBulletPlayer.score += scoreUp
        const newSize = stateBulletCircle.size + sizeUp
        if (newSize < this.screenWidth / this.maxPlayerCircleSize) {
            stateBulletCircle.size = newSize
            const scaleUp = newSize / currentSize
            Matter.Body.scale(matterBulletCircle, scaleUp, scaleUp)
        } else {
            stateBulletCircle.size = this.screenWidth / this.maxPlayerCircleSize
            const scaleUp = this.screenWidth / this.maxPlayerCircleSize / currentSize
            Matter.Body.scale(matterBulletCircle, scaleUp, scaleUp)
        }

    }

    resetPlayer(statePlayerCircle, oldBody, sameOrNot) {
        // 0. Find every circle for that player and count. If 1 or 0 reset, otherwise return.
        const statePlayer = this.state.players.get(statePlayerCircle?.playerId)
        const playerCircles = this.findPlayerCircles(statePlayerCircle?.playerId)

        // 1. remove the old body and Remove from state
        this.state.removePlayerCircle(oldBody.id)
        delete this.circles[oldBody.id]
        Matter.Composite.remove(this.world, [oldBody])


        if (!sameOrNot && playerCircles.length <= 1) {

            // 2. add a new body
            const startX = Math.random() * this.screenWidth
            const startY = Math.random() * this.screenHeight

            const initialSize = 50
            const initialScore = 800

            const playerCircle = Matter.Bodies.circle(startX, startY, initialSize, { label: "playerCircle" })
            // 3. update state with the body
            this.circles[playerCircle.id] = playerCircle

            Matter.Composite.add(this.world, [playerCircle])
            this.state.createPlayerCircle(playerCircle.id, statePlayerCircle?.playerId, startX, startY, initialSize, (initialSize + (2 * (initialSize / 50) - 1)), 1, statePlayer.tankName)
            if (statePlayer) statePlayer.score = initialScore
        }
    }

    playerTouchPlayer(playerA, playerB) {
        const statePlayerACircle = this.state.playerCircles.get(String(playerA.id))

        const statePlayerBCircle = this.state.playerCircles.get(String(playerB.id))

        let smallerPlayerCircle = playerA
        let smallerBody = playerA

        const samePlayer = statePlayerACircle?.playerId == statePlayerBCircle?.playerId

        if (!samePlayer) return
        if (statePlayerACircle.size >= statePlayerBCircle.size) {
            const currentASize = statePlayerACircle.size
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

    bulletHitOrb(playerBullet, orb) {
        let xp = 10
        let destroyWhat;
        const stateOrb = this.state.orbs.get(String(orb?.id))
        if (!stateOrb) return
        switch (stateOrb.type) {
            case 'rectangle':
                xp = 10
                destroyWhat = 'rectangle'
                break;
            case 'triangle':
                xp = 25
                destroyWhat = 'triangle'
                break;
            case 'pentagon':
                xp = 130
                destroyWhat = 'pentagon'
                break;
            case 'alphaPentagon':
                xp = 3000
                destroyWhat = 'alphaPentagon'
                break;
            default:
                break;

        }
        const stateBullet = this.state.playerBullets.get(String(playerBullet.id))
        if (!stateBullet) return
        const statePlayerCircle = this.state.playerCircles.get(String(stateBullet.circleId))
        if (!statePlayerCircle) return
        const playerCircle = this.circles[stateBullet.circleId]
        if (!playerCircle) return
        const statePlayer = this.state.players.get(String(statePlayerCircle.playerId))
        const objectAliveHpDifference = stateOrb.hp - stateBullet.damage
        if (objectAliveHpDifference > 0) {
            stateOrb.hp = objectAliveHpDifference
            this.state.removePlayerBullet(playerBullet.id)
            Matter.Composite.remove(this.world, [playerBullet])
            return
        }
        const currentSize = statePlayerCircle.size
        const currentScore = statePlayer.score
        const newScore = currentScore + xp
        statePlayer.score = newScore
        const newSize = currentSize + (xp / 10)
        if (newSize < this.screenWidth / this.maxPlayerCircleSize) {
            statePlayerCircle.size = newSize
            const scaleUp = newSize / currentSize
            Matter.Body.scale(playerCircle, scaleUp, scaleUp)
        }

        this.state.removePlayerBullet(playerBullet.id)
        Matter.Composite.remove(this.world, [playerBullet])
        this.state.removeOrb(orb.id)
        Matter.Composite.remove(this.world, [orb])

        this.levelUp(statePlayerCircle)

        if (destroyWhat == 'rectangle') {
            this.generateSquare()
        } else if (destroyWhat == 'triangle') {
            this.generateTriangle()
        } else if (destroyWhat == 'pentagon') {
            this.generatePentagon()
        } else if (destroyWhat == 'alphaPentagon') {
            this.generateAlphaPentagon()
        } else {
            return
        }
    }

    generateSquare() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.rectangle(x, y, 30, 30, { label: 'orb', isStatic: true })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y, 'rectangle', 10, 1)
        Matter.Composite.add(this.world, [orb])
    }
    generateTriangle() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.polygon(x, y, 3, 30, { label: 'orb', isStatic: true })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y, 'triangle', 30, 1.25)
        Matter.Composite.add(this.world, [orb])
    }

    generatePentagon() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.polygon(x, y, 5, 50, { label: 'orb', isStatic: true })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y, 'pentagon', 100, 1)
        Matter.Composite.add(this.world, [orb])
    }

    generateAlphaPentagon() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.polygon(x, y, 5, 250, { label: 'orb', isStatic: true })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y, 'alphaPentagon', 3000, 2.5)
        Matter.Composite.add(this.world, [orb])
    }


    generateWall() {
        const x = Math.random() * this.screenWidth
        const y = Math.random() * this.screenHeight

        const width = Math.random() * (3000 - 1000 + 1) + 1000
        const height = Math.random() * (3000 - 1000 + 1) + 1000

        const wall = Matter.Bodies.rectangle(x, y, width, height, { isStatic: true, label: 'wall' })
        this.state.createWall(wall.id, x, y, width, height)
        Matter.Composite.add(this.world, [wall])
    }
    addPlayer(sessionId, name) {
        const initialScore = 800
        this.state.createPlayer(sessionId, name, initialScore, "Basic")

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

            this.state.createPlayerCircle(circle.id, playerId, startX + (x * size * 2), startY + (x * size * 2), size, (50 + (2 * (size / 50) - 1)), 1, "Basic")
            Matter.Composite.add(this.world, [circle])
        }
    }

    pointCircleToTargetXY(targetX, targetY, circle) {
        const xDist = targetX - circle.position.x;
        const yDist = targetY - circle.position.y;
        const angle = Math.atan2(yDist, xDist)
        if (this.state.playerCircles.get(String(circle.id))) {
            this.state.playerCircles.get(String(circle.id)).angle = Number(angle)
        }
    }

    addPlayerBullet(playerId, targetX, targetY, initX, initY, circleId, size = 25) {
        const statePlayerCircleTankName = this.state.playerCircles.get(String(circleId)).tankName
        const count = tankStats[statePlayerCircleTankName].bullets

        for (let x = 0; x < count; x++) {
            const bullet = Matter.Bodies.circle(
                initX,
                initY,
                size,
                { label: "playerBullet", friction: 0, isSensor: true, frictionAir: 0 }
            )

            const speed = tankStats[statePlayerCircleTankName].bulletSpeed
            // Velocity stuff
            const xDist = targetX - initX;
            const yDist = targetY - initY;
            const angle = Math.atan2(yDist, xDist) + x / 10
            const velocityX = Math.cos(angle) * speed
            const velocityY = Math.sin(angle) * speed

            this.bullets[bullet.id] = bullet
            this.state.createPlayerBullet(
                bullet.id,
                playerId,
                initX,
                initY,
                circleId,
                size,
                tankStats[statePlayerCircleTankName].bulletDamage,
                tankStats[statePlayerCircleTankName].bulletPentration
            )
            Matter.Body.setVelocity(bullet, { x: velocityX, y: velocityY })
            Matter.Composite.add(this.world, [bullet])
            setTimeout(() => {
                if (!this.state.playerBullets.get(String(bullet.id))) return

                if (!this.state.playerBullets.get(String(bullet.id)).circleId) this.state.removePlayerBullet(bullet.id); Matter.Composite.remove(this.world, [bullet]);
                this.state.removePlayerBullet(bullet.id)
                Matter.Composite.remove(this.world, [bullet]);
            }, 3000)
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

    processPlayerBullet(playerId, targets) {
        const playerCircles = this.findPlayerCircles(playerId)
        for (const playerCircle of playerCircles) {
            // const statePlayerCircle = this.state.playerCircles.get(String(playerCircle.id))
            // if (!statePlayerCircle) return
            console.log(playerCircle)
            let size = (playerCircle.circleRadius / 4)
            if (size < (this.maxPlayerCircleSize / 7)) size = this.maxPlayerCircleSize / 5
            this.pointCircleToTargetXY(
                targets.targetX,
                targets.targetY,
                playerCircle
            )
            this.addPlayerBullet(
                playerId,
                targets.targetX,
                targets.targetY,
                playerCircle.position.x,
                playerCircle.position.y,
                playerCircle.id,
                size
            )
        }
    }

    processPlayerPointer(playerId, targets) {
        const playerCircles = this.findPlayerCircles(playerId)
        for (const playerCircle of playerCircles) {
            this.pointCircleToTargetXY(
                targets.targetX,
                targets.targetY,
                playerCircle
            )
        }
    }

    processPlayerUpgrade(playerId, tankName) {
        const playerCircles = this.findPlayerCircles(playerId)
        for (const playerCircle of playerCircles) {
            const statePlayerCircle = this.state.playerCircles.get(String(playerCircle.id))
            if (!statePlayerCircle) return
            const statePlayer = this.state.playerCircles.get(String(statePlayerCircle.playerId))
            if (!statePlayer) return

            const playerCircleId = playerCircle.id
            const playerX = statePlayerCircle.x
            const playerY = statePlayerCircle.y
            const playerSize = statePlayerCircle.size
            const playerId = statePlayerCircle.playerId

            this.state.removePlayerCircle(String(playerCircleId))

            this.state.createPlayerCircle(playerCircleId, playerId, playerX, playerY, playerSize, (50 + (2 * (playerSize / 50) - 1)), 1, tankName)

            statePlayer.tankName = tankName
        }
    }

    processPlayerSplit(sessionId) {
        const playerCircles = this.findPlayerCircles(sessionId)
        let amountOfCircles = playerCircles?.length
        if (!playerCircles) return
        for (const circle of playerCircles) {
            if (amountOfCircles >= 4) return
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
            amountOfCircles++
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