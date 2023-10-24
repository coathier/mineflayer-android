const mineflayer = require('mineflayer')

if (process.argv.length != 7) {
  console.log(
  'Usage : node bot.js [<alt email>] [<alt password>] [<main name>] [<host>] [<port>]'
  )
  process.exit(1)
}

const options = {
    host: process.argv[5],
    port: process.argv[6],
    email: process.argv[2],
    password: process.argv[3],
    main: process.argv[4]
}

createBot(options);

function createBot(options) {
    let bot = mineflayer.createBot({
        host: options.host,
        port: options.port,
        username: options.email,
        password: options.password,
        version: '1.20.1',
        auth: 'microsoft',
        disableChatSigning: false
    })

    bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
        if (username != options.main) return
        const words = message.split(' ')
        if (words.lenght == 0) return
        switch (words[0]) {
            case 'help':
                //bot.whisper(options.main, 'Avaliable commands: help, msg, leave')
                break
            case 'leave':
                bot.quit()
                process.exit(1)
                break
            case 'msg':
                //TODO: The bot crashes when whispering '/tell'
                bot.chat(words.slice(1).join(' '))
                break
            default:
                //bot.whisper(options.main, 'No such command: ' + words[0] + ' type help for commands')
        }
    })
}
