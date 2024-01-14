import * as net from 'net';
import * as mineflayer from 'mineflayer';

console.info = (message: any) => {
  console.log(`Info: ${message}`)
};

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

  private async handleConnection(socket: net.Socket) {
    console.log('A new connection has been established.');
    socket.write('Connection Established.\nValid commands are: connect, say, disconnect, inventory');

    socket.on('data', async (chunk) => {
      const buffer = chunk.toString().split(' ');

      try {
        await this.handleCommand(buffer, socket);
      } catch (error) {
        socket.write(`Error: ${error}`);
      }
    });

    socket.on('end', () => {
      console.log('Closing connection with the client');
    });

    socket.on('error', (err) => {
      socket.write(`Error: ${err}`);
    });

    /* This is needed for first time login when the createBot command is
       called it uses console.info to print neccesary login link and code */
    console.info = (message: any) => {
      socket.write(message);
    };

    if (this.bot) {
      this.bindEvents(this.bot, socket);
    }
  }

  private async handleCommand(buffer: string[], socket: net.Socket) {
    if (buffer[0] === 'connect') {
      if (buffer.length !== 5) throw new Error('Usage: connect <username> <ip> <port> <version>');

      const options: mineflayer.BotOptions = {
        username: buffer[1].toLowerCase(),
        host: buffer[2],
        port: Number(buffer[3]),
        version: buffer[4],
        auth: 'microsoft',
      };

      this.bot = this.connectBot(options, socket);

    } else if (buffer[0] === 'say') {
      if (!this.bot) throw new Error('Bot is not connected.');

      if (buffer.length <= 1) {
        socket.write('Too few arguments to say');
      }

      this.bot.chat(buffer.slice(1).join(' '));

    } else if (buffer[0] === 'disconnect') {
      if (!this.bot) throw new Error('Bot is not connected.');

      this.bot.quit();
      this.bot = undefined;

    } else if (buffer[0] === 'inventory') {
      if (!this.bot) throw new Error('Bot is not connected.');

      let items : string[] = []
      this.bot.inventory.items().forEach((item) => {
        items.push(`${item.displayName}: ${item.count}`)
      });
      if (items.length == 0) {
        socket.write('Empty inventory'); 
      } else {
        socket.write(items.join(', ').toString());
      }

    } else {
      socket.write('Valid commands are: connect, say, disconnect, inventory');
    }
  }

  private connectBot(options: mineflayer.BotOptions, socket: net.Socket): mineflayer.Bot {
    socket.write('Attempting to connect...');

    const bot = mineflayer.createBot(options);

    this.bindEvents(bot, socket);
    return bot;
  }

  private bindEvents(bot: mineflayer.Bot, socket: net.Socket) {
    bot.on('login', () => {
      socket.write(`${bot.username} has logged in!`);
    });

    bot.on('spawn', async () => {
      socket.write(`${bot.username} has spawned!`);
      // bot.chat('/joinqueue factions-pirate');
    });

    bot.on('entityHurt', (entity) => {
      if (entity.id === bot.entity.id) {
        socket.write(`${bot.username} took damage, health: ${bot.health.toString()}`);
      }
    });

    bot.on('error', (err) => {
      socket.write(`Error: ${err}`);
    });

    bot.on('end', (reason) => {
      socket.write(`Ended: ${reason}`);
    });

    bot.on('kicked', (reason) => {
      socket.write(`Kicked for: ${reason}`);
    });
  }
}

const port = 4639;
const botServer = new BotServer(port);
botServer.start();
