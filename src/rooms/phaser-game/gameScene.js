import { Scene } from 'phaser'
import { Player } from './components/player.js'
import map_json from '../../static/asset/matter-platformer.json'
import fs from 'fs'

export class GameScene extends Scene {
  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.tilemapTiledJSON('map', map_json);
    // HOW TO LOAD IMAGE HERE???
    this.textures.addBase64('kenney_redux_64x64', fs.readFileSync(__dirname + '/../../static/asset/kenney_redux_64x64.png', { encoding: 'base64' }));
  }

  create() {
    console.log('it works!')
    this.playersGroup = this.add.group()
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('kenney_redux_64x64');
    this.groundLayer = map.createLayer(0, tileset, 0, 0);
  }

  update() {
    // console.log('dasdg')
  }

  addPlayer(sessionId, state) {
    const startX = 10 + parseInt((Math.random() * 100).toFixed())
    const startY = 10 + parseInt((Math.random() * 100).toFixed())
    console.log('Add a player in scene', startX, startY)
    const newPlayer = new Player(state, this, sessionId, startX, startY)

    this.playersGroup.add(newPlayer)
    state.createPlayer(sessionId)

    this.physics.add.collider(newPlayer, this.groundLayer);
  }

  removePlayer(sessionId, state) {
    this.playersGroup.children.each(player => {
      if (player.playerId === sessionId) {
        this.playersGroup.remove(player)
        player.destroy()
      }
    })

    state.removePlayer(sessionId)
  }

  processPlayerAction(sessionId, data) {
    const limit = 10;
    let worldPlayer = null;
    this.playersGroup.children.each(player => {
      if (player.playerId === sessionId) {
        worldPlayer = player
      }
    })

    if (!worldPlayer) {
      return;
    }

    if (data.vx) {
      if (data.vx > 0) worldPlayer.setVelocityX(50);
      if (data.vx < 0) worldPlayer.setVelocityX(-50);
    } else {
      worldPlayer.setVelocityX(0);
    }

    if (data.vy) {
      if (data.vy > 0) worldPlayer.setVelocityY(-50);
      if (data.vy < 0) worldPlayer.setVelocityY(50);
    } else {
      worldPlayer.setVelocityY(0);
    }
  }
}
