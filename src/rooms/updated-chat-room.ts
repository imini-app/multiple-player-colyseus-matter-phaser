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

export class BallSchema extends Schema {
    @type("number")
    x = 0
    @type("number")
    y = 0
}

export class StateSchema extends Schema {
    @type({ map: UserSchema })
    clients = new MapSchema<UserSchema>();
    @type([BallSchema])
    balls = new ArraySchema<BallSchema>();

    createBall() {
        const newBall = new BallSchema();
        newBall.x = Math.random() * 1200
        newBall.y = Math.random() * 800
        this.balls.push(newBall);
    }

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

        this.onMessage("move", (client, message) => {
            const player = this.state.clients.get(client.sessionId)
            if (message.x) {
                player.x += parseInt(message.x)
            }
            if (message.y) {
                player.y += parseInt(message.y)
            }

            console.log('x', player.x)
            console.log('y', player.y)
        });
        for (let x = 0; x < 10; x++) {
            this.state.createBall()
        }

        for (let i = 100; i < 110; i++) {
            this.state.createBall()
        }
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