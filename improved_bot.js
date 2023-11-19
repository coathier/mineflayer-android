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
    version: process.argv[5],
    auth: 'microsoft',
    logErrors: true,
    disableChatSigning: true,
}

console.log('Connecting to ' + options.host + ':' + options.port + ' controlled by ' + options.main + ' on ' + options.version)
var bot = mineflayer.createBot(options)
bindEvents(bot);

function bindEvents(bot) {
    bot.on('login', () => {
        console.log(bot.username + ' has logged in!')
    })

    bot.on('spawn', () => {
        console.log(bot.username + ' has spawned!')
        bot.chat('/joinqueue factions-pirate')
    })

    bot.on('chat', (username, message) => {
        const buffer = message.split(' ')

        if (buffer.length == 0) return
        if (options.main !== buffer[0].toLowerCase()) return

        bot.chat(buffer.splice(3).join())
    })

    bot.on('error', (err) => {
        console.log('Error attempting to reconnect: ' + err.errno + '.');
        if (err.code == undefined) {
            console.log('Invalid credentials or bot needs to wait because it relogged too quickly.');
            console.log('Will retry to connect in 30 seconds.');
            setTimeout(relog, 30000);
        }
    })

    bot.on('end', (reason) => {
        console.log('Bot has ended ' reason);
        // If set less than 30s you will get an invalid credentials error, which we handle above.
        setTimeout(relog, 30000);
    })

    bot.on('kicked', (reason) => {
        console.log('Kicked for ' + reason)
    })
}

function relog() {
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
}
