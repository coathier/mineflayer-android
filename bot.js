const mineflayer = require('mineflayer')

if (process.argv.length != 7) {
  console.log(
  'Usage : node bot.js [<alt email>] [<alt password>] [<main name>] [<host>] [<port>]'
  )
  process.exit(1)
}

const options = {
    host: process.argv[5],
    port: process.argv[6]
    email: process.argv[2],
    password: process.argv[3],
    main: process.argv[4]
}

createBot(options);

function createBot(const options) {
    let bot = mineflayer.createBot({
        host: options.host,
        port: options.port,
        username: options.email,
        password: options.password,
        version: '1.8.9',
        auth: 'microsoft'
    })

    bot.on('chat', (username, message) => {
        if (username != options.main) return
        const words = message.split(' ')
        if (words.lenght == 0) return
        switch (words[0]) {
            case 'leave':
                bot.quit()
                process.exit(1)
                break
            case 'say':
                bot.chat(words.slice(1).join(' '))
                break
            default:
                console.log('No such command: ' + message)
        }
    })
}
