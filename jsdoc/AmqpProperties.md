#AmqpProperties class is used to specify the pre-defined properties as per
AMQP 0-9-1 specification. This class provides type-safe convenience getters
and setters for the pre-defined or standard AMQP properties.

Creates an AmqpProperties instance.  
<p>
The value of the "headers" property is of type AmqpArguments. Kaazing
AMQP implementation uses AmqpArguments to encode the "table". Similarly,
Kaazing AMQP implementation decodes the "table" and constructs an instance
of AmqpArguments.

##Methods

###getAppId

Returns the value of "appId" property. A null is returned if the property
is not set.

**Returns**: __ - String value for "appId" property

###getContentType

Returns the value of "contentType" property. A null is returned if the
property is not set.

**Returns**: __ - String value for "contentType" property

###getContentEncoding

Returns the value of "contentEncoding" property. A null is returned if
the property is not set.

**Returns**: __ - String value for "contentEncoding" property

###getCorrelationId

Returns the value of "correlationId" property. A null is returned if the
property is not set.

**Returns**: __ - String value for "correlationId" property

###getDeliveryMode

Returns the value of "deliveryMode" property. A null is returned if the
property is not set. If deliveryMode is 1, then it indicates 
non-persistent mode. If deliveryMode is 2, then it indicates a persistent
mode.

**Returns**: __ - Integer value between 0 and 9 for "deliveryMode" property

###getExpiration

Returns the value of "expiration" property. A null is returned if the
property is not set.

**Returns**: __ - String value for "expiration" property

###getHeaders

Returns the value of "headers" property. A null is returned if the
property is not set.

**Returns**: __ - AmqpArguments as value for "headers" property

###getMessageId

Returns the value of "messageId" property. A null is returned if the
property is not set.

**Returns**: __ - String value for the "messageId" property

###getPriority

Returns the value of "priority" property. A null is returned if the
property is not set.

**Returns**: __ - Integer value for "priority" property between 0 and 9

###getProperties

Returns a clone of the properties by shallow copying the values.

**Returns**: __ - Object with the name-value pairs

###getReplyTo

Returns the value of "replyTo" property. A null is returned if the
property is not set.

**Returns**: __ - String value for "replyTo" property

###getTimestamp

Returns the value of "timestamp" property. A null is returned if the
property is not set.

**Returns**: __ - Timestamp value for "timestamp" property

###getType

Returns the value of "type" property. A null is returned if the
property is not set.

**Returns**: __ - String value for "type" property

###getUserId

Returns the value of "userId" property. A null is returned if the
property is not set.

**Returns**: __ - String value for  "userId" property

###setAppId

Sets the value of "appId" property. If a null value is passed in, it
indicates that the property is not set.

**Params**:  
*   appId __

    value of "appId" property


###setContentType

Sets the value of "contentType" property. If a null value is passed in, it
indicates that the property is not set.

**Params**:  
*   contentType __

    value of "contentType" property


###setContentEncoding

Sets the value of "contentEncoding" property. If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   encoding __

    value of "contentEncoding" property


###setCorrelationId

Sets the value of "correlationId" property.  If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   correlationId __

    value of "correlationId" property


###setDeliveryMode

Sets the value of "deliveryMode" property.  If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   deliveryMode __

    value of "deliveryMode" property


###setExpiration

Sets the value of "expiration" property.  If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   expiration __

    value of "expiration" property


###setHeaders

Sets the value of "headers" property.  If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   headers __

    value of "headers" property


###setMessageId

Sets the value of "messageId" property. If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   messageId __

    value of "messageId" property


###setPriority

Sets the value of "priority" property. If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   priority __

    value of "priority" property


###setReplyTo

Sets the value of "replyTo" property. If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   replyTo __

    value of "replyTo" property


###setTimestamp

Sets the value of "timestamp" property. If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   date __

    of type Date


###setType

Sets the value of "type" property. If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   type __

    value of "type" property


###setUserId

Sets the value of "userId" property. If a null value is passed 
in, it indicates that the property is not set.

**Params**:  
*   userId __

    value of "userId" property


###toString

Returns String representation of the properties.

**Returns**: _String_ - 

