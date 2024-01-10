import * as net from 'net'
import * as mineflayer from 'mineflayer'
const port = 4639
var bot : mineflayer.Bot;

connect_server();

function connect_server() {
    const server = net.createServer();
    bindServer(server, bot);
}

function bindServer(server: net.Server, bot: mineflayer.Bot) {
    server.listen(port, function() {
        console.log('Server listening for connection requests on socket localhost: ' + port);
    });

    server.on('connection', function(socket) {
        console.log('A new connection has been established.');

        socket.write('Connection Establised.');

        socket.on('data', function(chunk) {
            const buffer = chunk.toString().split(' ');
            console.log(buffer[0]);
            if (buffer[0] == "connect") {
                if (buffer.length != 1) {
                    socket.write("Usage: connect <username> <ip> <port> <version>")
                    return;
                }
                const options = {
                    username: buffer[1].toLowerCase(),
                    host: buffer[2],
                    port: 25565,
                    // port: Number(buffer[3]),
                    // version: buffer[3],
                    version: '1.20',
                    auth: 'offline' as any,
                    logErrors: true,
                    // disableChatSigning: true,
                }
                bot = connect_bot(options, socket);
            } else if (buffer[0] == "say") {
                if (bot.)
                if (buffer.length <= 1) {
                    socket.write("To few arguments to say");
                }
                bot.chat(buffer.slice(1).join(' '));
            } else if (buffer[0] == "disconnect") {
                if (bot == undefined) return;
                bot.quit();
                bot = undefined;
            } else {
                socket.write("Valid commands are: connect, say disconnect")
            }
        });

        socket.on('end', function() {
            console.log('Closing connection with the client');
        });

        socket.on('error', function(err) {
            socket.write('Error: ' + err);
        });
    });
}

function bind_socket(options: mineflayer.BotOptions, socket : net.Socket) {
    console.log('A new connection has been established.');

    socket.write('Connection Establised.');

    socket.on('data', function(chunk) {
        const buffer = chunk.toString().split(' ');
        console.log(buffer[0]);
        if (buffer[0] == "connect") {
            if (buffer.length != 1) {
                socket.write("Usage: connect <username> <ip> <port> <version>")
                return;
            }
            const options = {
                username: buffer[1].toLowerCase(),
                host: buffer[2],
                port: 25565,
                // port: Number(buffer[3]),
                // version: buffer[3],
                version: '1.20',
                auth: 'offline' as any,
                logErrors: true,
                // disableChatSigning: true,
            }
            bot = connect_bot(options, socket);
        } else if (buffer[0] == "say") {
            if (buffer.length <= 1) {
                socket.write("To few arguments to say");
            }
            bot.chat(buffer.slice(1).join(' '));
        } else if (buffer[0] == "disconnect") {
            bot.quit();
        } else {
            socket.write("Valid commands are: connect, say disconnect")
        }
    });

    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    socket.on('error', function(err) {
        socket.write('Error: ' + err);
    });
}

function connect_bot(options: mineflayer.BotOptions, socket : net.Socket) {
    socket.write("Attempting to connect...");
    var bot = mineflayer.createBot(options);
    bindEvents(bot, socket);
    return bot;
}

function bindEvents(bot : mineflayer.Bot, socket : net.Socket) {
    bot.on('login', () => {
        socket.write(bot.username + ' has logged in!')
    })

    bot.on('spawn', () => {
        socket.write(bot.username + ' has spawned!')
        bot.chat('/joinqueue factions-pirate')
    })

    bot.on('error', (err) => {
        socket.write('Error ' + err);
    })

    bot.on('end', (reason) => {
        socket.write('Ended ' + reason);
    })

    bot.on('kicked', (reason) => {
        socket.write('Kicked for ' + reason)
    })
}
