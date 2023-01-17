import { Room } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import GameEngine from "./battle-io/GameEngine";
import Matter from 'matter-js'

export class BasePlayerObject extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type("number")
    angle = 0
}

export class Player extends BasePlayerObject {
    @type("string")
    playerId = ''
    @type("string")
    name = "Guest"
    @type("number")
    score = 0
    @type("number")
    hp = 0
}

export class PlayerWeapon extends BasePlayerObject {
    @type("string")
    playerId = ''
    @type("number")
    damage = 0
}

export class AIEnemy extends BasePlayerObject {
    @type("number")
    hp = 0
}

export class AIWeapon extends BasePlayerObject {
    @type("number")
    damage = 0
}


export class Wall extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type("number")
    width = 0
    @type("number")
    height = 0
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    @type({ map: PlayerWeapon })
    playerWeapons = new MapSchema<PlayerWeapon>();

    @type({ map: AIEnemy })
    enemys = new MapSchema<AIEnemy>();

    @type({ map: AIWeapon })
    enemyWeapons = new MapSchema<AIWeapon>();

    @type({ map: Wall })
    walls = new MapSchema<Wall>();
}