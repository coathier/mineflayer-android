import mineflayer from "mineflayer"

if (process.argv.length != 7) {
  console.log('Usage : node ' + process.argv[1] + '[<main name>] [<bot name>] [<host>] [<port>] [<version>]')
  process.exit(1)
}

const options = {
    main: process.argv[2].toLowerCase(),
    username: process.argv[3],
    host: process.argv[4],
    port: Number(process.argv[5]),
    version: process.argv[6],
    auth: 'microsoft',
    logErrors: true,
    disableChatSigning: true,
}

console.log('Bot options: ' + options.host + ':' + options.port + ' controlled by ' + options.main + ' on ' + options.version)
connect();

function bindEvents(bot : mineflayer.Bot) {
    bot.on('login', () => {
        console.log(bot.username + ' has logged in!')
    })

    bot.on('spawn', () => {
        console.log(bot.username + ' has spawned!')
        bot.chat('/joinqueue factions-pirate')
    })

    // bot.on('chat', (message) => {
    //     const buffer = message.split(' ')

    //     if (buffer.length == 0) return
    //     if (options.main !== buffer[0].toLowerCase()) return

    //     bot.chat(buffer.splice(3).join(' '))
    // })

    bot.on('error', (err) => {
        console.log('Error ' + err);
    })

    bot.on('end', (reason) => {
        console.log('Ended ' + reason);
    })

    bot.on('kicked', (reason) => {
        console.log('Kicked for ' + reason)
    })
}

function connect() {
    console.log("Attempting to connect...");
    var bot = mineflayer.createBot(options as mineflayer.BotOptions);
    bindEvents(bot);
}
