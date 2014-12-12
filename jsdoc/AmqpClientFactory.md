#AmqpClientFactory is used to create instances of AmqpClient.

Creates a new AmqpClientFactory instance.

##Methods

###createAmqpClient

Creates an instance of AmqpClient to run AMQP 0-9-1 protocol over a 
full-duplex WebSocket connection.

**Returns**: _AmqpClient_ - the AmqpClient

###getWebSocketFactory

Returns WebSocketFactory instance that is used to create connection
if Kaazing's WebSocket implementation is used. This method returns a
null if the browser's WebSocket implementation is being used. The
WebSocketFactory instance can be used to set WebSocket related
characteristics such as connection-timeout, challenge handlers, etc.

**Returns**: _WebSocketFactory_ - 

###setWebSocketFactory

Sets WebSocketFactory instance that is used to create connection if
Kaazing's WebSocket implementation is used. This method will throw an 
error if the parameter is null, undefined or not an instance of 
WebSocketFactory.

**Returns**: _Void_ - 

**Params**:  
*   factory _WebSocketFactory_

    instance of WebSocketFactory


