#AmqpEvent

AmqpEvent is dispatched to event listeners and callback functions
 registered when using AmqpClient and AmqpChannel

##Methods

###getBodyAsArrayBuffer

Returns the body or the payload of the event as an ArrayBuffer. If
the browser does not support ArrayBuffer, then an error is thrown.

**Returns**: _ArrayBuffer_ - 

###getBodyAsByteBuffer

Returns the body or the payload of the event as a ByteBuffer.

**Returns**: _ByteBuffer_ - 

