import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { GameEngine } from "./diep-io-v1/GameEngine";
import Matter from 'matter-js'

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
}

export class PlayerBulletSchema extends PlayerCircleSchema {
    @type("string")
    circleId = ''
}

export class PlayerSchema extends Schema {
    @type("string")
    name = "Guest"
    @type('number')
    score = 0
}

export class OrbSchema extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type("string")
    type = ''
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

    createPlayerObject(playerId: string, x: number, y: number, size: number, schema: any) {
        const newPlayerCircle = new schema()
        newPlayerCircle.playerId = playerId
        newPlayerCircle.x = x
        newPlayerCircle.y = y
        newPlayerCircle.size = size
        return newPlayerCircle
    }

    createPlayer(sessionId: string, name: string, score: number) {
        const newPlayer = new PlayerSchema();
        newPlayer.name = name;
        newPlayer.score = score;
        this.players.set(sessionId, newPlayer);
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    createPlayerCircle(worldId: number, playerId: string, x: number, y: number, size: number) {
        const newPlayerCircle = this.createPlayerObject(playerId, x, y, size, PlayerCircleSchema)
        this.playerCircles.set(String(worldId), newPlayerCircle)
    }

    removePlayerCircle(worldId: number) {
        this.playerCircles.delete(String(worldId))
    }

    createPlayerBullet(worldId: number, playerId: string, x: number, y: number, size: number, circleId: number) {
        const newPlayerBullet = this.createPlayerObject(playerId, x, y, size, PlayerBulletSchema)
        newPlayerBullet.circleId = String(circleId)
        this.playerBullets.set(String(worldId), newPlayerBullet)
    }

    removePlayerBullet(worldId: number) {
        this.playerBullets.delete(String(worldId))
    }

    createOrb(worldId: number, x: number, y: number, type: string) {
        const newOrb = new OrbSchema();
        newOrb.x = x;
        newOrb.y = y;
        newOrb.type = type
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

}

export class GameRoom extends Room {
    maxplayers = 20;
    engine = null;

    onCreate() {
        this.setState(new StateSchema())

        this.engine = new GameEngine(this.state)

        this.onMessage("message", (client, message) => {
            const player = this.state.players.get(client.sessionId)
            this.broadcast("messages", `(${player.name}) ${message}`)
        });

        this.onMessage("move", (client, message) => {
            this.engine.processPlayerAction(client.sessionId, message)
        })

        this.onMessage("pointermove", (client, message) => {
            this.engine.processPlayerPointer(client.sessionId, message)
        })

        this.onMessage("split", (client, message) => {
            this.engine.processPlayerSplit(client.sessionId)
        })

        this.onMessage("shoot", (client, message) => {
            this.engine.processPlayerBullet(client.sessionId, message)
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