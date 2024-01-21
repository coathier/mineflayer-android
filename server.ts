import * as net from 'net';
import * as mineflayer from 'mineflayer';

function bindEvents(botServer: BotServer, socket: net.Socket) {
  if (!botServer.bot) {
    return;
  }
  botServer.bot.on('login', () => {
    socket.write(`${botServer.bot?.username} has logged in!\n`);
  });

  botServer.bot.on('spawn', async () => {
    socket.write(`${botServer.bot?.username} has spawned!\n`);
  });

  botServer.bot.on('error', (err) => {
    socket.write(`Error: ${err}\n`);
    botServer.bot = undefined;
  });

  botServer.bot.on('end', (reason) => {
    socket.write(`Ended: ${reason}\n`);
    botServer.bot = undefined;
  });

  botServer.bot.on('kicked', (reason) => {
    socket.write(`Kicked for: ${reason}\n`);
    botServer.bot = undefined;
  });
}

interface Command {
  invocation: string;
  execute(botServer: BotServer, socket: net.Socket, parameters: string[]): void;
}

class SayCommand implements Command {
  invocation = 'say';
  execute(botServer: BotServer, socket: net.Socket, parameters: string[]): void {
    if (!botServer.bot) {
      socket.write('Bot is not connected\n');
      return;
    }

    if (parameters.length <= 1) {
      socket.write('Usage: say <message>\n');
    }

    botServer.bot.chat(parameters.slice(1).join(' '));
  }
}

class DisconnectCommand implements Command {
  invocation = 'disconnect';
  execute(botServer: BotServer, socket: net.Socket, parameters: string[]): void {
    if (!botServer.bot) {
      socket.write('Bot is not connected\n');
      return;
    }

    botServer.bot.quit();
    botServer.bot = undefined;
  }
}

class ConnectCommand implements Command {
  invocation = 'connect';
  execute(botServer: BotServer, socket: net.Socket, parameters: string[]): void {
    if (botServer.bot) {
      socket.write('Bot is already connected\n');
      return;
    }

    if (parameters.length !== 5) {
      socket.write('Usage: connect <username> <ip> <port> <version>\n');
      return;
    } 

    const options: mineflayer.BotOptions = {
      username: parameters[1].toLowerCase(),
      host: parameters[2],
      port: Number(parameters[3]),
      version: parameters[4],
      auth: 'microsoft',
    };

    socket.write('Attempting to connect\n');

    try {
      botServer.bot = mineflayer.createBot(options);
      bindEvents(botServer, socket);
    } catch {
      botServer.bot = undefined;
    }
  }
}

class InventoryCommand implements Command {
  invocation = 'inventory';
  execute(botServer: BotServer, socket: net.Socket, parameters: string[]): void {
    if (!botServer.bot) {
      socket.write('Bot is not connected\n')
      return;
    }

    let items : string[] = []
    botServer.bot.inventory.items().forEach((item) => {
      items.push(`${item.displayName}: ${item.count}`)
    });

    if (items.length < 1) {
      socket.write(`${botServer.bot.username}s inventory is empty\n`); 
    } else {
      socket.write(items.join(', ').toString() + '\n');
    }
  }
}

class HelpCommand implements Command {
  invocation = 'help';
  execute(botServer: BotServer, socket: net.Socket, parameters: string[]): void {
    socket.write('Valid commands are: connect, say, disconnect, inventory, help\n');
  }
}

class BotServer {
  private server: net.Server;
  public bot?: mineflayer.Bot;
  private commandMap: { [key: string]: Command } = {};

  constructor(private port: number, private ip?: string) {
    this.server = net.createServer();
    this.server.on('connection', this.handleConnection.bind(this));
  }
  
  public registerCommand(command: Command): void {
    this.commandMap[command.invocation] = command;
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening for connection port: ${this.port}`);
    });
  }

  private handleConnection(socket: net.Socket) {
    if (this.ip && !socket.remoteAddress?.endsWith(this.ip)) {
      socket.end();
      return;
    }

    console.log('A new connection has been established.');
    socket.write('Connection Established.\nValid commands are: connect, say, disconnect, inventory, help\n');

    socket.on('data', async (chunk) => {
      const data = chunk.toString().replace(/\n/g, "").split(' ');

      this.handleRequest(data, socket, this.bot);
    });

    socket.on('end', () => {
      console.log('Closing connection with the client');
    });

    socket.on('error', (err) => {
      socket.write(`Error: ${err}\n`);
    });

    /* 
     * This is needed for first time login when the createBot command is
     * called it uses console.info to print neccesary login link and code
    */
    console.info = (message: any) => {
      socket.write(`Info: ${message}\n`);
    };

    if (this.bot) {
      bindEvents(botServer, socket);
    }
  }

  private handleRequest(request: string[], socket: net.Socket, bot?: mineflayer.Bot) {
    const command = this.commandMap[request[0]];
    if (command) {
      command.execute(this, socket, request);
    } else {
      socket.write('Write help for commands\n')
    }
  }
}


const port = 4639;
const ip = process.argv[2];
const botServer = new BotServer(port, ip);
botServer.registerCommand(new SayCommand());
botServer.registerCommand(new DisconnectCommand());
botServer.registerCommand(new ConnectCommand());
botServer.registerCommand(new InventoryCommand());
botServer.registerCommand(new HelpCommand());
botServer.start();
