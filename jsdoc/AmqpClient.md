#AmqpClient models the CONNECTION class defined in AMQP 0-9-1 protocol
by abstracting the methods defined in the protocol and exposing a far simpler 
API. &lt;b&gt;Application developers should use 
&lt;code&gt;AmqpClientFactory#createAmqpClient()&lt;/code&gt; function to create an 
instance of AmqpClient.&lt;/b&gt;

<b>Application developers should use AmqpClientFactory.createAmqpClient() 
function to create an instance of AmqpClient.</b>

AmqpClient is used to connect to the end-point that handles AMQP 0-9-1
protocol over WebSocket.

##Methods

###connect

Connects to the AMQP broker at the given URL with given credentials using
Configuration style API with named parameters/properties.

<p> For example, the developers should use this function as shown below:
<pre>
  var client = new AmqpClient();
  var config = {url: 'ws://localhost:8001/amqp',
                virtualHost: '/',
                credentials: {username: 'guest', password: 'guest'}
               };
  client.connect(config, openHandler);
</pre>

**Returns**: _Void_ - 

**Params**:  
*   config _Configuration_

    Format is as shown below:
                       <pre>
                        {
                          url: 'url_str_value', 
                          virtualHost: 'vh_str_value', 
                          credentials: {username: 'uname_str_value', 
                                        password: 'passwd_str_value'}
                        }
                       </pre>
 
 Note that 'url', 'virtualHost' and 'credentials' are required properties
 and valid values must be passed in. A JavaScript error is thrown if the
 aforementioned arguments are undefined, null, or empty string.
*   callback _Function_

    Optional param specifies the function that is 
                             to be invoked on success.


###disconnect

Disconnect from the AMQP broker

**Returns**: _Void_ - 

###openChannel

Opens an AMQP Channel

**Returns**: _AmqpChannel_ - 

**Params**:  
*   callback _Function_

    Optional param specifies the function that is 
                             to be invoked on success.


###getAmqpClientFactory

Returns the AmqpClientFactory that was used to create AmqpClient.

**Returns**: _AmqpClientFactory_ - 

