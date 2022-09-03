import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { GameEngine } from "./matter-game-v2/GameEngine";
import Matter from 'matter-js'

export class PlayerCircleSchema extends Schema {
    @type("number")
    size = 0
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type("string")
    playerId = ''
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
}


export class StateSchema extends Schema {
    @type({ map: PlayerSchema })
    players = new MapSchema<PlayerSchema>();

    @type({ map: PlayerCircleSchema })
    playerCircles = new MapSchema<PlayerCircleSchema>()

    @type({ map: OrbSchema })
    orbs = new MapSchema<OrbSchema>();

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
        const newPlayerCircle = new PlayerCircleSchema()
        newPlayerCircle.playerId = playerId
        newPlayerCircle.x = x
        newPlayerCircle.y = y
        newPlayerCircle.size = size
        this.playerCircles.set(String(worldId), newPlayerCircle)
    }

    removePlayerCircle(worldId: number) {
        this.playerCircles.delete(String(worldId))
    }

    createOrb(worldId: number, x: number, y: number) {
        const newOrb = new OrbSchema();
        newOrb.x = x;
        newOrb.y = y;
        this.orbs.set(String(worldId), newOrb);
    }

    removeOrb(id: number) {
        this.orbs.delete(String(id));
    }

}

export class GameRoom extends Room {
    maxplayers = 20;
    engine = null;

    onCreate(options) {
        this.setState(new StateSchema())

        this.engine = new GameEngine(this.state)

        this.onMessage("message", (client, message) => {
            const player = this.state.players.get(client.sessionId)
            this.broadcast("messages", `(${player.name}) ${message}`)
        });

        this.onMessage("move", (client, message) => {
            this.engine.processPlayerAction(client.sessionId, message)
        })

        this.onMessage("split", (client, message) => {
            this.engine.processPlayerSplit(client.sessionId)
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