import * as net from 'net';
import * as mineflayer from 'mineflayer';

class BotServer {
  private server: net.Server;
  private bot?: mineflayer.Bot;

  constructor(private port: number) {
    this.server = net.createServer();
    this.server.on('connection', this.handleConnection.bind(this));
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening for connection port: ${this.port}`);
    });
  }

  private handleConnection(socket: net.Socket) {
    console.log('A new connection has been established.');
    socket.write('Connection Established.\nValid commands are: connect, say, disconnect, inventory, help');

    socket.on('data', async (chunk) => {
      const buffer = chunk.toString().replace(/\n/g, "").split(' ');

      this.handleCommand(buffer, socket);
    });

    socket.on('end', () => {
      console.log('Closing connection with the client');
    });

    socket.on('error', (err) => {
      socket.write(`Error: ${err}\n`);
    });

    /* This is needed for first time login when the createBot command is
       called it uses console.info to print neccesary login link and code */
    console.info = (message: any) => {
      socket.write(`Info: ${message}\n`);
    };

    if (this.bot) {
      this.bindEvents(this.bot, socket);
    }
  }

  private handleCommand(buffer: string[], socket: net.Socket) {
    if (buffer[0] === 'connect') {
      if (buffer.length !== 5) socket.write('Usage: connect <username> <ip> <port> <version>\n');

      const options: mineflayer.BotOptions = {
        username: buffer[1].toLowerCase(),
        host: buffer[2],
        port: Number(buffer[3]),
        version: buffer[4],
        auth: 'microsoft',
      };

      this.bot = this.connectBot(options, socket);

    } else if (buffer[0] === 'say') {
      if (!this.bot) {
        socket.write('Bot is not connected\n');
        return;
      }

      if (buffer.length <= 1) {
        socket.write('Usage: say <message>\n');
      }

      this.bot.chat(buffer.slice(1).join(' '));

    } else if (buffer[0] === 'disconnect') {
      if (!this.bot) {
        socket.write('Bot is not connected\n');
        return;
      }

      this.bot.quit();
      this.bot = undefined;

    } else if (buffer[0] === 'inventory') {
      if (!this.bot) {
        socket.write('Bot is not connected\n')
        return;
      }

      let items : string[] = []
      this.bot.inventory.items().forEach((item) => {
        items.push(`${item.displayName}: ${item.count}`)
      });

      if (items.length == 0) {
        socket.write(`${this.bot.username}s inventory is empty\n`); 
      } else {
        socket.write(items.join(', ').toString());
      }

    } else if (buffer[0] == 'help'){
      socket.write('Valid commands are: connect, say, disconnect, inventory, help\n');
    } else {
      socket.write('Write help for commands\n')
    }
  }

  private connectBot(options: mineflayer.BotOptions, socket: net.Socket): mineflayer.Bot {
    socket.write('Attempting to connect\n');

    const bot = mineflayer.createBot(options);

    this.bindEvents(bot, socket);
    return bot;
  }

  private bindEvents(bot: mineflayer.Bot, socket: net.Socket) {
    bot.on('login', () => {
      socket.write(`${bot.username} has logged in!\n`);
    });

    bot.on('spawn', async () => {
      socket.write(`${bot.username} has spawned!\n`);
    });

    bot.on('error', (err) => {
      socket.write(`Error: ${err}\n`);
    });

    bot.on('end', (reason) => {
      socket.write(`Ended: ${reason}\n`);
    });

    bot.on('kicked', (reason) => {
      socket.write(`Kicked for: ${reason}\n`);
    });
  }
}

const port = 4639;
const botServer = new BotServer(port);
botServer.start();
