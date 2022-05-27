import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import Matter from "matter-js";
import fs from "fs";
import { resolve } from "path";
import { Tilemaps } from "phaser";

export class MatterPlatformGameEngine {
  mapData = null;
  engine = null;
  world = null;
  runner = null;
  state = null;
  balls = [];
  players = {};
  targets = {};
  tileProperties = {};

  constructor(state, mapJsonFilePath) {
    // Set up matter.js stuffs
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    /*this.runner = Runner.create({
      delta: 1000 / 60,
      isFixed: true,
    });*/
    this.state = state; // The shared state

    this.engine.gravity.y = 2;
    this.mapData = JSON.parse(fs.readFileSync(resolve(mapJsonFilePath)).toString());

    this.init();
  }

  init() {
    this.addTileMap()
    this.initUpdateEvents()
    this.initCollisionEvents()
  }

  addTileMap() {
    const mapData = this.mapData
    for (const layer of this.mapData.layers) {
      let i = 0;
      for (const tileId of layer.data) {
        const params = this.findTilePropertyById(mapData.tilesets[0].tiles, tileId);
        const width = mapData.tilewidth;
        const height = mapData.tileheight;
        const rowNumber = parseInt(String(i / mapData.width));
        const columnNumber = i - rowNumber * mapData.width;
        const centerX = columnNumber * width + width / 2;
        const centerY = rowNumber * height + height / 2;
        let shouldCollide = false;
        if (params && params.properties) {
          for (const property of params.properties) {
            if (property.name === 'collides' && property.value) {
              shouldCollide = true;
            }
          }
        }
        // console.log(tileId, rowNumber, columnNumber, centerX, centerY, params);
        if (shouldCollide) {
          // console.log(rowNumber, columnNumber, centerX, centerY, params);
          // TODO: improve to read polygons
          const tileBody = Matter.Bodies.rectangle(centerX, centerY, width, height, { isStatic: true, render: { fillStyle: 'red' } });
          tileBody.label = 'tile';
          // tileBody.tileProperties = params.properties;
          this.tileProperties[tileBody.id] = params.properties;
          //console.log('Add static rectangle');
          Matter.Composite.add(this.world, [tileBody]);
        }
        i++;
      }
    }

    const mapWidth = this.mapData.width * this.mapData.tilewidth;
    const mapHeight = this.mapData.height * this.mapData.tileheight;
    Matter.Composite.add(this.world, [
      // walls
      Matter.Bodies.rectangle(mapWidth/2, 0, mapWidth, 10, { isStatic: true }),
      Matter.Bodies.rectangle(mapWidth/2, mapHeight, mapWidth, 10, { isStatic: true }),
      Matter.Bodies.rectangle(mapWidth, mapHeight/2, 10, mapHeight, { isStatic: true }),
      Matter.Bodies.rectangle(0, mapHeight/2, 10, mapHeight, { isStatic: true })
    ]);
  }

  findTilePropertyById(tiles, id) {
    for (const tile of tiles) {
      if (tile.id === id - 1) {
        return tile
      }
    }
  }

  initUpdateEvents() {
    // Register events
    Matter.Events.on(this.engine, "afterUpdate", () => {
      for (const key in this.players) {
        if (!this.state.players.get(key) || !this.players[key]) {
          continue;
        }
        this.state.players.get(key).x = this.players[key].position.x;
        this.state.players.get(key).y = this.players[key].position.y;
        this.state.players.get(key).angle = this.players[key].angle;
        this.state.players.get(key).vx = this.players[key].velocity.x;
        this.state.players.get(key).vy = this.players[key].velocity.y;
      }
    });
  }

  initCollisionEvents() {
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      // console.log("Evento: ", event)
      const pairs = event.pairs[0];
      if (pairs.bodyA.label === 'player') {
        console.log(this.tileProperties[pairs.bodyB.id]);
      }
      if (pairs.bodyB.label === 'player') {
        console.log(this.tileProperties[pairs.bodyA.id]);
      }
    });
  }

  addPlayer(sessionId) {
    const startX = /*100 + parseInt((Math.random() * 500).toFixed());*/ 200;
    const startY = 100;
    console.log('Add a player', startX, startY)
    const newPlayer = Matter.Bodies.rectangle(startX, startY, 32, 32, { inertia: Infinity, friction: 0, isStatic: false, render: { fillStyle: '#ffffff' } });
    newPlayer.label = 'player';
    this.players[sessionId] = newPlayer;
    this.state.createPlayer(sessionId)
    Matter.Composite.add(this.world, [newPlayer]);
  }

  removePlayer(sessionId) {
    const player = this.players[sessionId]
    this.state.removePlayer(sessionId)
    console.log('remove player', sessionId)
    Matter.Composite.remove(this.world, [player]);
  }

  processPlayerAction(sessionId, data) {
    const worldPlayer = this.players[sessionId];
    if (!worldPlayer) {
      return;
    }

    const currentVelocity = worldPlayer.velocity
    let newVx = currentVelocity.x;
    let newVy = currentVelocity.y;
    if (data.vx) {
      newVx = data.vx * 5;
    } else {
      newVx = 0;
    }

    if (data.vy) {
      newVy = data.vy * 20;
    }
    Matter.Body.setVelocity(worldPlayer, { x: newVx, y: newVy });
    this.state.players.get(sessionId).vx = newVx;
    this.state.players.get(sessionId).vy = newVy;
  }
}

export class Player extends Schema {
  @type("number")
  x = Math.floor(Math.random() * 400);

  @type("number")
  y = Math.floor(Math.random() * 400);

  @type("number")
  vx = 0

  @type("number")
  vy = 0

  @type("number")
  angle = 0

  @type("string")
  name = 'playername'

  @type("number")
  score = 0

  @type("string")
  target = 'left'
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type([Player])
  balls = new ArraySchema<Player>();

  setBalls(balls) {
    this.balls = balls;
  }

  addBall(ball) {
    this.balls.push(ball);
  }

  createPlayer(sessionId: string, target: string = '') {
    const newPlayer = new Player();
    newPlayer.name = sessionId;
    newPlayer.target = target;
    this.players.set(sessionId, newPlayer);
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }

  movePlayer(sessionId: string, movement: any) {
    if (movement.x) {
      this.players.get(sessionId).x += movement.x * 10;

    } else if (movement.y) {
      this.players.get(sessionId).y += movement.y * 10;
    }
  }
}

export class MatterjsPlatformRoom extends Room<State> {
  maxClients = 4;
  engine = null;

  onCreate(options) {
    console.log("MatterjsRoom created!", options);

    this.setState(new State());

    this.engine = new MatterPlatformGameEngine(this.state, __dirname + '/../static/asset/large.json');

    this.onMessage("move", (client, data) => {
      // console.log("MatterjsRoom received message from", client.sessionId, ":", data);
      // this.state.movePlayer(client.sessionId, data);
      this.engine.processPlayerAction(client.sessionId, data);
    });

    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  update(deltaTime) {
    // console.log(new Date().getTime())
    Matter.Engine.update(this.engine.engine, deltaTime)
  }

  onAuth(client, options, req) {
    return true;
  }

  onJoin(client: Client) {
    client.send("hello", "world");
    this.engine.addPlayer(client.sessionId);
    // this.state.createPlayer(client.sessionId);
  }

  onLeave(client) {
    this.engine.removePlayer(client.sessionId);
    // this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log("Dispose MatterjsRoom");
  }

}
