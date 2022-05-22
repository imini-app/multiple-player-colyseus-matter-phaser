import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

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
    createPlayer(sessionId: string, name: string) {
        const newUser = new UserSchema();
        newUser.name = name;
        this.clients.set(sessionId, newUser);
    }

    removePlayer(sessionId: string) {
        this.clients.delete(sessionId);
    }
}

export class UpdatedChatRoom extends Room {
    maxClients = 5;

    onCreate(options) {
        this.setState(new StateSchema())

        this.onMessage("message", (client, message) => {
            const player = this.state.clients.get(client.sessionId)
            this.broadcast("messages", `(${player.name}) ${message}`)
        });
    }
    onJoin(client, options) {
        this.state.createPlayer(client.sessionId, options?.name)
        this.broadcast("messages", `(${options?.name}) joined.`)
    }
    onLeave(client) {
        let player = this.state.clients.get(client.sessionId)
        this.state.removePlayer(client.sessionId)
        this.broadcast("messages", `(${player?.name}) left.`)
    }
}