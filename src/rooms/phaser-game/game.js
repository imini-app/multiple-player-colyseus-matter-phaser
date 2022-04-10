import { config } from './config.js'

export class PhaserGame extends Phaser.Game {
  constructor(state) {
    super(config)
    this.state = state
  }

  addPlayer(sessionId) {
    // console.log(this.scene, 'scene')
    this.scene.getAt(0).addPlayer(sessionId, this.state);
  }

  removePlayer(sessionId) {
    this.scene.getAt(0).removePlayer(sessionId, this.state);
  }

  processPlayerAction(sessionId, data) {
    this.scene.getAt(0).processPlayerAction(sessionId, data);
  }
}
