const tankStats = {
    "Basic": {
        upgradesFrom: "Unknown",
        level: 1,
        turrets: 1,
        bullets: 1,
        bulletDamage: 3,
        bulletPenatration: 3,
        bulletSpeed: 15,
        reload: 8,
        healthRegen: 1,
        maxHealth: 51,
        bodyDamage: 1,
        movementSpeed: 3,
        accuracy: 1,
    },

    "Overseer": {
        upgradesFrom: "Sniper",
        level: 30,
        turrets: 2,
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
        upgradesFrom: "Overseer",
        level: 45,
        turrets: 4,
        bullets: 8,
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

    "Necromancer": {
        upgradesFrom: "Overseer",
        level: 45,
        turrets: 2,
        bullets: 32,
        ammunition: "drones",
        bulletDamage: 5,
        bulletPenatration: 23,
        bulletSpeed: 15,
        reload: 0.7,
        healthRegen: 9,
        maxHealth: 57,
        bodyDamage: 7,
        movementSpeed: 12,
        accuracy: 1
    },


    "Factory": {
        upgradesFrom: "Overseer",
        level: 45,
        turrets: 1,
        bullets: 8,
        ammunition: "drones",
        bulletDamage: 20,
        bulletPenatration: 23,
        bulletSpeed: 15,
        reload: 1.2,
        healthRegen: 9,
        maxHealth: 57,
        bodyDamage: 7,
        movementSpeed: 11,
        accuracy: 1
    },


    "Sniper": {
        upgradesFrom: "Basic",
        level: 15,
        turrets: 1,
        bullets: 1,
        bulletDamage: 8,
        bulletPenatration: 4,
        bulletSpeed: 20,
        reload: 12,
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
        bulletDamage: 12,
        bulletPenatration: 8,
        bulletSpeed: 24,
        reload: 9,
        healthRegen: 8,
        maxHealth: 58,
        bodyDamage: 8,
        movementSpeed: 8,
        accuracy: 1,
        sight: 2.5,
        desription: "This is a tank from diep.io it's bullet damage, pentration and speed are the same as the Spam-Shooter. This tank can counter the One-Shot-Wonder tank with it's movement speed + high sight range and shoot a bunch of bullets at the enemy most likely killing it."
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
        maxHealth: 75,
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
        maxHealth: 120,
        bodyDamage: 40,
        movementSpeed: 12,
        accuracy: 0,
        sight: 2
    },

    "Machine-Gun": {
        upgradesFrom: "Basic",
        level: 15,
        turrets: 1,
        bullets: 2,
        bulletDamage: 3,
        bulletPenatration: 4,
        bulletSpeed: 15,
        reload: 5,
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
        reload: 8,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 4,
        movementSpeed: 4,
        accuracy: 1,
        sight: 1.5
    },

    "Annihilator": {
        upgradesFrom: "Destroyer",
        level: 45,
        turrets: 1,
        bullets: 1,
        bulletDamage: 5,
        bulletPenatration: 5,
        bulletSpeed: 5,
        reload: 0.5,
        healthRegen: 15,
        maxHealth: 70,
        bodyDamage: 10,
        movementSpeed: 17,
        accuracy: 1,
        sight: 2,
        description: "The Ramming Destroyer. It's reload is one of the highest in game but the bullet stats are weak. DPS is really low."
    },


    "Twin": {
        upgradesFrom: "Basic",
        level: 15,
        turrets: 2,
        bullets: 1,
        bulletDamage: 3.5,
        bulletPenatration: 1,
        bulletSpeed: 19,
        reload: 6,
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
        reload: 6,
        healthRegen: 6,
        maxHealth: 54,
        bodyDamage: 8,
        movementSpeed: 9,
        accuracy: 1,
        sight: 1.5,
    },

    "Triplet": {
        upgradesFrom: "Triple-Shot",
        level: 45,
        turrets: 3,
        bullets: 2,
        bulletDamage: 6,
        bulletPenatration: 6,
        bulletSpeed: 25,
        reload: 2,
        healthRegen: 6,
        maxHealth: 54,
        bodyDamage: 8,
        movementSpeed: 9,
        accuracy: 1,
        sight: 2,
    },

    "Penta-Shot": {
        upgradesFrom: "Triple-Shot",
        level: 45,
        turrets: 5,
        bullets: 1,
        bulletDamage: 5,
        bulletPenatration: 6,
        bulletSpeed: 28,
        reload: 2,
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
        reload: 5,
        healthRegen: 7,
        maxHealth: 58,
        bodyDamage: 12,
        movementSpeed: 13,
        accuracy: 1,
        sight: 2,
    },


    "Flank-Guard": {
        upgradesFrom: "Basic",
        level: 15,
        turrets: 2,
        bullets: 1,
        bulletDamage: 9,
        bulletPenatration: 5,
        bulletSpeed: 19,
        reload: 6,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 4,
        movementSpeed: 9,
        accuracy: 1,
        sight: 1
    },

    "Tri-Angle": {
        upgradesFrom: "Flank-Guard",
        level: 30,
        turrets: 3,
        bullets: 1,
        bulletDamage: 9,
        bulletPenatration: 5,
        bulletSpeed: 19,
        reload: 4,
        healthRegen: 11,
        maxHealth: 56,
        bodyDamage: 6,
        movementSpeed: 12,
        accuracy: 1,
        sight: 2
    },

    "Booster": {
        upgradesFrom: "Tri-Angle",
        level: 45,
        turrets: 5,
        bullets: 1,
        bulletDamage: 9,
        bulletPenatration: 5,
        bulletSpeed: 19,
        reload: 3,
        healthRegen: 12,
        maxHealth: 62,
        bodyDamage: 12,
        movementSpeed: 15,
        accuracy: 1,
        sight: 3
    },


    "Twin-Flank": {
        upgradesFrom: "Flank-Guard",
        level: 30,
        turrets: 4,
        bullets: 1,
        bulletDamage: 6,
        bulletPenatration: 9,
        bulletSpeed: 19,
        reload: 5,
        healthRegen: 9,
        maxHealth: 54,
        bodyDamage: 4,
        movementSpeed: 6,
        accuracy: 1,
        sight: 1
    },
}

export default tankStats