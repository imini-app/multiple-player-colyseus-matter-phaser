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
    @type("string")
    enemyId = ""
}


export class Barricade extends Schema {
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

    @type({ map: Barricade })
    barricades = new MapSchema<Barricade>();

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
        const newPlayer = this.createBaseObject(x, y, Player)
        newPlayer.hp = hp
        newPlayer.playerId = playerId
        this.players.set(String(worldId), newPlayer)
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
        const newAIEnemy = this.createBaseObject(x, y, Player)
        newAIEnemy.hp = hp
        newAIEnemy.id = id
        this.enemys.set(String(worldId), newAIEnemy)
    }

    removeAIEnemy(
        worldId: number
    ) {
        this.enemys.delete(String(worldId))
    }

    createPlayerWeapon(
        worldId: number,
        playerId: string,
        x: number,
        y: number,
        damage: number,
    ) {
        const newPlayerWeapon = this.createBaseObject(x, y, PlayerWeapon)
        newPlayerWeapon.playerId = playerId
        newPlayerWeapon.damage = damage
        this.playerWeapons.set(String(worldId), newPlayerWeapon)
    }

    removePlayerBullet(
        worldId: number
    ) {
        this.playerWeapons.delete(String(worldId))
    }

    createAIEnemyBullet(
        worldId: number,
        enemyId: string,
        x: number,
        y: number,
        damage: number,
    ) {
        const newAIEnemyBullet = this.createBaseObject(x, y, PlayerWeapon)
        newAIEnemyBullet.enemyId = enemyId
        newAIEnemyBullet.damage = damage
        this.enemyWeapons.set(String(worldId), newAIEnemyBullet)
    }

    removeAIEnemyBullet(
        worldId: number
    ) {
        this.enemyWeapons.delete(String(worldId))
    }

    createBarricade(
        worldId: number,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        const newWall = this.createBaseObject(x, y, Barricade);
        newWall.width = width
        newWall.height = height
        this.barricades.set(String(worldId), newWall);
    }
    removeWall(
        worldId: number
    ) {
        this.barricades.delete(String(worldId));
    }
}

export class GameRoom extends Room {
    maxplayers = 20;
    gameEngine = null;

    onCreate() {
        this.setState(new State())
        this.gameEngine = new GameEngine(this.state)
        this.onMessage("playermovement", (client, message) => {
            this.gameEngine.processPlayerMovement(client.sessionId, message)
        })

        this.onMessage("pointermovement", (client, message) => {
            this.gameEngine.processPlayerPointerMovement(client.sessionId, message)
        })


        this.onMessage("weaponattack", (client, message) => {
            this.gameEngine.processPlayerWeapon(client.sessionId, message)
        })
    }

    update(delTime) {
        Matter.Engine.update(this.gameEngine.engine, delTime)
    }

    onJoin(client, playerOptions) {
        this.gameEngine.addPlayer(client.sessionId, playerOptions?.name)
    }
    onLeave(client) {
        this.gameEngine.removePlayer(client.sessionId)
    }
}