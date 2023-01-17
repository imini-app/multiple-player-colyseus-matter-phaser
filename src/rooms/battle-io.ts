import { Room } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import GameEngine from "./battle-io/GameEngine";
import Matter from 'matter-js'

export class BaseObject extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0

}

export class Player extends BaseObject {
    @type("string")
    playerId = ''
    @type("string")
    name = "Guest"
    @type("number")
    score = 0
    @type("number")
    hp = 0
    @type("number")
    tier = 0
}

export class PlayerWeapon extends BaseObject {
    @type("string")
    playerId = ''
    @type("number")
    damage = 0
}

export class AIEnemy extends BaseObject {
    @type("number")
    hp = 0
    @type("string")
    id = ""
}

export class AIWeapon extends BaseObject {
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

    createBaseObject(
        x: number,
        y: number,
        schema: any
    ) {
        const newBaseObject = new schema()
        newBaseObject.x = x
        newBaseObject.y = y
        return newBaseObject
    }

    createPlayer(
        worldId: number,
        playerId: string,
        x: number,
        y: number,
        hp: number
    ) {
        const newPlayerCircle = this.createBaseObject(x, y, Player)
        newPlayerCircle.hp = hp
        newPlayerCircle.playerId = playerId
        this.players.set(String(worldId), newPlayerCircle)
    }

    removePlayer(
        worldId: number
    ) {
        this.players.delete(String(worldId))
    }

    createAIEnemy(
        worldId: number,
        id: string,
        x: number,
        y: number,
        hp: number
    ) {
        const newPlayerCircle = this.createBaseObject(x, y, Player)
        newPlayerCircle.hp = hp
        newPlayerCircle.id = id
        this.enemys.set(String(worldId), newPlayerCircle)
    }

    removeAIEnemy(
        worldId: number
    ) {
        this.enemys.delete(String(worldId))
    }

    createPlayerBullet(
        worldId: number,
        playerId: string,
        x: number,
        y: number,
        damage: number,
    ) {
        const newPlayerBullet = this.createBaseObject(x, y, PlayerWeapon)
        newPlayerBullet.playerId = playerId
        newPlayerBullet.damage = damage
        this.playerWeapons.set(String(worldId), newPlayerBullet)
    }

    removePlayerBullet(
        worldId: number
    ) {
        this.playerWeapons.delete(String(worldId))
    }
}