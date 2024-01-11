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

  private async handleConnection(socket: net.Socket) {
    console.log('A new connection has been established.');
    socket.write('Connection Established.\nValid commands are: connect, say, disconnect, inventory, exit');

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

    if (this.bot) {
      this.bot.removeAllListeners();
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
        auth: 'offline',
      };

      this.bot = await this.connectBot(options, socket);

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

      let items : String[] = []
      this.bot.inventory.items().forEach((item) => {
        items.push(`${item.displayName}: ${item.count}`)
      });
      socket.write(items.join(', ').toString());

    } else {
      socket.write('Valid commands are: connect, say, disconnect, inventory, exit');
    }
  }

  private async connectBot(options: mineflayer.BotOptions, socket: net.Socket): Promise<mineflayer.Bot> {
    socket.write('Attempting to connect...');
    const bot = mineflayer.createBot(options);
    await this.bindEvents(bot, socket);
    return bot;
  }

  private async bindEvents(bot: mineflayer.Bot, socket: net.Socket) {
    bot.on('login', () => {
      socket.write(`${bot.username} has logged in!`);
    });

    bot.on('spawn', async () => {
      socket.write(`${bot.username} has spawned!`);
      // bot.chat('/joinqueue factions-pirate');
    });

    // bot.on('entityHurt', (entity) => {
    //   if (entity.id === bot.entity.id) {
    //     socket.write(`Bot took damage, health: ${bot.health.toString()}`);
    //   }
    // });

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
