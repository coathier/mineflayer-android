# Mineflayer-Android
**You don't actually have to read this it was mostly for development as planning and understanding**  
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
