import Matter from 'matter-js'
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
    tankStats = {
        "Basic": {
            upgradesFrom: "Unknown",
            level: 1,
            turrets: 1,
            bullets: 1,
            bulletDamage: 3,
            bulletPenatration: 3,
            bulletSpeed: 15,
            reload: 5,
            healthRegen: 1,
            maxHealth: 51,
            bodyDamage: 1,
            movementSpeed: 3,
            accuracy: 1
        },

        "BasicRammer": {
            upgradesFrom: "Basic",
            level: 15,
            turrets: 0,
            bullets: 0,
            bulletDamage: 0,
            bulletPenatration: 0,
            bulletSpeed: 0,
            reload: 0,
            healthRegen: 5,
            maxHealth: 51,
            bodyDamage: 10,
            movementSpeed: 4,
            accuracy: 0
        },

        "BasicDroneUser": {
            upgradesFrom: "Basic",
            level: 15,
            turrets: 1,
            bullets: 4,
            ammunition: "drones",
            bulletDamage: 2,
            bulletPenatration: 8,
            bulletSpeed: 13,
            reload: 0.2,
            healthRegen: 5,
            maxHealth: 51,
            bodyDamage: 5,
            movementSpeed: 4,
            accuracy: 1
        },

        "Overseer": {
            upgradesFrom: "Basic",
            level: 30,
            turrets: 1,
            bullets: 8,
            ammunition: "drones",
            bulletDamage: 5,
            bulletPenatration: 13,
            bulletSpeed: 15,
            reload: 0.3,
            healthRegen: 5,
            maxHealth: 53,
            bodyDamage: 5,
            movementSpeed: 8,
            accuracy: 1
        },

        "Overlord": {
            upgradesFrom: "Basic",
            level: 45,
            turrets: 1,
            bullets: 16,
            ammunition: "drones",
            bulletDamage: 12,
            bulletPenatration: 17,
            bulletSpeed: 19,
            reload: 0.7,
            healthRegen: 9,
            maxHealth: 57,
            bodyDamage: 7,
            movementSpeed: 12,
            accuracy: 1
        },


        "Sniper": {
            upgradesFrom: "Basic",
            level: 15,
            turrets: 1,
            bullets: 1,
            bulletDamage: 4,
            bulletPenatration: 4,
            bulletSpeed: 20,
            reload: 3,
            healthRegen: 4,
            maxHealth: 54,
            bodyDamage: 4,
            movementSpeed: 4,
            accuracy: 1
        },

        "Assassin": {
            upgradesFrom: "Sniper",
            level: 30,
            turrets: 1,
            bullets: 1,
            bulletDamage: 7,
            bulletPentration: 7,
            bulletSpeed: 25,
            reload: 6,
            healthRegen: 7,
            maxHealth: 57,
            bodyDamage: 7,
            movementSpeed: 9,
            accuracy: 1,
            sight: 2.5,
            desription: "This is a tank from diep.io it's bullet damage, pentration and speed are the same as the Spam-Shooter. This tank can counter the One-Shot-Wonder tank with it's movement speed + high sight range and shoot a bunch of bullets at the enemy most likely killing it."
        },

        "One-Shot-Wonder": {
            upgradesFrom: "Assassin",
            level: 45,
            turrets: 1,
            bullets: 1,
            bulletDamage: 77,
            bulletPentration: 77,
            bulletSpeed: 77,
            reload: 3,
            healthRegen: 1,
            maxHealth: 20,
            bodyDamage: 1,
            movementSpeed: 2,
            accuracy: 1,
            sight: 4,
            desription: "My own design! This is deadly and long range combat but with it's low hp and regen suck at melee/close combat. Best used at ambushing enemys with its long sight range and deadly bullets though it can be countered by a bullet spammer or realy fast rammer seeing as it's reload is low."
        },

        "Spam-Shooter AKA Pea-Shooter": {
            upgradesFrom: "Assassin",
            level: 45,
            turrets: 1,
            bullets: 10,
            bulletDamage: 7,
            bulletPentration: 7,
            bulletSpeed: 25,
            reload: 10,
            healthRegen: 10,
            maxHealth: 60,
            bodyDamage: 10,
            movementSpeed: 10,
            accuracy: 1,
            sight: 1.5,
            desription: "My own design! This tank was inspired by the repeater but with more bullets from plants vs zombies 2. This tank will shoot 10 medium strenth bullets for each time it's reload time ends. This tank is a bullet spammer and a good choice for newbs when the playing this game. This tank has a unique abilty: Survive for over 5 minutes and you're bullet stats change and become stronger."
        },

        "Twin-Destroyer": {
            upgradesFrom: "Assassin",
            level: 45,
            turrets: 2,
            bullets: 1,
            bulletDamage: 33,
            bulletPentration: 33,
            bulletSpeed: 33,
            reload: 14,
            healthRegen: 7,
            maxHealth: 7,
            bodyDamage: 7,
            movementSpeed: 30,
            accuracy: 1,
            sight: 3,
            desription: "My own design! Design from Copter.io Dual Gun Sniper. With it's super duper high reload this tank has highest DPS of all the tanks released in this game but it also has the lowest hp of all tanks! Best used at long range or against low DPS tank or even One-Shot-Wonder tank(due to it's high movementSpeed)."
        },

        "Smasher": {
            upgradesFrom: "BasicRammer",
            level: 30,
            turrets: 0,
            bullets: 0,
            bulletDamage: 0,
            bulletPenatration: 0,
            bulletSpeed: 0,
            reload: 0,
            healthRegen: 9,
            maxHealth: 54,
            bodyDamage: 20,
            movementSpeed: 9,
            accuracy: 0,
            sight: 1
        },

        "Spike": {
            upgradesFrom: "Smasher",
            level: 45,
            turrets: 0,
            bullets: 0,
            bulletDamage: 0,
            bulletPenatration: 0,
            bulletSpeed: 0,
            reload: 0,
            healthRegen: 12,
            maxHealth: 54,
            bodyDamage: 40,
            movementSpeed: 12,
            accuracy: 0,
            sight: 2
        },

        "Chaser": {
            upgradesFrom: "Smasher",
            level: 45,
            turrets: 0,
            bullets: 0,
            bulletDamage: 0,
            bulletPenatration: 0,
            bulletSpeed: 0,
            reload: 0,
            healthRegen: 10,
            maxHealth: 60,
            bodyDamage: 30,
            movementSpeed: 20,
            accuracy: 0,
            sight: 2.5
        },

        "Machine-Gun": {
            upgradesFrom: "Basic",
            level: 15,
            turrets: 1,
            bullets: 2,
            bulletDamage: 3,
            bulletPenatration: 4,
            bulletSpeed: 19,
            reload: 10,
            healthRegen: 9,
            maxHealth: 54,
            bodyDamage: 4,
            movementSpeed: 4,
            accuracy: 0.3,
            sight: 1
        },

        "Destroyer": {
            upgradesFrom: "Machine-Gun",
            level: 30,
            turrets: 1,
            bullets: 1,
            bulletDamage: 30,
            bulletPenatration: 30,
            bulletSpeed: 15,
            reload: 7,
            healthRegen: 9,
            maxHealth: 54,
            bodyDamage: 4,
            movementSpeed: 4,
            accuracy: 1,
            sight: 1.5
        },

        "Dayeeter": {
            upgradesFrom: "Machine-Gun",
            level: 45,
            turrets: 1,
            bullets: 1,
            bulletDamage: 25,
            bulletPenatration: 25,
            bulletSpeed: 25,
            reload: 10,
            healthRegen: 9,
            maxHealth: 54,
            bodyDamage: 4,
            movementSpeed: 4,
            accuracy: 1,
            sight: 2
        },

        "Annihilator": {
            upgradesFrom: "Destroyer",
            level: 45,
            turrets: 1,
            bullets: 1,
            bulletDamage: 5,
            bulletPenatration: 5,
            bulletSpeed: 5,
            reload: 14.5,
            healthRegen: 15,
            maxHealth: 70,
            bodyDamage: 10,
            movementSpeed: 20,
            accuracy: 1,
            sight: 2,
            description: "The Ramming Destroyer. It's reload is the highest in game but the bullet stats are weak. DPS is really low."
        },

        "Twestroyer": {
            upgradesFrom: "Destroyer",
            level: 45,
            turrets: 1,
            bullets: 2,
            bulletDamage: 25,
            bulletPenatration: 25,
            bulletSpeed: 20,
            reload: 7,
            healthRegen: 9,
            maxHealth: 54,
            bodyDamage: 4,
            movementSpeed: 4,
            accuracy: 1,
            sight: 2,
            desription: "Two epic bullets that can take out the Annihilator's Bullet(if both hit) and live. Each bullet is nearly as strong as the destroyer's meaning that it can easily counter most bullets from the destroyer branch. The ousider being Destrutor(60 damage and pentration). So if you are going to take out enemy's in close range you should pick this tank."
        },

        "Destructor": {
            upgradesFrom: "Destroyer",
            level: 45,
            turrets: 1,
            bullets: 1,
            bulletDamage: 60,
            bulletPenatration: 60,
            bulletSpeed: 35,
            reload: 5,
            healthRegen: 10,
            maxHealth: 50,
            bodyDamage: 10,
            movementSpeed: 10,
            accuracy: 1,
            sight: 2,
            desription: "Tank Vs Destructor = Destructor bullet hit's enemy while taking damage by the enemy bullets touch's enemy. BOOM! One Shot One Kill! Yup that is true! This tank's bullets are the strongest of the destroyer branch this can be an effective rammer too! But the enemy has to have less than half of it's hp. You can't ram a one shot wonder tank due to it's powerful bullets. This tank is best used for taking pop shots at enemys."
        },
        "Twin": {
            upgradesFrom: "Basic",
            level: 15,
            turrets: 2,
            bullets: 1,
            bulletDamage: 2,
            bulletPenatration: 1,
            bulletSpeed: 19,
            reload: 9,
            healthRegen: 5,
            maxHealth: 50,
            bodyDamage: 4,
            movementSpeed: 5,
            accuracy: 1,
            sight: 1,
        },

        "Triple-Shot": {
            upgradesFrom: "Twin",
            level: 30,
            turrets: 3,
            bullets: 1,
            bulletDamage: 6,
            bulletPenatration: 2,
            bulletSpeed: 23,
            reload: 9,
            healthRegen: 6,
            maxHealth: 54,
            bodyDamage: 8,
            movementSpeed: 9,
            accuracy: 1,
            sight: 1.5,
        },

        "Penta-Shot": {
            upgradesFrom: "Triple-Shot",
            level: 45,
            turrets: 5,
            bullets: 1,
            bulletDamage: 5,
            bulletPenatration: 6,
            bulletSpeed: 28,
            reload: 13,
            healthRegen: 7,
            maxHealth: 58,
            bodyDamage: 12,
            movementSpeed: 13,
            accuracy: 1,
            sight: 2,
        },

        "Spread-Shot": {
            upgradesFrom: "Triple-Shot",
            level: 45,
            turrets: 11,
            bullets: 1,
            bulletDamage: 4,
            bulletPenatration: 4,
            bulletSpeed: 28,
            reload: 10,
            healthRegen: 7,
            maxHealth: 58,
            bodyDamage: 12,
            movementSpeed: 13,
            accuracy: 1,
            sight: 2,
        },


        // "Flank-Guard": {
        //     bulletDamage: 9,
        //     bulletPenatration: 5,
        //     bulletSpeed: 19,
        //     reload: 9,
        //     healthRegen: 9,
        //     maxHealth: 54,
        //     bodyDamage: 4,
        //     movementSpeed: 9,
        //     accuracy: 1
        // },


    }

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
                    this.playEatOrb(bodyA, bodyB)
                }

                if (bodyA.label == "orb" && bodyB.label == "playerBullet") {
                    this.playEatOrb(bodyB, bodyA)
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
                    this.state.removeOrb(bodyA.id)
                    Matter.Composite.remove(this.world, [bodyA])
                    this.generateSquare()
                }

                if (bodyA.label == "wall" && bodyB.label == "orb") {
                    this.state.removeOrb(bodyB.id)
                    Matter.Composite.remove(this.world, [bodyB])
                    this.generateSquare()
                }

                if (bodyA.label == "playerCircle" && bodyB.label == "playerCircle") {
                    this.playerEatPlayer(bodyA, bodyB)

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

            }
        })
    }

    bulletHitBullet(bulletA, bulletB) {
        const stateBulletA = this.state.playerBullets.get(String(bulletA.id))
        if (!stateBulletA) return
        const stateBulletB = this.state.playerBullets.get(String(bulletB.id))
        if (!stateBulletB) return
        const sameOrNot = stateBulletA.playerId == stateBulletB.playerId
        if (sameOrNot) return

        let smallerBody = null

        if (stateBulletA.size > stateBulletB.size) {
            smallerBody = bulletB
            const sizeDifference = stateBulletA.size - stateBulletB.size
            const pastSize = stateBulletA.size
            if (sizeDifference > 10) {
                stateBulletA.size = sizeDifference
                const scaleDown = stateBulletA.size / pastSize
                Matter.Body.scale(bulletA, scaleDown, scaleDown)
            } else {
                this.state.removePlayerBullet(bulletA.id)
                Matter.Composite.remove(this.world, [bulletA])
            }
        }

        if (stateBulletB.size > stateBulletA.size) {
            smallerBody = bulletA
            const sizeDifference = stateBulletB.size - stateBulletA.size
            const pastSize = stateBulletB.size
            if (sizeDifference > 100) {
                stateBulletB.size = sizeDifference
                const scaleDown = stateBulletB.size / pastSize
                Matter.Body.scale(bulletB, scaleDown, scaleDown)
            } else {
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
        const scoreUp = statePlayerCircle.size * 10
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
            this.state.createPlayerCircle(playerCircle.id, statePlayerCircle?.playerId, startX, startY, initialSize, (initialSize + (2 * (initialSize / 50) - 1)))
            if (statePlayer) statePlayer.score = initialScore
        }
    }

    playerEatPlayer(playerA, playerB) {
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

    playEatOrb(playerBullet, orb) {
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
            default:
                xp = 10
                destroyWhat = ''
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
        if (currentSize < this.screenWidth / this.maxPlayerCircleSize) {
            const newSize = currentSize + xp / 10
            statePlayerCircle.size = newSize
            const scaleUp = newSize / currentSize
            Matter.Body.scale(playerCircle, scaleUp, scaleUp)
        }

        this.state.removePlayerBullet(playerBullet.id)
        Matter.Composite.remove(this.world, [playerBullet])
        this.state.removeOrb(orb.id)
        Matter.Composite.remove(this.world, [orb])
        if (destroyWhat == 'rectangle') {
            this.generateSquare()
        } else if (destroyWhat == 'triangle') {
            this.generateTriangle()
        } else if (destroyWhat == 'pentagon') {
            this.generatePentagon()
        } else {
            return
        }
    }

    generateSquare() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.rectangle(x, y, 30, 30, { label: 'orb', isSensor: true })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y, 'rectangle', 10)
        Matter.Composite.add(this.world, [orb])
    }
    generateTriangle() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.polygon(x, y, 3, 30, { label: 'orb', isSensor: true })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y, 'triangle', 30)
        Matter.Composite.add(this.world, [orb])
    }

    generatePentagon() {
        let x = Math.random() * this.screenWidth
        let y = Math.random() * this.screenHeight

        let orb = Matter.Bodies.polygon(x, y, 5, 50, { label: 'orb', isSensor: true })
        this.orbs[orb.id] = orb
        this.state.createOrb(orb.id, x, y, 'pentagon', 100)
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
            this.state.createPlayerCircle(circle.id, playerId, startX + (x * size * 2), startY + (x * size * 2), size, (50 + (2 * (size / 50) - 1)))
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

    addPlayerBullet(playerId, targetX, targetY, initX, initY, circleId, size = 25, damage = 5, speed = 21, count = 1) {

        for (let x = 0; x < count; x++) {
            const bullet = Matter.Bodies.circle(
                initX,
                initY,
                size,
                { label: "playerBullet", friction: 0, isSensor: true, frictionAir: 0 }
            )
            // Velocity stuff
            const xDist = targetX - initX;
            const yDist = targetY - initY;
            const angle = Math.atan2(yDist, xDist) + x / 10
            const velocityX = Math.cos(angle) * speed

            const velocityY = Math.sin(angle) * speed

            this.bullets[bullet.id] = bullet
            this.state.createPlayerBullet(bullet.id, playerId, initX, initY, size, Number(circleId), size / damage * 2)
            Matter.Body.setVelocity(bullet, { x: velocityX, y: velocityY })
            Matter.Composite.add(this.world, [bullet])
            setTimeout(() => {
                if (!this.state.playerBullets.get(String(bullet.id))) return

                if (!this.state.playerBullets.get(String(bullet.id)).circleId) this.state.removePlayerBullet(bullet.id); Matter.Composite.remove(this.world, [bullet]);
                this.state.removePlayerBullet(bullet.id)
                Matter.Composite.remove(this.world, [bullet]);
            }, 3500)
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
            let size = (playerCircle.circleRadius / 4)
            if ((playerCircle.circleRadius / 4) < (this.maxPlayerCircleSize / 7)) size = this.maxPlayerCircleSize / 5
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