const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 4) {
  console.log('Usage : node viewer.js [<name>] [<amount>]')
  process.exit(1)
}

for (let i = 1; i <= process.argv[3]; i++) {
    createBot(i)
}

function createBot(i) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let bot = mineflayer.createBot({
                host: '127.0.0.1',
                port: '25565',
                username: process.argv[2] + i,
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
                    if (hurt == bot.entity) {
                        diverseStrafe()
                    }
                    if (hurt == target) {
                        bot.setControlState('forward', false)
                        bot.setControlState('sprint', false)
                        diverseStrafe()
                    }
                    //Bot doesn't change target while occupied with one
                    if (target == null) {
                        if (hurt.username == bot.username) {
                            target = bot.nearestEntity(entity => entity.type == 'player' && entity.username != bot.username)
                        }
                    }
                }
            })
        
            let reach = 3
            bot.on('physicsTick', () => {
                if (target != null) {
                    bot.lookAt(target.position.offset(0, 1.65, 0), false)
                    bot.setControlState('sprint', true)
                    bot.setControlState('forward', true)
                    if (bot.entityAtCursor(maxDistance = reach) == target) {
                        bot.attack(target)
                    }
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
            bot.on('spawn', () => resolve(bot))
            bot.on('error', (err) => reject(err))
            setTimeout(() => reject(Error('Took too long to spawn.')), 5000)
        }, i * 500)
    })
}
