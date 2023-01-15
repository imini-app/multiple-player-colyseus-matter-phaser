import { Room } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import GameEngine from "./diep-io-v2-hybrid/GameEngine";
import Matter from 'matter-js'
import tankStats from "./diep-io-v2/tanks"

export class PlayerCircleSchema extends Schema {
    @type("number")
    size = 0
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type("number")
    angle = 0
    @type("string")
    playerId = ''
    @type("number")
    hp = 0
    @type("number")
    sight = 0
    @type("string")
    tankName = ''
    @type("boolean")
    upgrading = false
}

export class PlayerBulletSchema extends PlayerCircleSchema {
    @type("string")
    circleId = ''
    @type("number")
    damage = 0
    @type("number")
    health = 0
}

export class PlayerSchema extends Schema {
    @type("string")
    name = "Guest"
    @type("number")
    score = 0
    @type("number")
    level = 0
    @type("string")
    tankName = ""
    @type("string")
    tankUpgradeNames = ""
}

export class OrbSchema extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type("string")
    type = ''
    @type("number")
    hp = 0
    @type("number")
    hpBarSizeMultiplier = 0
}

export class WallSchema extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type("number")
    width = 0
    @type("number")
    height = 0
}


export class StateSchema extends Schema {
    @type({ map: PlayerSchema })
    players = new MapSchema<PlayerSchema>();

    @type({ map: PlayerCircleSchema })
    playerCircles = new MapSchema<PlayerCircleSchema>()

    @type({ map: PlayerCircleSchema })
    playerBullets = new MapSchema<PlayerBulletSchema>()

    @type({ map: OrbSchema })
    orbs = new MapSchema<OrbSchema>();

    @type({ map: WallSchema })
    walls = new MapSchema<WallSchema>();

    @type("string")
    tanks = JSON.stringify(tankStats)

    createPlayerObject(playerId: string, x: number, y: number, size: number, schema: any) {
        const newPlayerCircle = new schema()
        newPlayerCircle.playerId = playerId
        newPlayerCircle.x = x
        newPlayerCircle.y = y
        newPlayerCircle.size = size
        return newPlayerCircle
    }

    createPlayer(sessionId: string, name: string, score: number, tankName: string) {
        const newPlayer = new PlayerSchema();
        newPlayer.name = name;
        newPlayer.score = score;
        newPlayer.tankName = tankName
        newPlayer.level = 1
        this.players.set(sessionId, newPlayer);
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    createPlayerCircle(worldId: number, playerId: string, x: number, y: number, size: number, hp: number, sight: number, tankName: string, upgrading: boolean) {
        const newPlayerCircle = this.createPlayerObject(playerId, x, y, size, PlayerCircleSchema)
        newPlayerCircle.hp = hp
        newPlayerCircle.sight = sight
        newPlayerCircle.tankName = tankName
        newPlayerCircle.upgrading = upgrading
        this.playerCircles.set(String(worldId), newPlayerCircle)
    }

    removePlayerCircle(worldId: number) {
        this.playerCircles.delete(String(worldId))
    }

    createPlayerBullet(
        worldId: number,
        playerId: string,
        x: number,
        y: number,
        circleId: number,
        size: number,
        damage: number,
        health: number
    ) {
        const newPlayerBullet = this.createPlayerObject(playerId, x, y, size, PlayerBulletSchema)
        newPlayerBullet.circleId = String(circleId)
        newPlayerBullet.damage = damage
        newPlayerBullet.health = health
        this.playerBullets.set(String(worldId), newPlayerBullet)
    }

    removePlayerBullet(worldId: number) {
        this.playerBullets.delete(String(worldId))
    }

    createOrb(worldId: number, x: number, y: number, type: string, hp: number, hpBarSizeMultiplier: number) {
        const newOrb = new OrbSchema();
        newOrb.x = x;
        newOrb.y = y;
        newOrb.type = type
        newOrb.hp = hp
        newOrb.hpBarSizeMultiplier = hpBarSizeMultiplier
        this.orbs.set(String(worldId), newOrb);
    }

    removeOrb(id: number) {
        this.orbs.delete(String(id));
    }

    createWall(worldId: number, x: number, y: number, width: number, height: number) {
        const newWall = new WallSchema();
        newWall.x = x;
        newWall.y = y;
        newWall.width = width;
        newWall.height = height;
        this.walls.set(String(worldId), newWall);
    }
    removeWall(worldId: number) {
        this.walls.delete(String(worldId));
    }

}

export class GameRoom extends Room {
    maxplayers = 15;
    engine = null;

    onCreate() {
        this.setState(new StateSchema())

        this.engine = new GameEngine(this.state)

        this.onMessage("move", (client, message) => {
            this.engine.processPlayerAction(client.sessionId, message)
        })

        this.onMessage("pointermove", (client, message) => {
            this.engine.processPlayerPointer(client.sessionId, message)
        })


        this.onMessage("shoot", (client, message) => {
            this.engine.processPlayerBullet(client.sessionId, message)
        })

        this.onMessage("upgrade", (client, message) => {
            this.engine.processPlayerUpgrade(client.sessionId, message)
        })
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
    }

    update(deltaTime) {
        Matter.Engine.update(this.engine.engine, deltaTime)
    }

    onJoin(client, options) {
        this.engine.addPlayer(client.sessionId, options?.name)
        this.broadcast("messages", `(${options?.name}) joined.`)
    }
    onLeave(client) {
        const player = this.state.players?.get(client.sessionId)
        this.engine.removePlayer(client.sessionId)
        this.broadcast("messages", `(${player?.name}) left.`)
    }
}