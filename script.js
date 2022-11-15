const mineflayer = require('mineflayer')

if (process.argv.length < 3 || process.argv.length > 3) {
  console.log('Usage : node viewer.js [<name>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
    host: '127.0.0.1',
    port: '25565',
    username: process.argv[2],
    password: 'password',
    version: '1.8.9',
    auth: 'offline'
})

let target

bot.on('death', () => {
    bot.clearControlStates()
    target = null
})

bot.on('entityGone', (dead) => {
    if (dead == target) {
        bot.clearControlStates()
        target = null
    }
})

bot.on('entityHurt', (hurt) => {
    if (hurt.type == 'player') {
        if (hurt == target) {
            bot.setControlState('forward', false)
            bot.setControlState('sprint', false)
            diverseStrafe()
        }
        if (hurt.username == bot.username) {
            target = bot.nearestEntity(entity => entity.type == 'player' && entity.username != bot.username)
        }
    }
})

bot.on('physicsTick', () => {
    if (target != null) {
        bot.lookAt(target.position.offset(0, 1.75, 0), false)
        bot.setControlState('sprint', true)
        bot.setControlState('forward', true)
        if (bot.entityAtCursor(maxDistance=3) == target) {
            bot.attack(target)
        }
    }
})

bot.on('chat', (username, message) => {
    if (message == 'stop') {
        bot.clearControlStates()
        target = null
    }
    if (message == 'attack') {
        target = bot.nearestEntity(entity => entity.type == 'player' && entity.username != bot.username)
    }
})

function diverseStrafe() {
    if (bot.getControlState('left')) {
        if (Math.random() > 0.25) {
            bot.setControlState('left', false)
            bot.setControlState('right', true)
        }
    } else if (bot.getControlState('right')) {
        if (Math.random() > 0.25) {
            bot.setControlState('right', false)
            bot.setControlState('left', true)
        }
    } else {
        bot.setControlState('left', true)
    }
}

let lastTime = 0
const bufferTicks = 1.5
function controlForwardMovement(state) {
    if (state == true) {
        if (bot.time.age - lastTime > bufferTicks) {
            bot.setControlState('forward', true)
            lastTime = bot.time.age
        }
    } else if (state == false) {
        bot.setControlState('forward', false)
        lastTime = bot.time.age
    }
}