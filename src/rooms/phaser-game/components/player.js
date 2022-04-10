export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(state, scene, playerId, x = 200, y = 200, dummy = false) {
    super(scene, x, y, '')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.scene = scene
    this.state = state

    this.prevX = -1
    this.prevY = -1

    this.dead = false
    this.prevDead = false

    this.playerId = playerId
    this.move = {}

    this.setDummy(dummy)

    this.body.setSize(30, 30)

    this.prevNoMovement = true

    // this.setCollideWorldBounds(true)

    scene.events.on('update', this.update, this)
  }

  setDummy(dummy) {
    if (dummy) {
      this.body.setBounce(1)
      this.scene.time.addEvent({
        delay: Phaser.Math.RND.integerInRange(45, 90) * 1000,
        callback: () => this.kill()
      })
    } else {
      this.body.setBounce(0)
    }
  }

  kill() {
    this.dead = true
    this.setActive(false)
  }

  revive(playerId, dummy) {
    this.playerId = playerId
    this.dead = false
    this.setActive(true)
    this.setDummy(dummy)
    this.setVelocity(0)
  }

  update() {
    if (this === undefined) return

    // Handle game being destroyed or player no longer exists
    try {
      /*if (this.move.left) this.setVelocityX(-160)
      else if (this.move.right) this.setVelocityX(160)
      else this.setVelocityX(0)
      if (this.move.up && this.body.onFloor()) this.setVelocityY(-550)*/

      this.state.players.get(this.playerId).x = this.x;
      this.state.players.get(this.playerId).y = this.y;
    } catch (error) {
      //
    }
  }
}
