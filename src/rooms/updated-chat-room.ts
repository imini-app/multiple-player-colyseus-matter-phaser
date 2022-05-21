import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class UserSchema extends Schema {
    @type("string")
    name = "Guest"
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
    maxClients = 10;

    onCreate(options) {
        this.setState(new StateSchema())

        this.onMessage("message", (client, message) => {
            const player = this.state.clients.get(client.sessionId)
            this.broadcast("messages", `(${player.name}) ${message}`)
        });
    }
    onJoin(client, options) {
        console.log('Option', options)
        this.state.createPlayer(client.sessionId, options?.name)
    }
    onLeave(client) {
        this.state.removePlayer(client.sessionId)
    }
}