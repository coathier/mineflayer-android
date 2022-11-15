const mineflayer = require('mineflayer')


if (process.argv.length < 4 || process.argv.length > 4) {
  console.log('Usage : node viewer.js [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
    host: '127.0.0.1',
    port: '25565',
    username: process.argv[2],
    password: process.argv[3],
    version: '1.8.9',
    auth: 'microsoft'
})

let target

bot.on('login', () => {
    bot.setControlState('sprint', true)
})

bot.on('death', () => {
    bot.setControlState('forward', false)
    target = null
})

bot.on('entityGone', (dead) => {
    if (dead == target) {
        bot.setControlState('forward', false)
        target = null
    }
})

bot.on('entityHurt', (hurt) => {
    if (hurt.type == 'player') {
        if (hurt == target) {
            controlForwardMovement(false)
        }
        if (hurt.username == bot.username) {
            target = bot.nearestEntity(entity => entity.type == 'player')
        }
    }
})

bot.on('physicsTick', () => {
    if (target != null) {
        bot.lookAt(target.position.offset(0, 1.35, 0), false)
        if (bot.entityAtCursor(maxDistance=3) == target) {
            bot.attack(target)
        } else {
            controlForwardMovement(true)
        }
    }
})

bot.on('chat', (username, message) => {
    if (message == 'stop') {
        bot.setControlState('forward', false)
        target = null
    }
})

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
