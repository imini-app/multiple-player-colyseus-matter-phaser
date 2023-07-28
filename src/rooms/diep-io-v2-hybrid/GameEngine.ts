import Matter from 'matter-js'
import tankStats from './tanks'
export default class GameEngine {
    world = null
    state = null
    engine = null
    maxPlayerCircleSize = 6.8968
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
            Matter.Bodies.rectangle(this.screenWidth / 2, 0, this.screenWidth, 100, { isStatic: true }),
            // Bottom wall
            Matter.Bodies.rectangle(this.screenWidth / 2, this.screenHeight, this.screenWidth, 100, { isStatic: true, label: 'mapEnd' }),
            // Right wall
            Matter.Bodies.rectangle(this.screenWidth, this.screenHeight / 2, 100, this.screenHeight, { isStatic: true, label: 'mapEnd' }),
            // Left wall
            Matter.Bodies.rectangle(0, this.screenHeight / 2, 100, this.screenHeight, { isStatic: true, label: 'mapEnd' })
        ]

        Matter.Composite.add(this.world, walls)

        for (let x = 0; x < 200 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generateSquare(), 1)
        }

        for (let x = 0; x < 77 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generateTriangle(), 1)
        }

        for (let x = 0; x < 33 * this.screenWidth / 1454.54545455; x++) {
            setTimeout(() => this.generatePentagon(), 1)
        }

        for (let x = 0; x < 1 * this.screenWidth / 1454.54545455; x++) {
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
                this.state.playerCircles.get(worldId).x = Number(this.circles[worldId].position.x.toFixed(0));
                this.state.playerCircles.get(worldId).y = Number(this.circles[worldId].position.y.toFixed(0));
            }

            for (const worldId in this.bullets) {
                if (!this.state.playerBullets.get(worldId) || !this.bullets[worldId]) {
                    continue;
                }
                this.state.playerBullets.get(worldId).x = Number(this.bullets[worldId].position.x.toFixed(0));
                this.state.playerBullets.get(worldId).y = Number(this.bullets[worldId].position.y.toFixed(0));
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
                    this.destroyBullet(bodyA);
                }

                if (bodyA.label == "wall" && bodyB.label == "playerBullet") {
                    this.destroyBullet(bodyB);
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

                if (bodyA.label == "playerCircle" && bodyB.label == "playerCircle") {
                    this.playerHitPlayer(bodyA, bodyB)
                }

                if (bodyA.label == "playerCircle" && bodyB.label == "orb") {
                    this.playerHitOrb(bodyA, bodyB)
                }

                if (bodyB.label == "playerCircle" && bodyA.label == "orb") {
                    this.playerHitOrb(bodyB, bodyA)
                }

            }
        })
    }

    levelUp(statePlayerCircle) {
        const statePlayer = this.state.players.get(String(statePlayerCircle.playerId))
        const statePlayerScore = statePlayer.score
        const newLevel = Math.floor(statePlayerScore / 25) - 32
        statePlayer.level = newLevel
        this.upgradePlayer(newLevel, statePlayer)
    }

    upgradePlayer(level, statePlayer) {
        const currentTank = statePlayer.tankName
        const currentLevel = statePlayer.level
        if (level >= 15) {

            const listOfTanksToUpgradeTo = []
            const tankKeys = []

            let x = 0
            for (const tankName in tankStats) {
                const tankObject = tankStats[tankName]
                if (tankObject.upgradesFrom == String(currentTank) && tankObject.level <= currentLevel) {
                    listOfTanksToUpgradeTo.push(tankName)
                    tankKeys.push(x)
                    x++
                }
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

    destroyBullet(matterBullet) {
        this.state.removePlayerBullet(matterBullet.id)
        Matter.Composite.remove(this.world, [matterBullet])
        delete this.bullets[matterBullet.id]
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
                this.destroyBullet(bulletA);
            }
        }

        if (stateBulletBHealth > stateBulletAHealth) {
            smallerBody = bulletA
            const healthDifference = stateBulletB.health - stateBulletA.health
            if (healthDifference > 0) {
                stateBulletB.health = healthDifference
            } else {
                this.destroyBullet(bulletB);
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
                this.destroyBullet(bulletA)
                this.destroyBullet(bulletB)
            }
        }


        if (!smallerBody) return

        this.destroyBullet(smallerBody)
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
            this.destroyBullet(bullet)
            return
        }
        const scoreFormula = statePlayerCircle.size * 10
        const scoreUp = scoreFormula >= 7500 ? 7500 : scoreFormula
        const sizeUp = statePlayerCircle.size / 10
        this.state.players.get(statePlayerCircle.playerId).score -= scoreUp
        this.destroyBullet(bullet)
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
            this.state.createPlayerCircle(playerCircle.id, statePlayerCircle?.playerId, startX, startY, initialSize, (initialSize + (2 * (initialSize / 50) - 1)), 1, "Basic", false)
            if (statePlayer) statePlayer.score = initialScore
            statePlayer.tankName = "Basic"
            this.increasePlayerCircleHp(playerCircle.id)
            this.manageHp(playerCircle.id)
        }
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
            this.destroyBullet(playerBullet)
            return
        }
        const currentSize = statePlayerCircle.size
        const currentScore = statePlayer.score
        const newScore = currentScore + xp
        statePlayer.score = newScore
        const newSize = currentSize + (xp / 100)
        if (newSize < this.screenWidth / this.maxPlayerCircleSize) {
            statePlayerCircle.size = newSize
            const scaleUp = newSize / currentSize
            Matter.Body.scale(playerCircle, scaleUp, scaleUp)
        }

        this.destroyBullet(playerBullet)
        this.state.removeOrb(orb.id)
        Matter.Composite.remove(this.world, [orb])

        this.levelUp(statePlayerCircle)

        this.getXpFromObjects(destroyWhat)
    }

    playerHitOrb(player, orb) {
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
        const statePlayerCircle = this.state.playerCircles.get(String(player.id))
        if (!statePlayerCircle) return
        const playerCircle = player
        if (!playerCircle) return

        const statePlayer = this.state.players.get(String(statePlayerCircle.playerId))

        const playerTankName = statePlayerCircle.tankName
        let playerBodyDamage = tankStats[playerTankName].bodyDamage

        const objectAliveHpDifference = stateOrb.hp - (playerBodyDamage * 2)
        const playerHpLeft = statePlayerCircle.hp - (1 + (0.1 * (xp / 10)))


        if (playerHpLeft <= 0) {
            this.resetPlayer(statePlayerCircle, playerCircle, false)
            Matter.Composite.remove(this.world, [playerCircle])
            return
        }
        if (objectAliveHpDifference > 0) {
            statePlayerCircle.hp = playerHpLeft
            stateOrb.hp = objectAliveHpDifference
            return
        }


        const currentSize = statePlayerCircle.size
        const currentScore = statePlayer.score
        const newScore = currentScore + xp
        statePlayer.score = newScore
        const newSize = currentSize + (xp / 100)
        if (newSize < this.screenWidth / this.maxPlayerCircleSize) {
            statePlayerCircle.size = newSize
            const scaleUp = newSize / currentSize
            Matter.Body.scale(playerCircle, scaleUp, scaleUp)
        }

        this.state.removeOrb(orb.id)
        Matter.Composite.remove(this.world, [orb])

        this.levelUp(statePlayerCircle)

        this.getXpFromObjects(destroyWhat)
    }

    playerHitPlayer(playerA, playerB) {
        const statePlayerACircle = this.state.playerCircles.get(String(playerA.id))
        if (!statePlayerACircle) return
        const statePlayerBCircle = this.state.playerCircles.get(String(playerB.id))
        if (!statePlayerBCircle) return

        const playerATankName = statePlayerACircle.tankName
        const playerBTankName = statePlayerBCircle.tankName

        let playerABodyDamage = tankStats[playerATankName].bodyDamage
        let playerBBodyDamage = tankStats[playerBTankName].bodyDamage

        const playerAHpLeft = Math.floor(statePlayerACircle.hp - playerBBodyDamage)
        const playerBHpLeft = Math.floor(statePlayerBCircle.hp - playerABodyDamage)

        if (playerAHpLeft > 0) {
            statePlayerACircle.hp = playerAHpLeft
        } else {
            const scoreUp = statePlayerACircle.size * 10
            const sizeUp = statePlayerACircle.size / 10
            Matter.Composite.remove(this.world, [playerA.id])
            this.resetPlayer(statePlayerACircle, playerA, false)


            const newSize = statePlayerBCircle.size + sizeUp
            if (newSize < this.screenWidth / this.maxPlayerCircleSize) {
                const statePlayerB = this.state.players.get(String(statePlayerBCircle.playerId))
                const scaleUp = newSize / statePlayerBCircle.size
                statePlayerBCircle.size = newSize
                statePlayerB.score += scoreUp
                Matter.Body.scale(playerB, scaleUp, scaleUp)
            }
        }

        if (playerBHpLeft > 0) {
            statePlayerBCircle.hp = playerBHpLeft
        } else {
            const scoreUp = statePlayerBCircle.size * 10
            const sizeUp = statePlayerBCircle.size / 10
            Matter.Composite.remove(this.world, [playerB.id])
            this.resetPlayer(statePlayerBCircle, playerB, false)

            const newSize = statePlayerACircle.size + sizeUp
            if (newSize < this.screenWidth / this.maxPlayerCircleSize) {
                const statePlayerA = this.state.players.get(String(statePlayerACircle.playerId))
                const scaleUp = newSize / statePlayerACircle.size
                statePlayerACircle.size = newSize
                statePlayerA.score += scoreUp
                Matter.Body.scale(playerA, scaleUp, scaleUp)

            }
        }

    }

    getXpFromObjects(destroyWhat) {
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
        if (startX > this.screenWidth - 50) startX = this.screenWidth - 55
        if (startY > this.screenHeight - 50) startY = this.screenHeight - 55
        if (startX < 50) startX = 55
        if (startY < 50) startY = 55

        for (let x = 0; x < count; x++) {
            const circle = Matter.Bodies.circle(
                startX + (x * size * 2),
                startY + (x * size * 2),
                size,
                { label: "playerCircle" }
            )

            this.circles[circle.id] = circle

            this.state.createPlayerCircle(circle.id, playerId, startX + (x * size * 2), startY + (x * size * 2), size, tankStats["Basic"].maxHealth, 1, "Basic", false)
            Matter.Composite.add(this.world, [circle])
            this.increasePlayerCircleHp(circle.id)
            this.manageHp(circle.id)
        }
    }

    manageHp(matterId) {
        const statePlayerCircle = this.state.playerCircles.get(String(matterId))
        if (!statePlayerCircle) return
        const fullHealthAmount = tankStats[statePlayerCircle.tankName].maxHealth
        if (statePlayerCircle.hp > fullHealthAmount) {
            statePlayerCircle.hp = fullHealthAmount
        }
    }

    increasePlayerCircleHp(matterId) {
        const statePlayerCircle = this.state.playerCircles.get(String(matterId))
        if (!statePlayerCircle) return

        setInterval(() => {
            const fullHealthAmount = tankStats[statePlayerCircle.tankName].maxHealth
            if (statePlayerCircle.hp >= fullHealthAmount) return
            const healthRegenAmount = tankStats[statePlayerCircle.tankName].healthRegen / 1000
            if (statePlayerCircle.hp + healthRegenAmount > fullHealthAmount) {
                statePlayerCircle.hp += fullHealthAmount - statePlayerCircle.hp
            } else {
                statePlayerCircle.hp += healthRegenAmount
            }
        }, 2)
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
        const count = tankStats[statePlayerCircleTankName].turrets
        for (let x = 0; x < count; x++) {
            const xDist = targetX - initX;
            const yDist = targetY - initY;
            const spacing = x / 5 - x / 2.5
            const angle = Math.atan2(yDist, xDist) + spacing
            for (let x = 0; x < tankStats[statePlayerCircleTankName].bullets; x++) {
                setTimeout(() => {
                    const bullet = Matter.Bodies.circle(
                        initX,
                        initY,
                        size,
                        { label: "playerBullet", friction: 0, isSensor: true, frictionAir: 0 }
                    )

                    const speed = tankStats[statePlayerCircleTankName].bulletSpeed
                    // Velocity stuff
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
                        tankStats[statePlayerCircleTankName].bulletPenatration
                    )
                    Matter.Body.setVelocity(bullet, { x: velocityX, y: velocityY })
                    Matter.Composite.add(this.world, [bullet])
                    setTimeout(() => {
                        if (!this.state.playerBullets.get(String(bullet.id))) return
                        this.destroyBullet(bullet)
                    }, 3000)
                }, x * 250)

            }
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
        let speed = 0
        let vy = 0
        let vx = 0

        const playerCircles = this.findPlayerCircles(sessionId)

        for (const playerCircle of playerCircles) {
            if (!playerCircle) {
                return
            }

            const statePlayerCircle = this.state.playerCircles.get(String(playerCircle.id))

            if (data.type == "positive") {
                speed = Number(tankStats[statePlayerCircle.tankName].movementSpeed)
            } else if (data.type == "negative") {
                speed = -Number(tankStats[statePlayerCircle.tankName].movementSpeed)
            }

            const currentVelocity = playerCircle.velocity

            if (data.movementType == "x") {
                vx = speed
            } else {
                vx = currentVelocity.x
            }

            if (data.movementType == "y") {
                vy = speed
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
            const statePlayer = this.state.players.get(String(statePlayerCircle.playerId))
            if (!statePlayer) return

            const playerCircleId = playerCircle.id
            const playerX = statePlayerCircle.x
            const playerY = statePlayerCircle.y
            const playerSize = statePlayerCircle.size
            const playerId = statePlayerCircle.playerId

            this.state.removePlayerCircle(String(playerCircleId))

            this.state.createPlayerCircle(playerCircleId, playerId, playerX, playerY, playerSize, tankStats[tankName].maxHealth, 1, tankName, true)


            statePlayer.tankName = tankName
            this.manageHp(playerCircleId)
            this.increasePlayerCircleHp(playerCircleId)
        }
    }


}