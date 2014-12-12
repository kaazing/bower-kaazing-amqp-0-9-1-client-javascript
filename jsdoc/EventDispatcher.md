#EventDispatcher implements the observer pattern.

Base class for classes that dispatch event.

##Methods

###addEventListener

Adds an event listener for the specified type.

**Returns**: _Void_ - 

**Params**:  
*   type _String_

    the event type
<p>
*   listener _Function_

    the listener
<p>


###removeEventListener

Removes the specified event listener.

**Returns**: _Void_ - 

**Params**:  
*   type _String_

    the event type
<p>
*   listener _Function_

    the listener
<p>


###hasEventListener

Returns true if the event type has at least one listener associated with it.

**Returns**: _Boolean_ - 

**Params**:  
*   type _String_

    the event type


###dispatchEvent

Dispatches an event.

**Returns**: _Void_ - 

