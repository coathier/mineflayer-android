# mineflayer-android
This is a Minecraft AFK client that you can run on a remote computer so you don't have to keep your own computer on.

## Usage
At this stage the server listens 4639. Don't forget that you would need to open the firewall and possibly portforward if you want to run this on a remote server/computer.

You will also need a TCP client to talk to the server if you actually want to use it. I have made a command line TCP client, if you would like to use it go [here](https://github.com/coathier/tcp-cli).

### Starting
Requires [node](https://nodejs.org/en/download) and [ts-node](https://www.npmjs.com/package/ts-node#installation)
```console
$ npm install
$ ts-node server.ts
```

### Running
Through the TCP client you can sent the server the following messages:
* ```connect <username> <ip> <port> <version>``` (Write 1.8, don't write 1.8.9)
* ```disconnect``` Disconnects the bot the the server if it's connected
* ```say <message>``` Bot says the message in the Minecraft chat (also commands)
* ```inventory``` This write all the items the bot has in its inventory.

## Contribute
If you want to make any changes or improvements and feel that you have use for this application feel free to contribute. 

### Needed Improvements
I believe that it still have some issues especially when the TCP client disconnect and reconnect. Some events might not be set or unset etc.

Some more error handling could be done and also so it automatically restarts if need be.

There's quite a big gap insecurity not for the Minecraft account but for the server itself because at the moment anybody could connect to it. Maybe there's a way to make the server only listen for a certain ip or just implement some password authentication.

I don't know about encryption and such but that may be something that is needed.

### Additional Ideas
* Some sort of plugin system so you can load more actions/commands for the bot
* Make it be able to support/run multiple bot's at the same time

## Planning
**You don't actually have to read this it was mostly for development as planning and understanding.**  
Firstly, a proxy is simply something that reroutes your internet traffic and 
masks your IP address conceiving itself as the endpoint. A proxy means that you 
are running the Minecraft client on your local computer and shuting your 
computer of would mean that the bot would disconnect.

If on the other hand you want to run the client on the remote server (computer) 
and be able to shutdown your local computer you need to create a local 
communication client that is only made to communicate with the remote Minecraft 
bot client. This way you would be able to connect to your remote server whenever 
and send commands to the remote Minecraft client.

You could interact with the bot through chat if you create a mod that interupts 
certain messages and forward it to the communication client 

All a proxy does is to mask you IP address.

>>Your Computer
>>Minecraft Bot Client
>
>>Remote Computer
>>Proxy
>
>>Unknown Computer
>>Minecraft Server

Optimal Solution where the minecraft bot client is running on a seperate 
computer which means it can run at all times.

>>Your Computer
>>Communication Client
>
>>Remote Computer
>>Communication Server
>>Mincraft Bot Client
>
>>Unknown Computer
>>Minecraft Server

How I would have to make it for now is that we setup a simple client that can connect with a server that directly reads messages from the client and interprets them as commands. Later we could add a command to connect the server through a proxy. 
