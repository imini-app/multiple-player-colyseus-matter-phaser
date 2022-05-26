import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { GameEngine } from "./matter-game/GameEngine";

export class UserSchema extends Schema {
    @type("string")
    name = "Guest"
    @type("number")
    x = 0
    @type("number")
    y = 0
}


export class StateSchema extends Schema {
    @type({ map: UserSchema })
    clients = new MapSchema<UserSchema>();


    createPlayer(sessionId: string, name: string, x: number, y: number) {
        const newUser = new UserSchema();
        newUser.name = name;
        newUser.x = x;
        newUser.y = y;
        this.clients.set(sessionId, newUser);
    }

    removePlayer(sessionId: string) {
        this.clients.delete(sessionId);
    }

}

export class GameRoom extends Room {
    maxClients = 5;
    engine = null;

    onCreate(options) {
        this.setState(new StateSchema())

        this.engine = new GameEngine(this.state)

        this.onMessage("message", (client, message) => {
            const player = this.state.clients.get(client.sessionId)
            this.broadcast("messages", `(${player.name}) ${message}`)
        });
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