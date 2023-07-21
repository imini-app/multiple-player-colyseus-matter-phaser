const tankStats = {
    "Tank": {
        upgradesFrom: "None",
        level: 1,
        turrets: 1,
        bullets: 3,
        bulletDamage: 777,
        bulletPenatration: 777,
        bulletSpeed: 37,
        reload: 1,
        healthRegen: 5,
        maxHealth: 50,
        bodyDamage: 5,
        movementSpeed: 5
    },

    "Twin": {
        upgradesFrom: "Tank",
        level: 15,
        turrets: 2,
        bullets: 1,
        bulletDamage: 2,
        bulletPenatration: 2,
        bulletSpeed: 19,
        reload: 6,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 9,
        movementSpeed: 9
    },

    "Sniper": {
        upgradesFrom: "Tank",
        level: 15,
        turrets: 1,
        bullets: 1,
        bulletDamage: 9,
        bulletPenatration: 9,
        bulletSpeed: 20,
        reload: 9.5,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 9,
        movementSpeed: 9
    },

    "Machine-Gun": {
        upgradesFrom: "Tank",
        level: 15,
        turrets: 1,
        bullets: 1,
        bulletDamage: 2,
        bulletPenatration: 9,
        bulletSpeed: 19,
        reload: 5.5,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 9,
        movementSpeed: 9
    },

    "Flank-Guard": {
        upgradesFrom: "Tank",
        level: 15,
        turrets: 2,
        bullets: 1,
        bulletDamage: 9,
        bulletPenatration: 9,
        bulletSpeed: 19,
        reload: 6,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 9,
        movementSpeed: 9
    },

    "Smasher": {
        upgradesFrom: "Tank",
        level: 30,
        turrets: 66,
        bullets: 1,
        bulletDamage: 100,
        bulletPenatration: 100,
        bulletSpeed: 20,
        reload: 10,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 10,
        movementSpeed: 9
    },

    "Ball": {
        upgradesFrom: "Tank",
        level: 777,
        turrets: 66,
        bullets: 1,
        bulletDamage: 777,
        bulletPenatration: 777,
        bulletSpeed: 37,
        reload: 10,
        healthRegen: 777,
        maxHealth: 777,
        bodyDamage: 777,
        movementSpeed: 17
    },
}

export default tankStats