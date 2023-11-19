if (process.argv.length < 4 || process.argv.length > 4) {
  console.log('Usage : node viewer.js [<name>] [<password>]')
  process.exit(1)
}

const mineflayer = require('mineflayer')
let reach = 3.5
let target
let lastHitTime = BigInt(0)
const bufferTicks = BigInt(5)

const bot = mineflayer.createBot({
    host: '127.0.0.1',
    port: '25565',
    username: process.argv[2],
    password: process.argv[3],
    version: '1.8.9',
    auth: 'offline'
})

bot.on('entityHurt', (hurt) => {
    if (hurt.type == 'player') {
        if (hurt == target) {
            lastHitTime = bot.time.bigAge
            bot.setControlState('forward', false)
            bot.setControlState('sprint', false)
        }
        if (hurt == bot.entity) {
            target = bot.nearestEntity(entity => entity.type == 'player' && entity.username != bot.username)
        }
    }
})

bot.on('physicsTick', () => {
    if (target != null) {
        diverseStrafe()
        bot.lookAt(target.position.offset(0, 1.65, 0), false)
        if (bot.entityAtCursor(maxDistance = reach) == target) {
            if (bot.time.bigAge - lastHitTime > bufferTicks) {
                bot.setControlState('forward', true)
                bot.setControlState('sprint', true)
            }
            bot.attack(target)
        } else {
            bot.setControlState('forward', true)
            bot.setControlState('sprint', true)
        }
    }
})

function diverseStrafe() {
    if (bot.getControlState('left')) {
        if (Math.random() > 0.75) {
            bot.setControlState('left', false)
            bot.setControlState('right', true)
        }
    } else if (bot.getControlState('right')) {
        if (Math.random() > 0.75) {
            bot.setControlState('right', false)
            bot.setControlState('left', true)
        }
    } else {
        bot.setControlState('left', true)
    }
}

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

bot.on('chat', (username, message) => {
    if (message == 'stop') {
        bot.clearControlStates()
        target = null
    } else if (message == 'attack') {
        target = bot.nearestEntity(entity => entity.type == 'player' && entity.username != bot.username)
    } else {
        const words = message.split(' ')
        if (words[0] == 'reach' && !isNaN(Number(words[1]))) {
            reach = Number(words[1])
            bot.chat('Reach updated to ' + words[1])
        }
    }
})
