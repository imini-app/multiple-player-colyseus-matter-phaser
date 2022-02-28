import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import Matter from "matter-js";

export class GameEngine {
  engine = null;
  world = null;
  runner = null;
  state = null;
  balls = [];
  players = {};
  targets = {};

  constructor(state) {
    // Set up matter.js stuffs
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    /*this.runner = Runner.create({
      delta: 1000 / 60,
      isFixed: true,
    });*/
    this.state = state; // The shared state

    this.engine.gravity.y = 0;
    this.init();
  }

  init() {
    // Runner.run(this.runner, this.engine);

    const bodyA = Matter.Bodies.circle(400, 400, 30,
      {
        render: {
          fillStyle: '#ffffff'
        },
        isStatic: false,
        restitution: 1,
        density: 0.001,
      }
    );
    this.balls.push(bodyA);

    /*const bodyB = Bodies.circle(100, 205, 25.6 / 2, { isStatic: false, render: { fillStyle: '#ffffff' } });
    Body.setVelocity(bodyB, { x: 10, y:0 });
    this.balls.push(bodyB);

    const bodyC = Bodies.circle(500, 195, 25.6 / 2, { isStatic: false, render: { fillStyle: '#ffffff' } });
    Body.setVelocity(bodyC, { x: -10, y:0 });
    this.balls.push(bodyC);

    const bodyD = Bodies.circle(500, 195, 25.6 / 2, { isStatic: false, render: { fillStyle: '#ffffff' } });
    Body.setVelocity(bodyD, { x: -10, y:0 });
    this.balls.push(bodyD);*/

    Matter.Composite.add(this.world, [bodyA]);

    Matter.Composite.add(this.world, [
      // walls
      Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    // Left target, x, y, width, height
    const leftTarget = Matter.Bodies.rectangle(30, 600 / 2, 20, 100, { isStatic: true, restitution: 1.0, render: { fillStyle: 'red' } });
    // Left target
    const rightTarget = Matter.Bodies.rectangle(800 - 30, 600 / 2, 20, 100, { isStatic: true, render: { fillStyle: 'blue' } });
    Matter.Composite.add(this.world, [leftTarget, rightTarget]);

    this.targets['left'] = leftTarget;
    this.targets['right'] = rightTarget;

    let counter = 0;

    /*
    Events.on(this.runner, 'afterTick', (event) => {
      counter += 1;

      // make bodyA move up and down
      // body is static so must manually update velocity for friction to work
      var py = 300 + 100 * Math.sin(this.engine.timing.timestamp * 0.002);
      var modY = counter % 200;
      //Body.setVelocity(bodyA, { x: 0, y: py - bodyA.position.y });
      // Body.setPosition(bodyA, { x: 100, y: py });
      Body.setPosition(bodyA, { x: 100, y: modY });
      Body.setAngle(bodyA, -Math.PI * modY / 100);

      Body.setPosition(bodyB, { x: 400, y: - modY + 400 });
      Body.setAngle(bodyB, -Math.PI * modY / 100);
    });*/

    /*Events.on(this.runner, 'afterTick', (event) => {
      counter += 1;
      // Every one tick, generate a new ball
      if (counter % 120 == 119) {
        // this.addBall({ x: 700, y: 100 + parseInt((Math.random() * 500).toFixed()) })
      }
    })*/

    this.initUpdateEvents()
    this.initCollisionEvents()
  }

  initUpdateEvents() {
    // Register events
    Matter.Events.on(this.engine, "afterUpdate", () => {
      // Update the state
      // console.log(bodyA.position.x, bodyA.position.y, 'bodyA position');
      // apply the x position of the physics ball object back to the colyseus ball object
      // this.state.ball.x = this.physicsWorld.ball.position.x;
      // ... all other ball properties
      // loop over all physics players and apply their properties back to colyseus players objects
      for (let i = 0; i < this.balls.length; i++) {
        this.state.balls[i].x = this.balls[i].position.x;
        this.state.balls[i].y = this.balls[i].position.y;
        this.state.balls[i].angle = this.balls[i].angle;
        this.state.balls[i].vx = this.balls[i].velocity.x;
        this.state.balls[i].vy = this.balls[i].velocity.y;

        // Need to improve velocity and angle velocity
      }

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
      const pairs = event.pairs;
      let target = null;
      let foundPlayer = false;

      if (pairs[0].bodyA.id === this.targets['left'].id
        || pairs[0].bodyB.id === this.targets['left'].id) {
        console.log('left target touched');
        target = 'left';
        for (const playerId in this.players) {
          if (pairs[0].bodyA.id === this.players[playerId].id
            || pairs[0].bodyB.id === this.players[playerId].id) {
            console.log('player session', playerId);
            foundPlayer = true;
            if (this.state.players.get(playerId).target === 'left') {
              console.log(playerId, 'score!!')
            }
          }
        }
      }
      if (pairs[0].bodyA.id === this.targets['right'].id
        || pairs[0].bodyB.id === this.targets['right'].id) {
        console.log('right target touched');
        target = 'right';
        for (const playerId in this.players) {
          if (pairs[0].bodyA.id === this.players[playerId].id
            || pairs[0].bodyB.id === this.players[playerId].id) {
            console.log('player session', playerId);
            foundPlayer = true;
            if (this.state.players.get(playerId).target === 'right') {
              console.log(playerId, 'score!!')
            }
          }
        }
      }

      // Ball touched the targets. we have a score recorded.
      if (target && !foundPlayer) {
        this.setTeamScore(target);
      }
    });
  }

  setTeamScore(target) {
    this.state.players.forEach((player, key) => {
      if (player.target === target) {
        player.score++;
        console.log(player.score, 'new score for team', target)
      }
    });

    const startX = 100 + parseInt((Math.random() * 500).toFixed());
    const startY = 100 + parseInt((Math.random() * 500).toFixed());

    for (const ball of this.balls) {
      Matter.Body.setPosition(ball, { x: startX, y: startY });
      Matter.Body.setVelocity(ball, { x: 0, y: 0 });
    }
  }

  addPlayer(sessionId) {
    const startX = 100 + parseInt((Math.random() * 500).toFixed());
    const startY = 100 + parseInt((Math.random() * 500).toFixed());
    console.log('Add a player', startX, startY)
    const newPlayer = Matter.Bodies.circle(startX, startY, 25.6, { isStatic: false, friction: 0.01, restitution: 1.0, density: 2, render: { fillStyle: '#ffffff' } });

    // Find the proper target
    let leftTeamCount = 0;
    let rightTeamCount = 0;
    this.state.players.forEach((value, key) => {
      if (value.target === 'left') {
        leftTeamCount++;
      } else {
        rightTeamCount++;
      }
    });

    const target = leftTeamCount <= rightTeamCount ? 'left' : 'right';

    this.players[sessionId] = newPlayer;
    this.state.createPlayer(sessionId, target)
    Matter.Composite.add(this.world, [newPlayer]);
  }

  removePlayer(sessionId) {
    const player = this.players[sessionId]
    this.state.removePlayer(sessionId)
    console.log('remove player', sessionId)
    Matter.Composite.remove(this.world, [player]);
  }

  processPlayerAction(sessionId, data) {
    const limit = 10;
    const worldPlayer = this.players[sessionId];
    if (!worldPlayer) {
      return;
    }

    const currentVelocity = worldPlayer.velocity
    let newVx = currentVelocity.x;
    let newVy = currentVelocity.y;
    if (data.vx) {
      if (Math.abs(data.vx + newVx) < limit) {
        newVx += data.vx;
      }
    }

    if (data.vy) {
      if (Math.abs(data.vy + newVy) < limit) {
        newVy += data.vy;
      }
    }

    // console.log('set velocity', newVx, newVy);

    Matter.Body.setVelocity(worldPlayer, { x: newVx, y: newVy });
    this.state.players.get(sessionId).vx = newVx;
    this.state.players.get(sessionId).vy = newVy;
  }

  addBall(data) {
    const startX = data.x;
    const startY = data.y;
    console.log('Add a ball from client click', startX, startY)
    const newBall = Matter.Bodies.circle(startX, startY, 25.6 / 2, { isStatic: false, restitution: 1, friction: 0.02, render: { fillStyle: '#ffffff' } });
    this.balls.push(newBall);

    this.state.addBall(new Player());
    Matter.Composite.add(this.world, [newBall]);
    setTimeout(() => {
      Matter.Body.setVelocity(newBall, { x: -6, y: 0 });
    }, 1000);
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

  createPlayer(sessionId: string, target: string) {
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

export class MatterjsRoom extends Room<State> {
  maxClients = 4;
  engine = null;

  onCreate(options) {
    console.log("MatterjsRoom created!", options);

    this.setState(new State());

    this.engine = new GameEngine(this.state);

    const stateBalls = this.engine.balls.map(ball => {
      return new Player();
    })

    this.state.setBalls(stateBalls);

    this.onMessage("move", (client, data) => {
      // console.log("MatterjsRoom received message from", client.sessionId, ":", data);
      // this.state.movePlayer(client.sessionId, data);
      this.engine.processPlayerAction(client.sessionId, data);
    });

    this.onMessage("addBall", (client, data) => {
      this.engine.addBall(data);
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
