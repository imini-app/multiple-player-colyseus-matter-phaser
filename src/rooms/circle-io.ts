import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { GameEngine } from "./matter-game/GameEngine";
import Matter from 'matter-js'

export class UserSchema extends Schema {
    @type("number")
    size = 0
    @type("string")
    name = "Guest"
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type('number')
    score = 0
}

export class BallSchema extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0
}

export class PlayerDuplicateSchema extends Schema {
    @type("number")
    size = 0
    @type("number")
    x = 0
    @type("number")
    y = 0
    @type('string')
    target = "Guest"
}

export class StateSchema extends Schema {
    @type({ map: UserSchema })
    clients = new MapSchema<UserSchema>();

    @type({ map: BallSchema })
    orbs = new MapSchema<BallSchema>();

    @type({ map: PlayerDuplicateSchema })
    playerDuplicates = new MapSchema<PlayerDuplicateSchema>();

    createPlayer(sessionId: string, name: string, x: number, y: number, size: number, score: number) {
        const newUser = new UserSchema();
        newUser.name = name;
        newUser.x = x;
        newUser.y = y;
        newUser.score = score;
        newUser.size = size
        this.clients.set(sessionId, newUser);
    }


    removePlayer(sessionId: string) {
        this.clients.delete(sessionId);
    }

    createPlayerDuplicate(id: string, x: number, y: number, size: number, target: string) {
        const newUser = new PlayerDuplicateSchema();
        newUser.x = x;
        newUser.y = y;
        newUser.size = size
        newUser.target = target
        this.playerDuplicates.set(id, newUser);
    }

    removePlayerDuplicate(id: string) {
        this.clients.delete(id);
    }

    createBall(id: number, x: number, y: number) {
        const newBall = new BallSchema();
        newBall.x = x;
        newBall.y = y;
        this.orbs.set(String(id), newBall);
    }

    removeBall(id: number) {
        this.orbs.delete(String(id));
    }

}

export class GameRoom extends Room {
    maxClients = 20;
    engine = null;

    onCreate(options) {
        this.setState(new StateSchema())

        this.engine = new GameEngine(this.state)

        this.onMessage("message", (client, message) => {
            const player = this.state.clients.get(client.sessionId)
            this.broadcast("messages", `(${player.name}) ${message}`)
        });

        this.onMessage("move", (client, message) => {
            this.engine.processPlayerAction(client.sessionId, message)
        })

        this.onMessage("split", (client, message) => {
            this.engine.processPlayerSplit(client.sessionId, message)
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
        const player = this.state.clients.get(client.sessionId)
        this.engine.removePlayer(client.sessionId)
        this.broadcast("messages", `(${player?.name}) left.`)
    }
}