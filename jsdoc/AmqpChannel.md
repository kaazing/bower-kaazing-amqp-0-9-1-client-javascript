#AmqpChannel is a channel opened with the AMQP broker. Use AmqpClient.openChannel() to create a new AmqpChannel.

AmqpChannel

##Methods

###flowChannel

This method asks the peer to pause or restart the flow of content data sent by
 a consumer. This is a simple flow-control mechanism that a peer can use to avoid
 overflowing its queues or otherwise finding itself receiving more messages than
 it can process. Note that this method is not intended for window control. It does
 not affect contents returned by Basic.Get-Ok methods.

**Returns**: _AmqpChannel_ - 

**Params**:  
*   active _Bit_

    start/stop content frames
 <p>
*   callback _Function_

    Function to be called on success
 <p>


###flowOkChannel

Confirms to the peer that a flow command was received and processed.

**Returns**: _AmqpChannel_ - 

**Params**:  
*   active _Bit_

    current flow setting
 <p>
*   callback _Function_

    Function to be called on success
 <p>


###recoverBasic

This method asks the server to redeliver all unacknowledged messages on a
 specified channel. Zero or more messages may be redelivered.  This method
 replaces the asynchronous Recover.

**Returns**: _AmqpChannel_ - 

**Params**:  
*   requeue _Bit_

    requeue the message
 <p>
*   callback _Function_

    Function to be called on success
 <p>


###selectTx

This method sets the channel to use standard transactions. The client must use this
 method at least once on a channel before using the Commit or Rollback methods.

**Returns**: _AmqpChannel_ - 

**Params**:  
*   callback _Function_

    Function to be called on success
 <p>


###commitTx

This method commits all message publications and acknowledgments performed in
 the current transaction.  A new transaction starts immediately after a commit.

**Returns**: _AmqpChannel_ - 

**Params**:  
*   callback _Function_

    Function to be called on success
 <p>


###rollbackTx

This method abandons all message publications and acknowledgments performed in
 the current transaction. A new transaction starts immediately after a rollback.
 Note that unacked messages will not be automatically redelivered by rollback;
 if that is required an explicit recover call should be issued.

**Returns**: _AmqpChannel_ - 

**Params**:  
*   callback _Function_

    Function to be called on success
 <p>


###closeChannel

This method indicates that the sender wants to close the channel. This 
may be due to internal conditions (e.g. a forced shut-down) or due to an error 
handling a specific method, i.e. an exception. When a close is due to an
exception, the sender provides the class and method id of the method which
caused the exception.

<p> AmqpChannel.closeChannel() function that supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:
<pre>
    var channel = ...;
    var config = {replyCode: int1, 
                  replyText, 'foo', 
                  classId: int2,
                  methodId: int3};
    channel.closeChannel(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                       {
                         replyCode: int_value,
                         replyText: 'str_value',
                         classId: int_value,
                         methodId: int_value
                       }
                       </pre>
Default values are as follows: 
                       <pre>
                         replyCode  --  0
                         replyText  --  "" 
                         classId    --  0
                         methodId   --  0
                         callback   -- undefined
                       </pre>
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###declareExchange

This method creates an exchange if it does not already exist, and if the 
exchange exists, verifies that it is of the correct and expected class.

<p> AmqpChannel.declareExchange() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:
<pre>
   var channel = ...;
   var config = {exchange: myExchangeName, type: 'direct'};
   channel.declareExchange(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          exchange: 'str_value',
                          type: 'direct'|'fanout'|'headers'|'topic',
                          passive: true|false,
                          durable: true|false,
                          noWait: true|false,
                          args: {  }
                        }
                       </pre>
'exchange' specifies the name of the exchange and is a required param. The
legal values of the required 'type' param are 'direct', 'fanout', 'headers', 
and 'topic' Boolean params 'passive', 'durable', and 'noWait' have a default
value of false. Param 'args' is an optional param that can be used to pass 
in additional properties. 
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###deleteExchange

This method deletes an exchange. When an exchange is deleted all queue 
bindings on the exchange are cancelled.

<p> AmqpChannel.deleteExchange() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {exchange: myExchangeName, noWait: false};
   channel.deleteExchange(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          exchange: 'exchange_name_str_value',
                          ifUnused: true|false,
                          noWait: true|false
                        }
                       </pre>
Required parameter 'exchange' specifies the name of the exchange. Default 
values of the optional boolean parameters 'ifUnused' and 'noWait' is false.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###declareQueue

This method creates or checks a queue. When creating a new queue the client 
can specify various properties that control the durability of the queue and 
its contents, and the level of sharing for the queue.

<p> AmqpChannel.declareQueue() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {queue: myQueueName, exclusive: false};
   channel.declareQueue(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          queue: 'queue_name_str_value',
                          passive: true|false,
                          durable: true|false,
                          exclusive: true|false,
                          autoDelete: true|false,
                          noWait: true|false,
                          args: { }
                        }
                       </pre>
Required parameter 'queue' specifies the queue name. Boolean parameters
'passive', 'durable', 'noWait', 'exclusive' and 'autoDelete' are optional 
with false as the default value. Param 'args' is an optional param that 
can be used to pass in additional properties for declaration.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###bindQueue

This method binds a queue to an exchange. Until a queue is bound it will not
receive any messages. In a classic messaging model, store-and-forward queues
are bound to a direct exchange and subscription queues are bound to a topic
exchange. Developers should invoke this function as shown below:

<p> AmqpChannel.bindQueue() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {queue: myQueueName, 
                 exchange: myExchangeName,
                 routingKey: key};
   channel.bindQueue(config, callback);
</pre>

<p>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          queue: 'queue_name_str_value',
                          exchange: 'exchange_name_str_value',
                          routingKey: 'key_str_value'
                          noWait: true|false,
                          args: { }
                        }
                       </pre>
Required parameter 'queue' specifies the queue name. Required parameter
'exchange' specifies the exchange name. Required parameter 'routingKey'
specifies the key to be used to bind the queue to the exchange. Boolean
parameter 'noWait' is optional with false as the default value. Param 'args'
is an optional amd can be used to pass in additional properties for 
declaration.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###unbindQueue

This method unbinds a queue from an exchange.

<p> AmqpChannel.unbindQueue() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {queue: myQueueName, exchange: exchangeName, routingKey: key};
   channel.unbindQueue(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          queue: 'queue_name_str_value',
                          exchange: 'exchange_name_str_value',
                          routingKey: 'routingKey_str_value',
                          args: { }
                        }
                       </pre>
Required parameter 'queue' specifies the queue name. Required parameter
'exchange' specifies the exchange name. Required parameter 'routingKey'
specifies the key that was used to bind the queue to the exchange. Parameter 
'args' is optional and can be used to pass in additional properties for 
declaration.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###purgeQueue

This method removes all messages from a queue which are not awaiting
acknowledgment.

<p> AmqpChannel.purgeQueue() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {queue: myQueueName};
   channel.purgeQueue(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          queue: 'queue_name_str_value',
                          noWait: true|false
                        }
                       </pre>
Required parameter 'queue' specifies the queue name. Boolean parameter 
'noWait' is optional with false as the default value.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###deleteQueue

This method deletes a queue. When a queue is deleted any pending messages 
are sent to a dead-letter queue if this is defined in the server configuration, 
and all consumers on the queue are cancelled.

<p> AmqpChannel.deleteQueue() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {queue: myQueueName, ifEmpty: true};
   channel.deleteQueue(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       {
                         queue: 'queue_name_str_value',
                         ifUnused: true|false,
                         ifEmpty: true|false,
                         noWait: true|false
                       }
Required parameter 'queue' specifies the queue name. Boolean parameters 
'ifUnused', 'ifEmpty', and 'noWait' are optional with false as the default 
value. 
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###qosBasic

This method requests a specific quality of service. The QoS can be specified
for the current channel or for all channels on the connection. The particular
properties and semantics of a qos method always depend on the content class 
semantics. Though the qos method could in principle apply to both peers, it 
is currently meaningful only for the server.

<p> AmqpChannel.qosBasic() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {prefetchSize: size, prefetchCount: count, global: true};
   channel.qosBasic(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          prefetchSize: size_long_value_in_octets,
                          prefetchCount: count_short_value_in_octets,
                          global: true|false
                        }
                       </pre>
Parameter 'prefetchSize' and 'prefetchCount' are required. Boolean parameter
'global' is optional with false as the default value.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###consumeBasic

This method asks the server to start a "consumer", which is a transient 
request for messages from a specific queue. Consumers last as long as the 
channel they were declared on, or until the client cancels them.

<p> AmqpChannel.consumeBasic() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {queue: myQueueName, 
                 consumerTag: clientTag, 
                 exclusive: false,
                 noLocal: true};
   channel.consumeBasic(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          queue: 'queue_name_str_value',
                          consumerTag: 'consumer_tag_str_value',
                          noLocal: true|false,
                          noAck: true|false,
                          exclusive: true|false,
                          noWait: true|false,
                          args: { }
                        }
                       </pre>

Required parameter 'queue' specifies the queue name. Parameter
'consumerTag' is required. Boolean parameters 'noLocal', 'noWait', and
'exclusive' are optional with false as the default value. 
<p>
Boolean parameter 'noAck' is optional with default value of true. If noAck is 
true, the broker will not expect any acknowledgement from the client before
discarding the message. If noAck is false, then the broker will expect an
acknowledgement before discarding the message.  If noAck is specified to be
false, then it's developers responsibility to explicitly acknowledge the
received message using AmqpChannel.ackBasic() as shown below: 

<pre>
var handleMessageReceived = function(event) {
   ....
   var props = event.properties;
   var exchange = event.args.exchange;
   var routingKey = event.args.routingKey;
   var dt = event.args.deliveryTag;
   var channel = event.target;
  
   // Acknowledge the received message. Otherwise, the broker will eventually
   // run out of memory.
   var config = {deliveryTag: dt, multiple: true};
   setTimeout(function() {
               channel.ackBasic(config);
             }, 0);
}
</pre>

Parameter 'args' is optional and can be used to pass in additional properties
for declaration.
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###cancelBasic

This method cancels a consumer. This does not affect already delivered
messages, but it does mean the server will not send any more messages for
that consumer. The client may receive an arbitrary number of messages in
between sending the cancel method and receiving the cancel-ok reply.

<p> AmqpChannel.cancelBasic() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {consumerTag: clientTag, noWait: true};
   channel.cancelBasic(config, callback);
</pre>

<p>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          consumerTag: 'consumer_tag_str_value',
                          noWait: true|false
                        }
                       </pre>
Required parameter consumerTag' is required. Boolean parameters 'noWait' is 
optional with false as the default value.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###publishBasic

This method publishes a message to a specific exchange. The message will 
be routed to queues as defined by the exchange configuration and distributed
to any active consumers when the transaction, if any, is committed.

<p> AmqpChannel.publishBasic() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var props = new AmqpProperties();
   props.setMessageId("msgId1");
   var config = {body: buffer, 
                 properties: props,
                 exchange: myExchangeName, 
                 routingKey: key};
   channel.publishBasic(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          body: ArrayBuffer_or_ByteBuffer_instance,
                          properties: AmqpProperties_instance,
                          exchange: 'exchange_name_str_value',
                          routingKey: 'routingKey_str_value',
                          mandatory: true|false,
                          immediate: true|false
                        }
                       </pre>
Required parameter 'body' takes an instance of either ArrayBuffer or 
ByteBuffer. Newer browsers support ArrayBuffer. However, developers can
continue to support older browsers by specify a ByteBuffer payload as 'body'.
The 'properties' parameter takes an instance of AmqpProperties topass the 
pre-defined properties as per AMQP 0-9-1 specification. AmqpProperties 
provides getter/setter APIs for all the pre-defined properties as a 
convenience. Required parameter 'exchange' specifies the name of the exchange. 
Parameter 'routingKey' is required. Boolean parameters 'mandatory' and 
'immediate' are optional with false as the default value.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###getBasic

This method provides a direct access to the messages in a queue using a 
synchronous dialogue that is designed for specific types of application 
where synchronous functionality is more important than performance.

<p> AmqpChannel.getBasic() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:
<pre>
   var channel = ...;
   var config = {queue: myQueueName, noAck: true};
   channel.getBasic(config, callback);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          queue: 'queue_name_str_value',
                          noAck: true|false
                        }
                       </pre>
Required parameter 'queue' specifies the queue name. Boolean parameter 
'noAck' is optional with false as the default value.
<p>
*   callback _Function_

    Optional param specifies the function that is to be invoked on success.
<p>


###ackBasic

This method acknowledges one or more messages delivered via the Deliver
or Get-Ok methods. The client can ask to confirm a single message or a set of 
messages up to and including a specific message.

<p> AmqpChannel.ackBasic() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:

<pre>
   var channel = ...;
   var config = {deliveryTag: dt, multiple: true};
   channel.ackBasic(config);
</pre>

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          deliveryTag: dt_num_value,
                          multiple: true|false
                        }
                       </pre>
Parameter 'deliveryTag' is required. Boolean parameter 'multiple' is optional
with false as the default value.
<p>


###rejectBasic

This is the overloaded form of AmqpChannel.rejectBasic() function that 
named parameters or arguments using the Configuration object.

<p> AmqpChannel.rejectBasic() function supports named parameters or 
arguments using the Configuration object. Developers must invoke this 
function as shown below:
<pre>
   var channel = ...;
   var config = {deliveryTag: dt, requeue: true};
   channel.rejectBasic(config);
</pre>

This method allows a client to reject a message. It can be used to interrupt 
and cancel large incoming messages, or return untreatable messages to their 
original queue.

**Returns**: _AmqpChannel_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          deliveryTag: dt_num_value,
                          requeue: true|false
                        }
                       </pre>
Parameter 'deliveryTag' is required. Boolean parameter 'requeue' is optional
with false as the default value.
<p>


