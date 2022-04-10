import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

import { PhaserGame } from './phaser-game/game'


export class Player extends Schema {
  @type("number")
  x = Math.floor(Math.random() * 400);

  @type("number")
  y = Math.floor(Math.random() * 400);

  @type("number")
  angle = 0

  @type("string")
  name = 'playername'

  @type("number")
  score = 0
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type([Player])
  balls = new ArraySchema<Player>();

  createPlayer(sessionId: string) {
    const newPlayer = new Player();
    newPlayer.name = sessionId;
    this.players.set(sessionId, newPlayer);
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }
}

export class PhaserRoom extends Room<State> {
  maxClients = 20;
  game = null;

  onCreate(options) {
    console.log("PhaserRoom created!", options);

    this.setState(new State());

    this.game = new PhaserGame(this.state)

    this.onMessage("move", (client, data) => {
      // console.log("MatterjsRoom received message from", client.sessionId, ":", data);
      // this.state.movePlayer(client.sessionId, data);
      this.game.processPlayerAction(client.sessionId, data);
    });
  }

  onAuth(client, options, req) {
    return true;
  }

  onJoin(client: Client) {
    client.send("hello", "world");
    this.game.addPlayer(client.sessionId);
  }

  onLeave(client) {
    this.game.removePlayer(client.sessionId);
  }

  onDispose() {
    // How do we solve the memory leak
    setTimeout(async () => {
      // destroy old game
      // await this.game.destroy(true, true)
    }, 5000)

    console.log("Dispose PhaserjsRoom");
  }

}
