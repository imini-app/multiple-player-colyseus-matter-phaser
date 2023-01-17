import Matter from 'matter-js'
export default class GameEngine {
    world = null
    state = null
    engine = null

    constructor(roomState) {
        this.engine = Matter.Engine.create()
        this.world = this.engine.world

        this.state = roomState

        this.engine.gravity.y = 0
    }
}