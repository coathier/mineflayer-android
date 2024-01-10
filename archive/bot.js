const mineflayer = require('mineflayer')

if (process.argv.length != 6) {
  console.log(
  'Usage : node ' + process.argv[1] + '[<main name>] [<host>] [<port>] [<version>]'
  )
  process.exit(1)
}

const options = {
    main: process.argv[2].toLowerCase(),
    host: process.argv[3],
    port: process.argv[4],
    version: process.argv[5]
}

console.log('Connecting to ' + options.host + ':' + options.port + ' controlled by ' + options.main + ' on ' + options.version + '.')
createBot(options);

function createBot(options) {
    let bot = mineflayer.createBot({
        host: options.host,
        port: options.port,
        username: options.email,
        version: options.version,
        auth: 'microsoft',
        logErrors: true,
        disableChatSigning: true,
    })

    bot.on('login', () => {
        console.log(bot.username + ' has joined the server!')
    })

    bot.on('spawn', () => {
        bot.chat('/joinqueue factions-pirate')
    })

    bot.on('chat', (username, message, translate, jsonMsg) => {
        console.log('chat-------------')
        console.log(username)
        console.log(translate)
        console.log(jsonMsg)
        console.log(message)
    })

    bot.on('whisper', (username, message, translate, jsonMsg) => {
        console.log('whisper------------')
        console.log(username)
        console.log(translate)
        console.log(jsonMsg)
        console.log(message)
        if (username.toLowerCase() !== options.main) {
            console.log(username +' whispered \"' + message + '\" to ' + bot.username + '.')
            return
        }
        const words = message.split(' ')
        if (words.lenght == 0) return
    	console.log(bot.username + ' received the message \"' + message + '\".')
        switch (words[0]) {
            case 'help':
                console.log('Avaliable commands: help, say, leave, whisper.')
                break
            case 'leave':
                bot.quit()
                break
            case 'say':
                if (words[1] == '/tell' || words[1] == '/msg' || words[1] == '/w' || words[1] == '/tellraw') {
                    bot.whisper(options.main, words.slice(2).join(' '))
                    break
                }
                bot.chat(words.slice(1).join(' '))
                break
    	    case 'whisper':
                bot.whisper(options.main, words.slice(1).join(' '))
             	break
            default:
                console.log('No such command: ' + words[0] + ' type help for commands.')
        }
    })

    bot.on('error', (err) => {
        console.log('ERROR: ' + err)
    })

    bot.on('end', (reason) => {
        console.log('END: ' + reason)
    })

    bot.on('kicked', (reason) => {
        console.log('KICK: ' + reason)
    })
}
