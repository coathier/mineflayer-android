const mineflayer = require('mineflayer')

if (process.argv.length != 8) {
  console.log(
  'Usage : node ' + process.argv[1] + ' [<alt email>] [<alt password>] [<main name>] [<host>] [<port>] [<version>]'
  )
  process.exit(1)
}

const options = {
    host: process.argv[5],
    port: process.argv[6],
    email: process.argv[2],
    password: process.argv[3],
    main: process.argv[4],
    version: process.argv[7]
}

createBot(options);

function createBot(options) {
    let bot = mineflayer.createBot({
        host: options.host,
        port: options.port,
        username: options.email,
        password: options.password,
        version: options.version,
        auth: 'microsoft',
    })

    bot.on('whisper', (username, message) => {
        if (username != options.main) {
            console.log(username +' whispered \"' + message + '\" to ' + bot.username)
            return
        }
        const words = message.split(' ')
        if (words.lenght == 0) return
        switch (words[0]) {
            case 'help':
                console.log('Avaliable commands: help, say, leave')
                break
            case 'leave':
                bot.quit()
                break
            case 'say':
                if (words[1] == '/tell' ||
                    words[1] == '/msg' ||
                    words[1] == '/w' ||
                    words[1] == '/tellraw' ||
                    console.log('The bot is unable to whisper')
                    break
                }
                bot.chat(words.slice(1).join(' '))
                break
            default:
                console.log('No such command: ' + words[0] + ' type help for commands')
        }
    })

    bot.on('error', (err) => {
        console.log('err ' + err)
    })

    bot.on('end', (reason) => {
        console.log('end' + reason)
    })

    bot.on('kicked', (reason) => {
        console.log('kick' + reason)
    })
}
