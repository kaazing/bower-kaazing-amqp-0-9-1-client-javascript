/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @private
 */
// Root Namespace Object
var Kaazing = Kaazing || {};

if (typeof Kaazing.namespace !== "function") {
    // The implementation is nondestructive i.e. if a namespace exists, it won't be created.
	Kaazing.namespace = function(namespace_string) {
	    var parts = namespace_string.split('.');
	    var parent = Kaazing;
	    
	    // strip redundant leading global
	    if (parts[0] === "Kaazing") {
	        parts = parts.slice(1);
	    }
	    
	    for (var i = 0; i < parts.length; i++) {
	        // create a property if it does not exist
	        if (typeof parent[parts[i]] === "undefined") {
	            parent[parts[i]] = {};
	        }
	        parent = parent[parts[i]];
	    }
	    
	    return parent;
	}
}

/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @private
 */
var Logger = function(name) {
    this._name = name;
    this._level = Logger.Level.INFO; // default to INFO 
};
        
(function() {
    /**
     * Logging levels available. Matches java.util.logging.Level.
     * See http://java.sun.com/javase/6/docs/api/java/util/logging/Level.html
     * @ignore
     */
    Logger.Level = {
        OFF:8,
        SEVERE:7,
        WARNING:6,
        INFO:5,
        CONFIG:4,
        FINE:3,
        FINER:2,
        FINEST:1,
        ALL:0
    };
    
    // Load the logging configuration as specified by the kaazing:logging META tag
    var logConfString;
    var tags = document.getElementsByTagName("meta");
    for(var i = 0; i < tags.length; i++) {
        if (tags[i].name === 'kaazing:logging') {
            logConfString = tags[i].content;
            break;
        }
    }
    Logger._logConf = {};
    if (logConfString) {
        var tokens = logConfString.split(',');
        for (var i = 0; i < tokens.length; i++) {
            var logConfItems = tokens[i].split('=');
            Logger._logConf[logConfItems[0]] = logConfItems[1];
        }
    }
    
    var loggers = {};
    
    Logger.getLogger = function(name) {
        var logger = loggers[name];
        if (logger === undefined) {
            logger = new Logger(name);
            loggers[name] = logger;
        }
        return logger; 
    }
    
    var $prototype = Logger.prototype;
    
    /**
     * Set the log level specifying which message levels will be logged.
     * @param level the log level
     * @ignore
     * @memberOf Logger
     */
    $prototype.setLevel = function(level) {
        if (level && level >= Logger.Level.ALL && level <= Logger.Level.OFF) {
            this._level = level;
        }
    }    

    /**
     * Check if a message of the given level would actually be logged.
     * @param level the log level
     * @return whether loggable
     * @ignore
     * @memberOf Logger
     */
    $prototype.isLoggable = function(level) {
        for (var logKey in Logger._logConf) {
            if (Logger._logConf.hasOwnProperty(logKey)) {
                if (this._name.match(logKey)) {
                    var logVal = Logger._logConf[logKey];
                    if (logVal) {
                        return (Logger.Level[logVal] <= level);
                    }
                }
            }
        }
        return (this._level <= level);
    }
    
    var noop = function() {};
    
    var delegates = {};
    delegates[Logger.Level.OFF] = noop;
    delegates[Logger.Level.SEVERE] = (window.console) ? (console.error || console.log || noop) : noop;
    delegates[Logger.Level.WARNING] = (window.console) ? (console.warn || console.log || noop) : noop;
    delegates[Logger.Level.INFO] = (window.console) ? (console.info || console.log || noop) : noop;
    delegates[Logger.Level.CONFIG] = (window.console) ? (console.info || console.log || noop) : noop;
    delegates[Logger.Level.FINE] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[Logger.Level.FINER] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[Logger.Level.FINEST] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[Logger.Level.ALL] = (window.console) ? (console.log || noop) : noop;
    
    $prototype.config = function(source, message) {
        this.log(Logger.Level.CONFIG, source, message);
    };

    $prototype.entering = function(source, name, params) {
        if (this.isLoggable(Logger.Level.FINER)) {
            if (browser == 'chrome' || browser == 'safari') {
                source = console;
            }
            var delegate = delegates[Logger.Level.FINER];
            if (params) {
                if (typeof(delegate) == 'object') {
                    delegate('ENTRY ' + name, params);
                } else {
                    delegate.call(source, 'ENTRY ' + name, params);
                }
            } else {
                if (typeof(delegate) == 'object') {
                    delegate('ENTRY ' + name);
                } else {
                    delegate.call(source, 'ENTRY ' + name);
                }
            }
        }  
    };

    $prototype.exiting = function(source, name, value) {
        if (this.isLoggable(Logger.Level.FINER)) {
            var delegate = delegates[Logger.Level.FINER];
            if (browser == 'chrome' || browser == 'safari') {
                source = console;
            }
            if (value) {
                if (typeof(delegate) == 'object') {
                    delegate('RETURN ' + name, value);
                } else {
                    delegate.call(source, 'RETURN ' + name, value);
                }
            } else {
                if (typeof(delegate) == 'object') {
                    delegate('RETURN ' + name);
                } else {
                    delegate.call(source, 'RETURN ' + name);
                }
            }
        }  
    };
    
    $prototype.fine = function(source, message) {
        this.log(Logger.Level.FINE, source, message);
    };

    $prototype.finer = function(source, message) {
        this.log(Logger.Level.FINER, source, message);
    };

    $prototype.finest = function(source, message) {
        this.log(Logger.Level.FINEST, source, message);
    };

    $prototype.info = function(source, message) {
        this.log(Logger.Level.INFO, source, message);
    };

    $prototype.log = function(level, source, message) {
        if (this.isLoggable(level)) {
            var delegate = delegates[level];
            if (browser == 'chrome' || browser == 'safari') {
                source = console;
            }
            if (typeof(delegate) == 'object') {
                delegate(message);
            } else {
                delegate.call(source, message);
            }
        }  
    };

    $prototype.severe = function(source, message) {
        this.log(Logger.Level.SEVERE, source, message);
    };

    $prototype.warning = function(source, message) {
        this.log(Logger.Level.WARNING, source, message);
    };

})();
    

/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

;;;var ULOG = Logger.getLogger('com.kaazing.gateway.client.loader.Utils');

/**
 * Given a key, returns the value of the content attribute of the first
 * meta tag with a name attribute matching that key.
 *
 * @internal
 * @ignore
 */
var getMetaValue = function(key) {
    ;;;ULOG.entering(this, 'Utils.getMetaValue', key);
    // get all meta tags
    var tags = document.getElementsByTagName("meta");

    // find tag with name matching key
    for(var i=0; i < tags.length; i++) {
        if (tags[i].name === key) {
            var v = tags[i].content;
            ;;;ULOG.exiting(this, 'Utils.getMetaValue', v);
            return v;
        }
    }
    ;;;ULOG.exiting(this, 'Utils.getMetaValue');
}

var arrayCopy = function(array) {
    ;;;ULOG.entering(this, 'Utils.arrayCopy', array);
    var newArray = [];
    for (var i=0; i<array.length; i++) {
        newArray.push(array[i]);
    }
    return newArray;
}

var arrayFilter = function(array, callback) {
    ;;;ULOG.entering(this, 'Utils.arrayFilter', {'array':array, 'callback':callback});
    var newArray = [];
    for (var i=0; i<array.length; i++) {
        var elt = array[i];
        if(callback(elt)) {
            newArray.push(array[i]);
        }
    }
    return newArray;
}

var indexOf = function(array, searchElement) {
    ;;;ULOG.entering(this, 'Utils.indexOf', {'array':array, 'searchElement':searchElement});
    for (var i=0; i<array.length; i++) {
        if (array[i] == searchElement) {
            ;;;ULOG.exiting(this, 'Utils.indexOf', i);
            return i;
        }
    }
    ;;;ULOG.exiting(this, 'Utils.indexOf', -1);
    return -1;
}

/**
 * Given a byte string, decode as a UTF-8 string
 * @private
 * @ignore
 */
var decodeByteString = function(s) {
    ;;;ULOG.entering(this, 'Utils.decodeByteString', s);
    var a = [];
    for (var i=0; i<s.length; i++) {
        a.push(s.charCodeAt(i) & 0xFF);
    }
    var buf = new Kaazing.ByteBuffer(a);
    var v = getStringUnterminated(buf, Kaazing.Charset.UTF8);
    ;;;ULOG.exiting(this, 'Utils.decodeByteString', v);
    return v;
}

/**
 * Given an arrayBuffer, decode as a UTF-8 string
 * @private
 * @ignore
 */
var decodeArrayBuffer = function(array) {
    ;;;ULOG.entering(this, 'Utils.decodeArrayBuffer', array);
    var buf = new Uint8Array(array);
    var a = [];
    for (var i=0; i<buf.length; i++) {
        a.push(buf[i]);
    }
    var buf = new Kaazing.ByteBuffer(a);
    var s = getStringUnterminated(buf, Kaazing.Charset.UTF8);
    ;;;ULOG.exiting(this, 'Utils.decodeArrayBuffer', s);
    return s;
}

/**
 * Given an arrayBuffer, decode as a Kaazing.ByteBuffer
 * @private
 * @ignore
 */
var decodeArrayBuffer2ByteBuffer = function(array) {
    ;;;ULOG.entering(this, 'Utils.decodeArrayBuffer2ByteBuffer');
    var buf = new Uint8Array(array);
    var a = [];
    for (var i=0; i<buf.length; i++) {
        a.push(buf[i]);
    }
    ;;;ULOG.exiting(this, 'Utils.decodeArrayBuffer2ByteBuffer');
    return new Kaazing.ByteBuffer(a);
}

var ESCAPE_CHAR = String.fromCharCode(0x7F);
var NULL = String.fromCharCode(0);
var LINEFEED = "\n";

/**
 * Convert a ByteBuffer into an escaped and encoded string
 * @private
 * @ignore
 */
var encodeEscapedByteString = function(buf) {
    ;;;ULOG.entering(this, 'Utils.encodeEscapedByte', buf);
    var a = [];
    while(buf.remaining()) {
        var n = buf.getUnsigned();
        var chr = String.fromCharCode(n);
        switch(chr) {
            case ESCAPE_CHAR:
                a.push(ESCAPE_CHAR);
                a.push(ESCAPE_CHAR);
                break;
            case NULL:
                a.push(ESCAPE_CHAR);
                a.push("0");
                break;
            case LINEFEED:
                a.push(ESCAPE_CHAR);
                a.push("n");
                break;
            default:
                a.push(chr);
        }

    }
    var v = a.join("");
    ;;;ULOG.exiting(this, 'Utils.encodeEscapedBytes', v);
    return v;
}

/**
 * Convert a ByteBuffer into a properly escaped and encoded string
 * @private
 * @ignore
 */
var encodeByteString = function(buf, requiresEscaping) {
    ;;;ULOG.entering(this, 'Utils.encodeByteString', {'buf':buf, 'requiresEscaping': requiresEscaping});
    if (requiresEscaping) {
        return encodeEscapedByteString(buf);
    } else {
    	// obtain the array without copying if possible
		var array = buf.array;
		var bytes = (buf.position == 0 && buf.limit == array.length) ? array : buf.getBytes(buf.remaining());

		// update the array to use unsigned values and \u0100 for \u0000 (due to XDR bug)
        var sendAsUTF8 = !(XMLHttpRequest.prototype.sendAsBinary);
		for (var i=bytes.length-1; i >= 0; i--) {
		    var element = bytes[i];
		    if (element == 0 && sendAsUTF8) {
		        bytes[i] = 0x100;
		    }
		    else if (element < 0) {
		        bytes[i] = element & 0xff;
		    }
		}

        var encodedLength = 0;
        var partsOfByteString = [];

        do {
            var amountToEncode = Math.min(bytes.length - encodedLength, 10000);
            partOfBytes = bytes.slice(encodedLength, encodedLength + amountToEncode);
            encodedLength += amountToEncode;
		    partsOfByteString.push(String.fromCharCode.apply(null, partOfBytes));
        } while ( encodedLength < bytes.length);

		// convert UTF-8 char codes to String
        var byteString = partsOfByteString.join("");

		// restore original byte values for \u0000
		if (bytes === array) {
			for (var i=bytes.length-1; i >= 0; i--) {
			    var element = bytes[i];
			    if (element == 0x100) {
			        bytes[i] = 0;
			    }
			}
		}

        ;;;ULOG.exiting(this, 'Utils.encodeByteString', byteString);
        return byteString;
    }
}

/**
 * UTF8 Decode an entire ByteBuffer (ignoring "null termination" because 0 is a
 *      valid character code!
 * @private
 * @ignore
 */
var getStringUnterminated = function(buf, cs) {
  var newLimit = buf.position;
  var oldLimit = buf.limit;
  var array = buf.array;
  while (newLimit < oldLimit) {
    newLimit++;
  }
  try {
      buf.limit = newLimit;
      return cs.decode(buf);
  }
  finally {
      if (newLimit != oldLimit) {
          buf.limit = oldLimit;
          buf.position = newLimit + 1;
      }
  }
};

/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @ignore
 */
var browser = null;
if (typeof(ActiveXObject) != "undefined") {
    //KG-5860: treat IE 10 same as Chrome
    if(navigator.userAgent.indexOf("MSIE 10")!=-1){
        browser="chrome";
    }else{
        browser="ie";
    }
}
else if (navigator.userAgent.indexOf("Trident/7") != -1 && navigator.userAgent.indexOf("rv:11") != -1) {
    // treat IE 11 same as chrome
    // IE 11 UA string - http://blogs.msdn.com/b/ieinternals/archive/2013/09/21/internet-explorer-11-user-agent-string-ua-string-sniffing-compatibility-with-gecko-webkit.aspx
    // window.ActiveXObject property is hidden from the DOM
    browser = "chrome";
}
else if(Object.prototype.toString.call(window.opera) == "[object Opera]") {
    browser = 'opera';
}
else if (navigator.vendor.indexOf('Apple') != -1) {
    // This has to happen before the Gecko check, as that expression also
    // evaluates to true.
    browser = 'safari';
    // add ios attribute for known iOS substrings
    if (navigator.userAgent.indexOf("iPad")!=-1 || navigator.userAgent.indexOf("iPhone")!=-1) {
    	browser.ios = true;
    }
}
else if (navigator.vendor.indexOf('Google') != -1) {
    if ((navigator.userAgent.indexOf("Android") != -1) &&
        (navigator.userAgent.indexOf("Chrome") == -1)) {
        browser = "android";
    }
    else {
        browser="chrome";
    }
}
else if (navigator.product == 'Gecko' && window.find && !navigator.savePreferences) {
    browser = 'firefox'; // safari as well
}
else {
    throw new Error("couldn't detect browser");
}

/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

(function($module){
   
   if (typeof $module.ByteOrder === "undefined") {
       var ByteOrder = function() {};
    
	    // Note:
	    //   Math.pow(2, 32) = 4294967296
	    //   Math.pow(2, 16) = 65536
	    //   Math.pow(2,  8) = 256
	
	    /**
	     * @ignore
	     */
	    var $prototype = ByteOrder.prototype;
	
	    /**
	     * Returns the string representation of a ByteOrder.
	     *
	     * @return string
	     *
	     * @public
	     * @function
	     * @name toString
	     * @memberOf ByteOrder
	     */
	    $prototype.toString = function() {
	        throw new Error ("Abstract");
	    }
	    
	    /**
	     * Returns the single-byte representation of an 8-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedByte = function(v) {
	        return (v & 255);
	    }
	    
	    /**
	     * Returns a signed 8-bit integer from a single-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toByte = function(byte0) {
	        return (byte0 & 128) ? (byte0 | -256) : byte0;
	    }
	    
	    /**
	     * Returns the big-endian 2-byte representation of a 16-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _fromShort = function(v) {
	        return [((v >> 8) & 255), (v & 255)];
	    }
	    
	    /**
	     * Returns a signed 16-bit integer from a big-endian two-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toShort = function(byte1, byte0) {
	        return (_toByte(byte1) << 8) | (byte0 & 255);
	    }
	    
	    /**
	     * Returns an unsigned 16-bit integer from a big-endian two-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedShort = function(byte1, byte0) {
	        return ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	
	    /**
	     * Returns an unsigned 24-bit integer from a big-endian three-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedMediumInt = function(byte2, byte1, byte0) {
	        return ((byte2 & 255) << 16) | ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	
	    /**
	     * Returns the big-endian three-byte representation of a 24-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _fromMediumInt = function(v) {
	        return [((v >> 16) & 255), ((v >> 8) & 255), (v & 255)];
	    }
	    
	    /**
	     * Returns a signed 24-bit integer from a big-endian three-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toMediumInt = function(byte2, byte1, byte0) {
	        return ((byte2 & 255) << 16) | ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	    
	    /**
	     * Returns the big-endian four-byte representation of a 32-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _fromInt = function(v) {
	        return [((v >> 24) & 255), ((v >> 16) & 255), ((v >> 8) & 255), (v & 255)];
	    }
	    
	    /**
	     * Returns a signed 32-bit integer from a big-endian four-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toInt = function(byte3, byte2, byte1, byte0) {
	        return (_toByte(byte3) << 24) | ((byte2 & 255) << 16) | ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	    
	    /**
	     * Returns an unsigned 32-bit integer from a big-endian four-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedInt = function(byte3, byte2, byte1, byte0) {
	        var nibble1 = _toUnsignedShort(byte3, byte2);
	        var nibble0 = _toUnsignedShort(byte1, byte0);
	        return (nibble1 * 65536 + nibble0);
	    }
	
	    /**
	     * The big-endian byte order.
	     *
	     * @public
	     * @static
	     * @final
	     * @field
	     * @name BIG_ENDIAN
	     * @type ByteOrder
	     * @memberOf ByteOrder
	     */
	    ByteOrder.BIG_ENDIAN = (function() {
	        
	        var BigEndian = function() {}
	        BigEndian.prototype = new ByteOrder();
	        var $prototype = BigEndian.prototype;
	
	        $prototype._toUnsignedByte = _toUnsignedByte;
	        $prototype._toByte = _toByte;
	        $prototype._fromShort = _fromShort;
	        $prototype._toShort = _toShort;
	        $prototype._toUnsignedShort = _toUnsignedShort;
	        $prototype._toUnsignedMediumInt = _toUnsignedMediumInt;
	        $prototype._fromMediumInt = _fromMediumInt;
	        $prototype._toMediumInt = _toMediumInt;
	        $prototype._fromInt = _fromInt;
	        $prototype._toInt = _toInt;
	        $prototype._toUnsignedInt = _toUnsignedInt;
	
	        $prototype.toString = function() {
	            return "<ByteOrder.BIG_ENDIAN>";
	        }
	
	        return new BigEndian();
	    })();
	
	    /**
	     * The little-endian byte order.
	     *
	     * @public
	     * @static
	     * @final
	     * @field
	     * @name BIG_ENDIAN
	     * @type ByteOrder
	     * @memberOf ByteOrder
	     */
	    ByteOrder.LITTLE_ENDIAN = (function() {
	        var LittleEndian = function() {}
	        LittleEndian.prototype = new ByteOrder();
	        var $prototype = LittleEndian.prototype;
	
	        $prototype._toByte = _toByte;
	        $prototype._toUnsignedByte = _toUnsignedByte;
	        
	        $prototype._fromShort = function(v) {
	            return _fromShort(v).reverse();
	        }
	        
	        $prototype._toShort = function(byte1, byte0) {
	            return _toShort(byte0, byte1);
	        }
	        
	        $prototype._toUnsignedShort = function(byte1, byte0) {
	            return _toUnsignedShort(byte0, byte1);
	        }
	
	        $prototype._toUnsignedMediumInt = function(byte2, byte1, byte0) {
	            return _toUnsignedMediumInt(byte0, byte1, byte2);
	        }
	
	        $prototype._fromMediumInt = function(v) {
	            return _fromMediumInt(v).reverse();
	        }
	        
	        $prototype._toMediumInt = function(byte5, byte4, byte3, byte2, byte1, byte0) {
	            return _toMediumInt(byte0, byte1, byte2, byte3, byte4, byte5);
	        }
	        
	        $prototype._fromInt = function(v) {
	            return _fromInt(v).reverse();
	        }
	        
	        $prototype._toInt = function(byte3, byte2, byte1, byte0) {
	            return _toInt(byte0, byte1, byte2, byte3);
	        }
	        
	        $prototype._toUnsignedInt = function(byte3, byte2, byte1, byte0) {
	            return _toUnsignedInt(byte0, byte1, byte2, byte3);
	        }
	        
	        $prototype.toString = function() {
	            return "<ByteOrder.LITTLE_ENDIAN>";
	        }
	
	        return new LittleEndian();
	    })();
		
		$module.ByteOrder = ByteOrder;
   }

})(Kaazing);



/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

(function($module) {

    if (typeof $module.ByteBuffer === "undefined") {
        /**
	     * Creates a new ByteBuffer instance.
	     *
	     * @param {Array} bytes  the byte-valued Number array
	     *
	     * @constructor
	     *
	     * @class  ByteBuffer provides a compact byte array representation for 
	     *         sending, receiving and processing binary data using WebSocket.
	     */
		var ByteBuffer = function(bytes) {
			this.array = bytes || [];
		    this._mark = -1;
		    this.limit = this.capacity = this.array.length;
		    // Default to network byte order
		    this.order = $module.ByteOrder.BIG_ENDIAN;
		}
		
		
	    /**
	     * Allocates a new ByteBuffer instance.
	     * The new buffer's position will be zero, its limit will be its capacity,
	     * and its mark will be undefined. 
	     *
	     * @param {Number} capacity  the maximum buffer capacity
	     *
	     * @return {ByteBuffer} the allocated ByteBuffer 
	     *
	     * @public
	     * @static
	     * @function
	     * @memberOf ByteBuffer
	     */
	    ByteBuffer.allocate = function(capacity) {
	        var buf = new ByteBuffer();
	        buf.capacity = capacity;
	
	        // setting limit to the given capacity, other it would be 0...
	        buf.limit = capacity;
	        return buf;
	    };
	    
	    /**
	     * Wraps a byte array as a new ByteBuffer instance.
	     *
	     * @param {Array} bytes  an array of byte-sized numbers
	     *
	     * @return {ByteBuffer} the bytes wrapped as a ByteBuffer 
	     *
	     * @public
	     * @static
	     * @function
	     * @memberOf ByteBuffer
	     */
	    ByteBuffer.wrap = function(bytes) {
	      return new ByteBuffer(bytes);
	    };
	
	    var $prototype = ByteBuffer.prototype;
	    
	    /**
	     * The autoExpand property enables writing variable length data,
	     * and is on by default.
	     *
	     * @public
	     * @field
	     * @name autoExpand
	     * @type Boolean
	     * @memberOf ByteBuffer
	     */
	    $prototype.autoExpand = true;
	
	    /**
	     * The capacity property indicates the maximum number of bytes
	     * of storage available if the buffer is not automatically expanding.
	     *
	     * @public
	     * @field
	     * @name capacity
	     * @type Number
	     * @memberOf ByteBuffer
	     */
	    $prototype.capacity = 0;
	    
	    /**
	     * The position property indicates the progress through the buffer,
	     * and indicates the position within the underlying array that
	     * subsequent data will be read from or written to.
	     *
	     * @public
	     * @field
	     * @name position
	     * @type Number
	     * @memberOf ByteBuffer
	     */
	    $prototype.position = 0;
	    
	    /**
	     * The limit property indicates the last byte of data available for 
	     * reading.
	     *
	     * @public
	     * @field
	     * @name limit
	     * @type Number
	     * @memberOf ByteBuffer
	     */
	    $prototype.limit = 0;
	
	
	    /**
	     * The order property indicates the endianness of multibyte integer types in
	     * the buffer.
	     *
	     * @public
	     * @field
	     * @name order
	     * @type ByteOrder
	     * @memberOf ByteBuffer
	     */
	    $prototype.order = $module.ByteOrder.BIG_ENDIAN;
	    
	    /**
	     * The array property provides byte storage for the buffer.
	     *
	     * @public
	     * @field
	     * @name array
	     * @type Array
	     * @memberOf ByteBuffer
	     */
	    $prototype.array = [];
	    
	    /**
	     * Marks a position in the buffer.
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @see ByteBuffer#reset
	     *
	     * @public
	     * @function
	     * @name mark
	     * @memberOf ByteBuffer
	     */
	    $prototype.mark = function() {
	      this._mark = this.position;
	      return this;
	    };
	    
	    /**
	     * Resets the buffer position using the mark.
	     *
	     * @throws {Error} if the mark is invalid
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @see ByteBuffer#mark
	     *
	     * @public
	     * @function
	     * @name reset
	     * @memberOf ByteBuffer
	     */
	    $prototype.reset = function() {
	      var m = this._mark;
	      if (m < 0) {
	        throw new Error("Invalid mark");
	      }
	      this.position = m;
	      return this;
	    };
	    
	    /**
	     * Compacts the buffer by removing leading bytes up
	     * to the buffer position, and decrements the limit
	     * and position values accordingly.
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name compact
	     * @memberOf ByteBuffer
	     */
	    $prototype.compact = function() {
	      this.array.splice(0, this.position);
	      this.limit -= this.position;
	      this.position = 0;
	      return this;
	    };
	    
	    /**
	     * Duplicates the buffer by reusing the underlying byte
	     * array but with independent position, limit and capacity.
	     *
	     * @return {ByteBuffer} the duplicated buffer
	     *
	     * @public
	     * @function
	     * @name duplicate
	     * @memberOf ByteBuffer
	     */
	    $prototype.duplicate = function() {
	      var buf = new ByteBuffer(this.array);
	      buf.position = this.position;
	      buf.limit = this.limit;
	      buf.capacity = this.capacity;
	      return buf;
	    };
	    
	    /**
	     * Fills the buffer with a repeated number of zeros.
	     *
	     * @param size  {Number}  the number of zeros to repeat
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name fill
	     * @memberOf ByteBuffer
	     */
	    $prototype.fill = function(size) {
	      _autoExpand(this, size);
	      while (size-- > 0) {
	        this.put(0);
	      }
	      return this;
	    };
	    
	    /**
	     * Fills the buffer with a specific number of repeated bytes.
	     *
	     * @param b     {Number}  the byte to repeat
	     * @param size  {Number}  the number of times to repeat
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name fillWith
	     * @memberOf ByteBuffer
	     */
	    $prototype.fillWith = function(b, size) {
	      _autoExpand(this, size);
	      while (size-- > 0) {
	        this.put(b);
	      }
	      return this;
	    };
	    
	    /**
	     * Returns the index of the specified byte in the buffer.
	     *
	     * @param b     {Number}  the byte to find
	     *
	     * @return {Number} the index of the byte in the buffer, or -1 if not found
	     *
	     * @public
	     * @function
	     * @name indexOf
	     * @memberOf ByteBuffer
	     */
	    $prototype.indexOf = function(b) {
	      var limit = this.limit;
	      var array = this.array;
	      for (var i=this.position; i < limit; i++) {
	        if (array[i] == b) {
	          return i;
	        }
	      }
	      return -1;
	    };
	    
	    /**
	     * Puts a single byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the single-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name put
	     * @memberOf ByteBuffer
	     */
	    $prototype.put = function(v) {
	       _autoExpand(this, 1);
	       this.array[this.position++] = v & 255;
	       return this;
	    };
	    
	    /**
	     * Puts a single byte number into the buffer at the specified index.
	     *
	     * @param index   {Number}  the index
	     * @param v       {Number}  the byte
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putAt = function(index, v) {
	       _checkForWriteAt(this,index,1);
	       this.array[index] = v & 255;
	       return this;
	    };
	
	    /**
	     * Puts an unsigned single-byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the single-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsigned
	     * @memberOf ByteBuffer
	     */
	     $prototype.putUnsigned = function(v) {
	        _autoExpand(this, 1);
	        this.array[this.position++] = v & 0xFF;
	        return this;
	    }
	    /**
	     * Puts an unsigned single byte into the buffer at the specified position.
	     *
	     * @param index  {Number}  the index
	     * @param v      {Number}  the single-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedAt
	     * @memberOf ByteBuffer
	     */
	     $prototype.putUnsignedAt = function(index, v) {
	    	_checkForWriteAt(this,index,1);
	    	this.array[index] = v & 0xFF;
	        return this;
	    }
	    /**
	     * Puts a two-byte short into the buffer at the current position.
	     *
	     * @param v     {Number} the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.putShort = function(v) {
	        _autoExpand(this, 2);
	        _putBytesInternal(this, this.position, this.order._fromShort(v));
	        this.position += 2;
	        return this;
	    };
	    
	    /**
	     * Puts a two-byte short into the buffer at the specified index.
	     *
	     * @param index  {Number}  the index
	     * @param v      {Number}  the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putShortAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putShortAt = function(index, v) {
	    	_checkForWriteAt(this,index,2);
	        _putBytesInternal(this, index, this.order._fromShort(v));
	        return this;
	    };
	    
	    /**
	     * Puts a two-byte unsigned short into the buffer at the current position.
	     *
	     * @param v     {Number}  the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedShort = function(v) {
	        _autoExpand(this, 2);
	        _putBytesInternal(this, this.position, this.order._fromShort(v & 0xFFFF));
	        this.position += 2;
	        return this;
	    }
	
	    /**
	     * Puts an unsigned two-byte unsigned short into the buffer at the position specified.
	     * 
	     * @param index     {Number}  the index
	     * @param v     {Number}  the two-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedShortAt = function(index, v) {
	    	_checkForWriteAt(this,index,2);
	        _putBytesInternal(this, index, this.order._fromShort(v & 0xFFFF));
	        return this;
	    }
	
	    /**
	     * Puts a three-byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the three-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putMediumInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putMediumInt = function(v) {
	       _autoExpand(this, 3);
	       this.putMediumIntAt(this.position, v);
	       this.position += 3;
	       return this;
	    };
	
	    /**
	     * Puts a three-byte number into the buffer at the specified index.
	     *
	     * @param index     {Number}  the index
	     * @param v     {Number}  the three-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putMediumIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putMediumIntAt = function(index, v) {
	        this.putBytesAt(index, this.order._fromMediumInt(v));
	        return this;
	    };
	
	    /**
	     * Puts a four-byte number into the buffer at the current position.
	     *
	     * @param v     {Number}  the four-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putInt = function(v) {
	        _autoExpand(this, 4);
	        _putBytesInternal(this, this.position, this.order._fromInt(v))
	        this.position += 4;
	        return this;
	    };
	    
	    /**
	     * Puts a four-byte number into the buffer at the specified index.
	     *
	     * @param index     {Number}  the index
	     * @param v     {Number}  the four-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putIntAt = function(index, v) {
	    	_checkForWriteAt(this,index,4);
	        _putBytesInternal(this, index, this.order._fromInt(v))
	        return this;
	    };
	    
	    /**
	     * Puts an unsigned four-byte number into the buffer at the current position.
	     *
	     * @param i     {Number}  the index
	     * 
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedInt = function(v) {
	        _autoExpand(this, 4);
	        this.putUnsignedIntAt(this.position, v & 0xFFFFFFFF);
	        this.position += 4;
	        return this;
	    }
	
	    /**
	     * Puts an unsigned four-byte number into the buffer at the specified index.
	     *
	     * @param index     {Number}  the index
	     * @param v     {Number}  the four-byte number
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putUnsignedIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putUnsignedIntAt = function(index, v) {
	    	_checkForWriteAt(this,index,4);
	        this.putIntAt(index, v & 0xFFFFFFFF);
	        return this;
	    }
	
	    /**
	     * Puts a string into the buffer at the current position, using the
	     * character set to encode the string as bytes.
	     *
	     * @param v     {String}   the string
	     * @param cs    {Charset}  the character set
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putString
	     * @memberOf ByteBuffer
	     */
	    $prototype.putString = function(v, cs) {
	       cs.encode(v, this);
	       return this;
	    };
	    
	    /**
	     * Puts a string into the buffer at the specified index, using the
	     * character set to encode the string as bytes.
	     *
	     * @param fieldSize  {Number}   the width in bytes of the prefixed length field
	     * @param v          {String}   the string
	     * @param cs         {Charset}  the character set
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putPrefixedString
	     * @memberOf ByteBuffer
	     */
	    $prototype.putPrefixedString = function(fieldSize, v, cs) {
	        if (typeof(cs) === "undefined" || typeof(cs.encode) === "undefined") {
	            throw new Error("ByteBuffer.putPrefixedString: character set parameter missing");
	        }
	
	        if (fieldSize === 0) {
	            return this;
	        }
	    
	        _autoExpand(this, fieldSize);
	
	        var len = v.length;
	        switch (fieldSize) {
	          case 1:
	            this.put(len);
	            break;
	          case 2:
	            this.putShort(len);
	            break;
	          case 4:
	            this.putInt(len);
	            break;
	        }
	        
	        cs.encode(v, this);
	        return this;
	    };
	    
	    // encapsulates the logic to store byte array in the buffer
	    function _putBytesInternal($this, index, v) {
	        var array = $this.array;
	        for (var i = 0; i < v.length; i++) {
	            array[i + index] = v[i] & 255;
	        }
	    };
	    
	    /**
	     * Puts a single-byte array into the buffer at the current position.
	     *
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBytes
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBytes = function(v) {
	        _autoExpand(this, v.length);
	        _putBytesInternal(this, this.position, v);
	        this.position += v.length;
	        return this;
	    };
	    
	    /**
	     * Puts a byte array into the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBytesAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBytesAt = function(index, v) {
	    	_checkForWriteAt(this,index,v.length);
	        _putBytesInternal(this, index, v);
	        return this;
	    };
	    
	     /**
	     * Puts a ByteArray into the buffer at the current position.
	     *
	     * @param v     {ByteArray}  the ByteArray
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putByteArray
	     * @memberOf ByteBuffer
	     */
	    $prototype.putByteArray = function(v) {
	        _autoExpand(this, v.byteLength);
	        var u = new Uint8Array(v);
	        // copy bytes into ByteBuffer
	        for (var i=0; i<u.byteLength; i++) {
	        	this.putAt(this.position + i, u[i] & 0xFF);
	        }
	        this.position += v.byteLength;
	        return this;
	    };
	    /**
	     * Puts a buffer into the buffer at the current position.
	     *
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBuffer
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBuffer = function(v) {
	    
	       var len = v.remaining();
	       _autoExpand(this, len);
	 	   
	       var sourceArray = v.array;
	       var sourceBufferPosition = v.position;
	       var currentPosition = this.position;
	       
	       for (var i = 0; i < len; i++) {
	           this.array[i + currentPosition] = sourceArray[i + sourceBufferPosition];
	       }
	       
	       this.position += len;
	       return this;
	    };
	
	    
	    /**
	     * Puts a buffer into the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     * @param v     {Array}  the single-byte array
	     *
	     * @return {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name putBufferAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.putBufferAt = function(index, v) {
	       var len = v.remaining();
	       _autoExpand(this, len);
	       
	       var sourceArray = v.array;
	       var sourceBufferPosition = v.position;
	       var currentPosition = this.position;
	       
	       for (var i = 0; i < len; i++) {
	           this.array[i + currentPosition] = sourceArray[i + sourceBufferPosition];
	       }
	       
	       return this;
	    };
	    
	    /**
	     * Returns a single-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the single-byte number
	     *
	     * @public
	     * @function
	     * @name get
	     * @memberOf ByteBuffer
	     */
	    $prototype.get = function() {
	      _checkForRead(this,1);
	      return this.order._toByte(this.array[this.position++]);
	    };
	
	    /**
	     * Returns a single-byte number from the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     *
	     * @return {Number}  the single-byte number
	     *
	     * @public
	     * @function
	     * @name getAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getAt = function(index) {
	    	_checkForReadAt(this,index,1);
	        return this.order._toByte(this.array[index]);
	    };
	
	    /**
	     * Returns an unsigned single-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned single-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsigned
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsigned = function() {
	    	_checkForRead(this,1);
	        var val = this.order._toUnsignedByte(this.array[this.position++]);
	        return val;
	    };
	    /**
	     * Returns an unsigned single-byte number from the buffer at the specified index.
	     *
	     * @param index  the index
	     *
	     * @return  the unsigned single-byte number
	     * @public
	     * @function
	     * @name getUnsignedAt
	     * @memberOf ByteBuffer
	
	     */
	    $prototype.getUnsignedAt = function(index) {
	    	_checkForReadAt(this,index,1);
	        return this.order._toUnsignedByte(this.array[index]);
	    }
	
	    /**
	     * Returns a n-byte number from the buffer at the current position.
	     *
	     * @param size     {Number} size the size of the buffer to be returned
	     *
	     * @return {Array}  a new byte array with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBytes
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBytes = function(size) {
	    	_checkForRead(this,size);
	        var byteArray = new Array();
	        for(var i=0; i<size; i++) {
	            byteArray.push(this.order._toByte(this.array[i+this.position]));
	        }
	        this.position += size;
	        return byteArray;
	    };
	
	    /**
	     * Returns a n-byte number from the buffer at the specified index.
	     *
	     * @param index    {Number} the index
	     * @param size     {Number} size the size of the buffer to be returned
	     *
	     * @return {Array}  a new byte array with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBytes
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBytesAt = function(index,size) {
	    	_checkForReadAt(this,index,size);
	        var byteArray = new Array();
	        var sourceArray = this.array;
	        for (var i = 0; i < size; i++) {
	         byteArray.push(sourceArray[i + index]);
	        }
	        return byteArray;
	    };
	
	    /**
	     * Returns a Blob from the buffer at the current position.
	     *
	     * @param size     {Number} size the size of the Blob to be returned
	     *
	     * @return {Blob}  a new Blob with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBlob
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBlob = function(size) {
	        var bytes = this.array.slice(this.position, size);
	        this.position += size;
	        return $module.BlobUtils.fromNumberArray(bytes);
	    }
	
	    /**
	     * Returns a Blob from the buffer at the specified index.
	     *
	     * @param index    {Number} the index
	     * @param size     {Number} size the size of the Blob to be returned
	     *
	     * @return {Blob}  a new Blob with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getBlobAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getBlobAt = function(index, size) {
	        var bytes = this.getBytesAt(index, size);
	        return $module.BlobUtils.fromNumberArray(bytes);
	
	    }
	    
	    /**
	     * Returns a ArrayBuffer from the buffer at the current position.
	     *
	     * @param size     {Number} size the size of the ArrayBuffer to be returned
	     *
	     * @return {ArrayBuffer}  a new ArrayBuffer with bytes read from the buffer
	     *
	     * @public
	     * @function
	     * @name getArrayBuffer
	     * @memberOf ByteBuffer
	     */
	    $prototype.getArrayBuffer = function(size) {
	    	 var u = new Uint8Array(size);
	         u.set(this.array.slice(this.position, size));
	         this.position += size;
	         return u.buffer;
	    }            	
	
	    /**
	     * Returns a two-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the two-byte number
	     *
	     * @public
	     * @function
	     * @name getShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.getShort = function() {
	    	_checkForRead(this,2);
	        var val = this.getShortAt(this.position);
	        this.position += 2;
	        return val;
	    };
	    
	    /**
	     * Returns a two-byte number from the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     *
	     * @return {Number}  the two-byte number
	     *
	     * @public
	     * @function
	     * @name getShortAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getShortAt = function(index) {
	    	_checkForReadAt(this,index,2);
	        var array = this.array;
	        return this.order._toShort(array[index++], array[index++]);
	    };
	
	    /**
	     * Returns an unsigned two-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned two-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedShort
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedShort = function() {
	    	_checkForRead(this,2);
	        var val = this.getUnsignedShortAt(this.position);
	        this.position += 2;
	        return val;
	    };
	
	    /**
	     * Returns an unsigned two-byte number from the buffer at the specified index.
	     *
	     * 
	     * @return  the unsigned two-byte number
	     * @public
	     * @function
	     * @name getUnsignedShortAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedShortAt = function(index) {
	    	_checkForReadAt(this,index,2);
	        var array = this.array;
	        return this.order._toUnsignedShort(array[index++], array[index++]);
	    }
	
	    /**
	     * Returns an unsigned three-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned three-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedMediumInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedMediumInt = function() {
	        var array = this.array;
	        return this.order._toUnsignedMediumInt(array[this.position++], array[this.position++], array[this.position++]);
	    };
	
	    /**
	     * Returns a three-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the three-byte number
	     *
	     * @public
	     * @function
	     * @name getMediumInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getMediumInt = function() {
	        var val = this.getMediumIntAt(this.position);
	        this.position += 3;
	        return val;
	    };
	
	    /**
	     * Returns a three-byte number from the buffer at the specified index.
	     *
	     * @param i     {Number} the index
	     *
	     * @return {Number}  the three-byte number
	     *
	     * @public
	     * @function
	     * @name getMediumIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getMediumIntAt = function(i) {
	        var array = this.array;
	        return this.order._toMediumInt(array[i++], array[i++], array[i++]);
	    };
	
	    /**
	     * Returns a four-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the four-byte number
	     *
	     * @public
	     * @function
	     * @name getInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getInt = function() {
	    	_checkForRead(this,4);
	        var val = this.getIntAt(this.position);
	        this.position += 4;
	        return val;
	    };
	    
	    /**
	     * Returns a four-byte number from the buffer at the specified index.
	     *
	     * @param index     {Number} the index
	     *
	     * @return {Number}  the four-byte number
	     *
	     * @public
	     * @function
	     * @name getIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getIntAt = function(index) {
	    	_checkForReadAt(this,index,4);
	        var array = this.array;
	        return this.order._toInt(array[index++], array[index++], array[index++], array[index++]);
	    };
	
	    /**
	     * Returns an unsigned four-byte number from the buffer at the current position.
	     *
	     * @return {Number}  the unsigned four-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedInt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedInt = function() {
	    	_checkForRead(this,4);
	        var val = this.getUnsignedIntAt(this.position);
	        this.position += 4;
	        return val;
	    };
	
	    /**
	     * Returns an unsigned four-byte number from the buffer at the specified position.
	     * 
	     * @param index the index
	     * 
	     * @return {Number}  the unsigned four-byte number
	     *
	     * @public
	     * @function
	     * @name getUnsignedIntAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.getUnsignedIntAt = function(index) {
	    	_checkForReadAt(this,index,4);
	        var array = this.array;
	        return this.order._toUnsignedInt(array[index++], array[index++], array[index++], array[index++]);
	        return val;
	    };
	
	    /**
	     * Returns a length-prefixed string from the buffer at the current position.
	     *
	     * @param  fieldSize {Number}   the width in bytes of the prefixed length field
	     * @param  cs        {Charset}  the character set
	     *
	     * @return {String}  the length-prefixed string
	     *
	     * @public
	     * @function
	     * @name getPrefixedString
	     * @memberOf ByteBuffer
	     */
	    $prototype.getPrefixedString = function(fieldSize, cs) {
	      var len = 0;
	      switch (fieldSize || 2) {
	        case 1:
	          len = this.getUnsigned();
	          break;
	        case 2:
	          len = this.getUnsignedShort();
	          break;
	        case 4:
	          len = this.getInt();
	          break;
	      }
	      
	      if (len === 0) {
	        return "";
	      }
	      
	      var oldLimit = this.limit;
	      try {
	          this.limit = this.position + len;
	          return cs.decode(this);
	      }
	      finally {
	          this.limit = oldLimit;
	      }
	    };
	    
	    /**
	     * Returns a string from the buffer at the current position. 
	     * 
	     * @param  cs  {Charset}  the character set
	     *
	     * @return {String}  the string
	     *
	     * @public
	     * @function
	     * @name getString
	     * @memberOf ByteBuffer
	     */
	    $prototype.getString = function(cs) {
	      try {
	          return cs.decode(this);
	      }
	      finally {
	          this.position = this.limit;
	      }
	    };
	    
	    /**
	     * Returns a sliced buffer, setting the position to zero, and 
	     * decrementing the limit accordingly.
	     *
	     * @return  {ByteBuffer} the sliced buffer
	     *
	     * @public
	     * @function
	     * @name slice
	     * @memberOf ByteBuffer
	     */
	    $prototype.slice = function() {
	      return new ByteBuffer(this.array.slice(this.position, this.limit));
	    };
	
	    /**
	     * Flips the buffer. The limit is set to the current position,
	     * the position is set to zero, and the mark is reset.
	     *
	     * @return  {ByteBuffer} the flipped buffer
	     *
	     * @public
	     * @function
	     * @name flip
	     * @memberOf ByteBuffer
	     */    
	    $prototype.flip = function() {
	       this.limit = this.position;
	       this.position = 0;
	       this._mark = -1;
	       return this;
	    };
	    
	    /**
	     * Rewinds the buffer. The position is set to zero and the mark is reset.
	     *
	     * @return  {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name rewind
	     * @memberOf ByteBuffer
	     */    
	    $prototype.rewind = function() {
	       this.position = 0;
	       this._mark = -1;
	       return this;
	    };
	    
	    /**
	     * Clears the buffer. The position is set to zero, the limit is set to the
	     * capacity and the mark is reset.
	     *
	     * @return  {ByteBuffer} the buffer
	     *
	     * @public
	     * @function
	     * @name clear
	     * @memberOf ByteBuffer
	     */    
	    $prototype.clear = function() {
	       this.position = 0;
	       this.limit = this.capacity;
	       this._mark = -1;
	       return this;
	    };
	    
	    /**
	     * Returns the number of bytes remaining from the current position to the limit.
	     *
	     * @return {Number} the number of bytes remaining
	     *
	     * @public
	     * @function
	     * @name remaining
	     * @memberOf ByteBuffer
	     */
	    $prototype.remaining = function() {
	      return (this.limit - this.position);
	    };
	    
	    /**
	     * Returns true   if this buffer has remaining bytes, 
	     *         false  otherwise.
	     *
	     * @return  {Boolean} whether this buffer has remaining bytes
	     *
	     * @public
	     * @function
	     * @name hasRemaining
	     * @memberOf ByteBuffer
	     */
	    $prototype.hasRemaining = function() {
	      return (this.limit > this.position);
	    };
	
	    /**
	     * Skips the specified number of bytes from the current position.
	     * 
	     * @param  size  {Number}  the number of bytes to skip
	     *
	     * @return  {ByteBuffer}  the buffer
	     *
	     * @public
	     * @function
	     * @name skip
	     * @memberOf ByteBuffer
	     */    
	    $prototype.skip = function(size) {
	      this.position += size;
	      return this;
	    };
	    
	    /**
	     * Returns a hex dump of this buffer.
	     *
	     * @return  {String}  the hex dump
	     *
	     * @public
	     * @function
	     * @name getHexDump
	     * @memberOf ByteBuffer
	     */    
	    $prototype.getHexDump = function() {
	       var array = this.array;
	       var pos = this.position;
	       var limit = this.limit;
	
	       if (pos == limit) {
	         return "empty";
	       }
	       
	       var hexDump = [];
	       for (var i=pos; i < limit; i++) {
	         var hex = (array[i] || 0).toString(16);
	         if (hex.length == 1) {
	             hex = "0" + hex;
	         }
	         hexDump.push(hex);
	       }
	       return hexDump.join(" ");
	    };
	    
	    /**
	     * Returns the string representation of this buffer.
	     *
	     * @return  {String}  the string representation
	     *
	     * @public
	     * @function
	     * @name toString
	     * @memberOf ByteBuffer
	     */    
	    $prototype.toString = $prototype.getHexDump;
	
	    /**
	     * Expands the buffer to support the expected number of remaining bytes
	     * after the current position.
	     *
	     * @param  expectedRemaining  {Number}  the expected number of remaining bytes
	     *
	     * @return {ByteBuffer}  the buffer
	     *
	     * @public
	     * @function
	     * @name expand
	     * @memberOf ByteBuffer
	     */
	    $prototype.expand = function(expectedRemaining) {
	      return this.expandAt(this.position, expectedRemaining);
	    };
	    
	    /**
	     * Expands the buffer to support the expected number of remaining bytes
	     * at the specified index.
	     *
	     * @param  i                  {Number} the index
	     * @param  expectedRemaining  {Number}  the expected number of remaining bytes
	     *
	     * @return {ByteBuffer}  the buffer
	     *
	     * @public
	     * @function
	     * @name expandAt
	     * @memberOf ByteBuffer
	     */
	    $prototype.expandAt = function(i, expectedRemaining) {
	      var end = i + expectedRemaining;
	
	      if (end > this.capacity) {
	        this.capacity = end;
	      }
	      
	      if (end > this.limit) {
	        this.limit = end;
	      }
	      return this;
	    };
	    
	    function _autoExpand($this, expectedRemaining) {
	      if ($this.autoExpand) {
	        $this.expand(expectedRemaining);
	      }
	      return $this;
	    }
	
	    function _checkForRead($this, expected) {
	      var end = $this.position + expected;
	      if (end > $this.limit) {
	        throw new Error("Buffer underflow");
	      }
	      return $this;
	    }
	
	    function _checkForReadAt($this, index, expected) {
	      var end = index + expected;
	      if (index < 0 || end > $this.limit) {
	        throw new Error("Index out of bounds");
	      }
	      return $this;
	    }
	    
	    function _checkForWriteAt($this, index, expected) {
	      var end = index + expected;
	      if (index < 0 || end > $this.limit) {
	        throw new Error("Index out of bounds");
	      }
	      return $this;
	    }
	    
	    $module.ByteBuffer = ByteBuffer;        
    }
   
})(Kaazing);

/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

(function($module) {

    if (typeof $module.Charset === "undefined") {
    
        /**
	     * Charset is an abstract super class for all character set encoders and decoders.
	     *
	     * @constructor
	     * 
	     * @class  Charset provides character set encoding and decoding for JavaScript.
	     */
		var Charset = function(){}
	    /**
	     * @ignore
	     */
	    var $prototype = Charset.prototype; 
	
	    /**
	     * Decodes a ByteBuffer into a String.  Bytes for partial characters remain 
	     * in the ByteBuffer after decode has completed.
	     *
	     * @param {ByteBuffer} buf  the ByteBuffer to decode
	     * @return {String}  the decoded String
	     *
	     * @public
	     * @function
	     * @name decode
	     * @memberOf Charset
	     */
	    $prototype.decode = function(buf) {}
	    
	    /**
	     * Encodes a String into a ByteBuffer.
	     *
	     * @param {String}     text  the String to encode
	     * @param {ByteBuffer} buf   the target ByteBuffer
	     * @return {void}
	     *
	     * @public
	     * @function
	     * @name encode
	     * @memberOf Charset
	     */
	    $prototype.encode = function(str, buf) {}
	    
	    /**
	     * The UTF8 character set encoder and decoder.
	     *
	     * @public
	     * @static
	     * @final
	     * @field
	     * @name UTF8
	     * @type Charset
	     * @memberOf Charset
	     */
	    Charset.UTF8 = (function() {
		    function UTF8() {}
		    UTF8.prototype = new Charset();
		
		    /**
		     * @ignore
		     */
		    var $prototype = UTF8.prototype; 
	
	        $prototype.decode = function(buf) {
	        
	            var remainingData = buf.remaining();
	            
	            // use different strategies for building string sizes greater or
	            // less than 10k.
	            var shortBuffer = remainingData < 10000;
	
	            var decoded = [];
	            var sourceArray = buf.array;
	            var beginIndex = buf.position;
	            var endIndex = beginIndex + remainingData;
	            var byte0, byte1, byte2, byte3;
	            for (var i = beginIndex; i < endIndex; i++) {
	                byte0 = (sourceArray[i] & 255);
	                var byteCount = charByteCount(byte0);
	                var remaining = endIndex - i;
	                if (remaining < byteCount) {
	                    break;
	                }
	                var charCode = null;
	                switch (byteCount) {
	                    case 1:
	                        // 000000-00007f    0zzzzzzz
	                        charCode = byte0;
	                        break;
	                    case 2:
	                        // 000080-0007ff    110yyyyy 10zzzzzz
	                        i++;
	                        byte1 = (sourceArray[i] & 255);
	                        
	                        charCode = ((byte0 & 31) << 6) | (byte1 & 63);
	                        break;
	                    case 3:
	                        // 000800-00ffff    1110xxxx 10yyyyyy 10zzzzzz
	                        i++;
	                        byte1 = (sourceArray[i] & 255);
	                        
	                        i++;
	                        byte2 = (sourceArray[i] & 255);
	                        
	                        charCode = ((byte0 & 15) << 12) | ((byte1 & 63) << 6) | (byte2 & 63);
	                        break;
	                    case 4:
	                        // 010000-10ffff    11110www 10xxxxxx 10yyyyyy 10zzzzzz
	                        i++;
	                        byte1 = (sourceArray[i] & 255);
	                        
	                        i++;
	                        byte2 = (sourceArray[i] & 255);
	                        
	                        i++;
	                        byte3 = (sourceArray[i] & 255);
	                        
	                        charCode = ((byte0 & 7) << 18) | ((byte1 & 63) << 12) | ((byte2 & 63) << 6) | (byte3 & 63);
	                        break;
	                }
	
	                if (shortBuffer) {
	                    decoded.push(charCode);
	                } else {
	                    decoded.push(String.fromCharCode(charCode));
	                }
	            }
	            
	            if (shortBuffer) {
	                return String.fromCharCode.apply(null, decoded);
	            } else {
	                return decoded.join("");
	            }
	        };
	
		    $prototype.encode = function(str, buf) {
		        var currentPosition = buf.position;
		        var mark = currentPosition;
		        var array = buf.array;
		        for (var i = 0; i < str.length; i++) {
		            var charCode = str.charCodeAt(i);
		            if (charCode < 0x80) {
		                // 000000-00007f    0zzzzzzz
		                array[currentPosition++] = charCode;
		            }
		            else if (charCode < 0x0800) {
		                // 000080-0007ff    110yyyyy 10zzzzzz
		                array[currentPosition++] = (charCode >> 6) | 192;
		                array[currentPosition++] = (charCode & 63) | 128;
		            }
		            else if (charCode < 0x10000) {
					    // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
		                array[currentPosition++] = (charCode >> 12) | 224;
		                array[currentPosition++] = ((charCode >> 6) & 63) | 128;
		                array[currentPosition++] = (charCode & 63) | 128;
		            }
		            else if (charCode < 0x110000) {
		                // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
		                array[currentPosition++] = (charCode >> 18) | 240;
		                array[currentPosition++] = ((charCode >> 12) & 63) | 128;
		                array[currentPosition++] = ((charCode >> 6) & 63) | 128;
		                array[currentPosition++] = (charCode & 63) | 128;
		            }
		            else {
		                throw new Error("Invalid UTF-8 string");
		            }
		        }
		        buf.position = currentPosition;
		        buf.expandAt(currentPosition, currentPosition - mark);
		    };
		    
		    $prototype.encodeAsByteArray = function(str) {
		    	var bytes = new Array();
		    	for (var i = 0; i < str.length; i++) {
		            var charCode = str.charCodeAt(i);
		            if (charCode < 0x80) {
		                // 000000-00007f    0zzzzzzz
		                bytes.push(charCode);
		            }
		            else if (charCode < 0x0800) {
		                // 000080-0007ff    110yyyyy 10zzzzzz
		                bytes.push((charCode >> 6) | 192);
		                bytes.push((charCode & 63) | 128);
		            }
		            else if (charCode < 0x10000) {
					    // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
		                bytes.push((charCode >> 12) | 224);
		                bytes.push(((charCode >> 6) & 63) | 128);
		                bytes.push((charCode & 63) | 128);
		            }
		            else if (charCode < 0x110000) {
		                // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
		                bytes.push((charCode >> 18) | 240);
		                bytes.push(((charCode >> 12) & 63) | 128);
		                bytes.push(((charCode >> 6) & 63) | 128);
		                bytes.push((charCode & 63) | 128);
		            }
		            else {
		                throw new Error("Invalid UTF-8 string");
		            }
		        }
		        return bytes;
		    };
		
		    // encode a byte array to UTF-8 string
		    $prototype.encodeByteArray = function(array) {
		    	var strLen = array.length;
		    	var bytes = [];
		    	for (var i = 0; i < strLen; i++) {
		            var charCode = array[i];
		            if (charCode < 0x80) {
		                // 000000-00007f    0zzzzzzz
		                bytes.push(charCode);
		            }
		            else if (charCode < 0x0800) {
		                // 000080-0007ff    110yyyyy 10zzzzzz
		                bytes.push((charCode >> 6) | 192);
		                bytes.push((charCode & 63) | 128);
		            }
		            else if (charCode < 0x10000) {
					    // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
		                bytes.push((charCode >> 12) | 224);
		                bytes.push(((charCode >> 6) & 63) | 128);
		                bytes.push((charCode & 63) | 128);
		            }
		            else if (charCode < 0x110000) {
		                // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
		                bytes.push((charCode >> 18) | 240);
		                bytes.push(((charCode >> 12) & 63) | 128);
		                bytes.push(((charCode >> 6) & 63) | 128);
		                bytes.push((charCode & 63) | 128);
		            }
		            else {
		                throw new Error("Invalid UTF-8 string");
		            }
		        }
		        return String.fromCharCode.apply(null, bytes);
		    };
		    
		    // encode an arraybuffer to UTF-8 string
		    $prototype.encodeArrayBuffer = function(arraybuffer) {
		        var buf = new Uint8Array(arraybuffer);
		        var strLen = buf.length;
		        var bytes = [];
		    	for (var i = 0; i < strLen; i++) {
		            var charCode = buf[i];
		            if (charCode < 0x80) {
		                // 000000-00007f    0zzzzzzz
		                bytes.push(charCode);
		            }
		            else if (charCode < 0x0800) {
		                // 000080-0007ff    110yyyyy 10zzzzzz
		                bytes.push((charCode >> 6) | 192);
		                bytes.push((charCode & 63) | 128);
		            }
		            else if (charCode < 0x10000) {
					    // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
		                bytes.push((charCode >> 12) | 224);
		                bytes.push(((charCode >> 6) & 63) | 128);
		                bytes.push((charCode & 63) | 128);
		            }
		            else if (charCode < 0x110000) {
		                // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
		                bytes.push((charCode >> 18) | 240);
		                bytes.push(((charCode >> 12) & 63) | 128);
		                bytes.push(((charCode >> 6) & 63) | 128);
		                bytes.push((charCode & 63) | 128);
		            }
		            else {
		                throw new Error("Invalid UTF-8 string");
		            }
		        }
		        return String.fromCharCode.apply(null, bytes);
		    };
		    
		    //decode a UTF-8 string to byte array
	        $prototype.toByteArray = function(str) {
	            
	            
	            var decoded = [];
	            var byte0, byte1, byte2, byte3;
	            var strLen = str.length;
	            for (var i = 0; i < strLen; i++) {
	                byte0 = (str.charCodeAt(i) & 255);
	                var byteCount = charByteCount(byte0);
	                
	                var charCode = null;
	                if (byteCount + i > strLen) {
	                	break;
	                }
	                switch (byteCount) {
	                    case 1:
	                        // 000000-00007f    0zzzzzzz
	                        charCode = byte0;
	                        break;
	                    case 2:
	                        // 000080-0007ff    110yyyyy 10zzzzzz
	                        i++;
	                        byte1 = (str.charCodeAt(i) & 255);
	                        
	                        charCode = ((byte0 & 31) << 6) | (byte1 & 63);
	                        break;
	                    case 3:
	                        // 000800-00ffff    1110xxxx 10yyyyyy 10zzzzzz
	                        i++;
	                        byte1 = (str.charCodeAt(i) & 255);
	                        
	                        i++;
	                        byte2 = (str.charCodeAt(i) & 255);
	                        
	                        charCode = ((byte0 & 15) << 12) | ((byte1 & 63) << 6) | (byte2 & 63);
	                        break;
	                    case 4:
	                        // 010000-10ffff    11110www 10xxxxxx 10yyyyyy 10zzzzzz
	                        i++;
	                        byte1 = (str.charCodeAt(i) & 255);
	                        
	                        i++;
	                        byte2 = (str.charCodeAt(i) & 255);
	                        
	                        i++;
	                        byte3 = (str.charCodeAt(i) & 255);
	                        
	                        charCode = ((byte0 & 7) << 18) | ((byte1 & 63) << 12) | ((byte2 & 63) << 6) | (byte3 & 63);
	                        break;
	                }
	                decoded.push(charCode & 255);
	            }
	            return decoded;
	        };
	
		    /**
		     * Returns the number of bytes used to encode a UTF-8 character, based on the first byte.
		     *
		     * 000000-00007f  0zzzzzzz
		     * 000080-0007ff  110yyyyy 10zzzzzz
		     * 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
		     * 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
		     *
	         * @private 
	         * @static
	         * @function
		     * @memberOf UTF8
		     */    
		    function charByteCount(b) {
		
		        // determine number of bytes based on first zero bit,
		        // starting with most significant bit
		
		        if ((b & 128) === 0) {
		            return 1;
		        }
		        
		        if ((b & 32) === 0) {
		            return 2;
		        }
		        
		        if ((b & 16) === 0) {
		            return 3;
		        }
		        
		        if ((b & 8) === 0) {
		            return 4;
		        }
		        
		        throw new Error("Invalid UTF-8 bytes");
		    }
		    
		    return new UTF8();
		})();
	    
		$module.Charset = Charset;
    }
})(Kaazing);

/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Creates a new URI instance with the specified location.
 *
 * @param {String} str  the location string
 * 
 * @private
 * @class  Represents a Uniform Resource Identifier (URI) reference. 
 */
function URI(str) {
	// TODO: use regular expression instead of manual string parsing
    str = str || "";
    var position = 0;
    
    var schemeEndAt = str.indexOf("://");
    if (schemeEndAt != -1) {
	    /**
	     * The scheme property indicates the URI scheme.
	     *
	     * @public
	     * @field
	     * @name scheme
	     * @type String
	     * @memberOf URI
	     */
        this.scheme = str.slice(0, schemeEndAt);
        position = schemeEndAt + 3;

        var pathAt = str.indexOf('/', position);
        if (pathAt == -1) {
           pathAt = str.length;
           // Add trailing slash to root URI if it is missing
           str += "/";
        }

        var authority = str.slice(position, pathAt);
        /**
         * The authority property indiciates the URI authority.
         *
         * @public
         * @field
         * @name authority
         * @type String
         * @memberOf URI
         */
        this.authority = authority;
        position = pathAt;
        
        /**
         * The host property indiciates the URI host.
         *
         * @public
         * @field
         * @name host
         * @type String
         * @memberOf URI
         */
        this.host = authority;
        var colonAt = authority.indexOf(":");
        if (colonAt != -1) {
            this.host = authority.slice(0, colonAt);

	        /**
	         * The port property indiciates the URI port.
	         *
	         * @public
	         * @field
	         * @name port
	         * @type Number
	         * @memberOf URI
	         */
            this.port = parseInt(authority.slice(colonAt + 1), 10);
            if (isNaN(this.port)) {
                throw new Error("Invalid URI syntax");
            }
        } 
    }

    var queryAt = str.indexOf("?", position);
    if (queryAt != -1) {
        /**
         * The path property indiciates the URI path.
         *
         * @public
         * @field
         * @name path
         * @type String
         * @memberOf URI
         */
        this.path = str.slice(position, queryAt);
        position = queryAt + 1;
    }

    var fragmentAt = str.indexOf("#", position);
    if (fragmentAt != -1) {
        if (queryAt != -1) {
            this.query = str.slice(position, fragmentAt);
        }
        else {
            this.path = str.slice(position, fragmentAt);
        }
        position = fragmentAt + 1;
        /**
         * The fragment property indiciates the URI fragment.
         *
         * @public
         * @field
         * @name fragment
         * @type String
         * @memberOf URI
         */
        this.fragment = str.slice(position);
    }
    else {
        if (queryAt != -1) {
            this.query = str.slice(position);
        }
        else {
            this.path = str.slice(position);
        }
    }
}

(function() {
    var $prototype = URI.prototype;
    
    /**
     * Returns a String representation of this URI.
     *
     * @return {String}  a String representation
     *
     * @public
     * @function
     * @name toString
     * @memberOf URI
     */
    $prototype.toString = function() {
        var sb = [];
        
        var scheme = this.scheme;
        if (scheme !== undefined) {
            sb.push(scheme);
            sb.push("://");
            sb.push(this.host);
            
            var port = this.port;
            if (port !== undefined) {
                sb.push(":");
                sb.push(port.toString());
            }
        }
        
        if (this.path !== undefined) {
          sb.push(this.path);
        }
        
        if (this.query !== undefined) {
          sb.push("?");
          sb.push(this.query);
        }
        
        if (this.fragment !== undefined) {
          sb.push("#");
          sb.push(this.fragment);
        }
        
        return sb.join("");
    };

    var DEFAULT_PORTS = { "http":80, "ws":80, "https":443, "wss":443 };
    
    URI.replaceProtocol = function(location, protocol) {
        var indx = location.indexOf("://");
        if (indx > 0) {
            return protocol + location.substr(indx);
        } else {
            return "";
        }
    }
})();

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * @ignore
 */
var LOADER_BASE_NAME = "AmqpClient";


/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */
// Create Amqp module under root module
Kaazing.AMQP = Kaazing.namespace("Kaazing.AMQP"); 
var $rootModule = Kaazing;
var $module = $rootModule.AMQP;
var $gatewayModule = $rootModule.Gateway;
/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */

// Register as an AMD module.
if ( typeof define === "function" && define.amd ) {
	define( [], function () { 
		return $module; 
	} );
}

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * Base class for classes that dispatch event.
 *
 *
 * @constructor
 *
 * @class  EventDispatcher implements the observer pattern.
 *
 */
var EventDispatcher = function() {

}

;(function($module) {
var $prototype = EventDispatcher.prototype;

$prototype._initEventDispatcher = function() {
    this._eventListeners = {};
}

/**
 * Adds an event listener for the specified type.
 *
 * @param {String}            type      the event type
 *<p>
 * @param {Function}            listener      the listener
 *<p>
 * @return {void}
 *
 * @public
 * @function
 * @name addEventListener
 * @memberOf EventDispatcher#
 */
$prototype.addEventListener = function(type, listener) {
    var listeners = this._eventListeners[type];
    if (listeners) {
        listeners.push(listener);
    } else {
        this._eventListeners[type] = [listener];
    }
}

/**
 * Removes the specified event listener.
 *
 * @param {String}            type      the event type
 *<p>
 * @param {Function}            listener      the listener
 *<p>
 *
 * @return {void}
 *
 * @public
 * @function
 * @name removeEventListener
 * @memberOf EventDispatcher#
 */
$prototype.removeEventListener = function(type, listener) {
    var listeners = this._eventListeners[type];
    if (listeners) {
        var newListeners = [];
        for (var i=0; i<listeners.length; i++) {
            if (listeners[i] !== listener) {
                newListeners.push(listeners[i]);
            }
        }
        this._eventListeners[type] = new Listeners
    }
}

/**
 * Returns true if the event type has at least one listener associated with it.
 *
 * @param {String}            type      the event type
 *
 * @return {Boolean}
 *
 * @public
 * @function
 * @name hasEventListener
 * @memberOf EventDispatcher#
 */
$prototype.hasEventListener = function(type) {
    var listeners = this._eventListeners[type];
    return Boolean(listeners);
}

/**
 * Dispatches an event.
 *
 * @return {void}
 *
 * @public
 * @function
 * @name dispatchEvent
 * @memberOf EventDispatcher#
 */
$prototype.dispatchEvent = function(e) {
    var listeners = this._eventListeners[e.type];
    // if there are any listeners registered for this event type
    if (listeners) {
        for (var i=0; i<listeners.length; i++) {
            listeners[i](e);
        }
    }

    // also fire callback property
    if (this["on" + e.type]) {
        this["on" + e.type](e);    
    }
}

$module.EventDispatcher = EventDispatcher;
// end module closure
})(window || Kaazing.AMQP);


/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * <b>Application developers should use AmqpClientFactory.createAmqpClient() 
 * function to create an instance of AmqpClient.</b>
 *
 * AmqpClient is used to connect to the end-point that handles AMQP 0-9-1
 * protocol over WebSocket.
 *
 * @constructor
 * @param factory {AmqpClientFactory} factory used to create AmqpClient instance
 *
 * @class  AmqpClient models the CONNECTION class defined in AMQP 0-9-1 protocol
 * by abstracting the methods defined in the protocol and exposing a far simpler 
 * API. <b>Application developers should use 
 * <code>AmqpClientFactory#createAmqpClient()</code> function to create an 
 * instance of AmqpClient.</b>
 *
 */
var AmqpClient = function(factory) {
    if (!factory || !(factory instanceof AmqpClientFactory)) {
        throw new Error("AmqpClient: Required parameter \'factory\' must be an instance of AmqpClientFactory");
    }

    this._amqpClientFactory = factory;
    this._options = {}
    this._readyState = 0;

    this._init();
};

(function() {

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * State machine class for representing state graphs with behavior and
 * conditional transitions on input objects.
 *
 * @private
 */
var StateMachine = function(context) {
    this.context = context;
    this.states = {};
};
;(function() {
var _prototype = StateMachine.prototype;

/**
 * A noop function for the default behavior on states for which no
 *  behavior was given.
 * @private
 */
var nullBehavior = function nullBehavior(){};


_prototype.enterState = function(stateName, input, args) {
    if (this.currentState) {
        this.currentState.exitBehavior(this.context, input, args, stateName);
    }

    // change to next state
    var state = this.states[stateName];
    this.currentState = state;

    try {
        state.entryBehavior(this.context, input, args, stateName);
    } catch(e) {
        var transitionError = new Error("Could not call behavior for state " + state.stateName + "\n\n" + e.message);
        transitionError.innerException = e;
        throw(transitionError);
    }

}

_prototype.addState = function(stateName, ruleList, entryBehavior, exitBehavior) {
    var state = {};
    state.stateName = stateName;
    state.entryBehavior = entryBehavior || nullBehavior;
    state.exitBehavior = exitBehavior || nullBehavior;
    this.states[stateName] = (state);

    // build associative lookup of states by name
    state.rules = {};
    var rules = ruleList || [];
    for (var i=0; i<rules.length; i++) {
        var rule = rules[i];
        for (var j=0; j<rule.inputs.length; j++) {
            var input = rule.inputs[j];
            state.rules[input] = rule.targetState;
        }
    }
};

_prototype.feedInput = function(input, args) {
    //console.info("fed input", input, this.currentState);
    var state = this.currentState;
    if (state.rules[input]) {

        var sm = this;
        var func = function() {
            sm.enterState(state.rules[input], input, args);
        };
        
        func();

        // not blocked from moving
        return true;
    } else {
        // do nothing and stay in the same state
        // return false for blocking
        return false;
    }
};

// end module closure
})();
/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * Abstract class AsycClient.
 *
 * @constructor
 *
 * @class  AsyncClient provides base structure and functionality for asynchronous network clients
 *
 * @abstract
 * @private
 *
 */

/*
How to use AsyncClient to develop networking clients
    - register states and transition rules
    - feed input
    - enqueue actions



== I/O ==
How to send and receive data and interact with the lower layer. This is usually
(but not necessarily) a socket. The lower layer might be a network service or
another logical layer within a protocol implementation. For instance AMQP can be
implemented with two AsycClients. AMQP requires state in both the Connection
and Channel layers. The Connection is an asynchronous client which uses a socket
for I/O. Channels are asynchronous clients that use the Connection for I/O.

=== Sending ===

=== Handling Read Events ===



== API ==

=== Raising Events ===

=== Chaining blocking commands ===
AsyncClient is designed to facilitate chained interaction. Public methods should
return 'this' so that several can be called in the same expression, like so:
    client.open().authenticate().getData().sendData().logout();



 *
 *
 */
var AsyncClient = function() {

};
;(function() {
AsyncClient.prototype = new EventDispatcher();
var _prototype = AsyncClient.prototype;

var nullCallable = function nullCallable(){};

var defaultErrorCallable = function defaultErrorCallable(ex) {
    throw ex;
};

//
_prototype._stateMachine = null;

// event dispatching
_prototype.onerror = function(e) {};

// promises?
_prototype._actions = [];

_prototype._processActions = function _processActions() {
    if (!this._actions.length) {
        return;
    }

    var action = this._actions[0];

        //console.info("current state!", this._stateMachine.currentState);
        var movedSuccessfully = this._stateMachine.feedInput(action.actionName + "Action", action);

        if (movedSuccessfully) {
            var context = this;
            setTimeout( function() {
                try {
                    // FIXME: return value is actually a network return value
                    action.func.apply(context, action.args);

                } catch (ex1) {
                    action.error(ex1);
                }
            }, 0);

            // dequeue a successfully processed action
            this._actions.shift();
        };

};

_prototype._enqueueAction = function _enqueueAction(actionName, func, args, continuation, error) {
    var action = {};
    action.actionName = actionName || "";
    action.func = func || nullCallable;
    action.args = args || null;
    action.continuation = continuation || nullCallable;
    action.error = error || defaultErrorCallable;

    this._actions.push(action);

    var context = this;
    var func = function(){context._processActions();};
    setTimeout(func,0);
};

_prototype._initAsyncClient = function() {
    this._initEventDispatcher();
    this._stateMachine = new StateMachine(this);
    this._actions = [];

    // input/output
    this._buffer = null;
    this._socket = null;
}

_prototype._send = null;
_prototype._readHandler = null;

// end module closure
})();

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// AMQP constants
////////////////////////////////////////////////////////////////////////////////
var _constants = {};
_constants.FRAME_METHOD = {"value": 1, "message" : ""};
_constants.FRAME_HEADER = {"value": 2, "message" : ""};
_constants.FRAME_BODY = {"value": 3, "message" : ""};
_constants.FRAME_HEARTBEAT = {"value": 8, "message" : ""};
_constants.FRAME_MIN_SIZE = {"value": 4096, "message" : ""};
_constants.FRAME_END = {"value": 206, "message" : ""};
_constants.REPLY_SUCCESS = {"value": 200, "message" : "Indicates that the method completed successfully. This reply code is reserved for future use - the current protocol design does not use positive confirmation and reply codes are sent only in case of an error."};
_constants.CONTENT_TOO_LARGE = {"value": 311, "message" : "The client attempted to transfer content larger than the server could accept at the present time. The client may retry at a later time."};
_constants.NO_CONSUMERS = {"value": 313, "message" : "When the exchange cannot deliver to a consumer when the immediate flag is set. As a result of pending data on the queue or the absence of any consumers of the queue."};
_constants.CONNECTION_FORCED = {"value": 320, "message" : "An operator intervened to close the connection for some reason. The client may retry at some later date."};
_constants.INVALID_PATH = {"value": 402, "message" : "The client tried to work with an unknown virtual host."};
_constants.ACCESS_REFUSED = {"value": 403, "message" : "The client attempted to work with a server entity to which it has no access due to security settings."};
_constants.NOT_FOUND = {"value": 404, "message" : "The client attempted to work with a server entity that does not exist."};
_constants.RESOURCE_LOCKED = {"value": 405, "message" : "The client attempted to work with a server entity to which it has no access because another client is working with it."};
_constants.PRECONDITION_FAILED = {"value": 406, "message" : "The client requested a method that was not allowed because some precondition failed."};
_constants.FRAME_ERROR = {"value": 501, "message" : "The sender sent a malformed frame that the recipient could not decode. This strongly implies a programming error in the sending peer."};
_constants.SYNTAX_ERROR = {"value": 502, "message" : "The sender sent a frame that contained illegal values for one or more fields. This strongly implies a programming error in the sending peer."};
_constants.COMMAND_INVALID = {"value": 503, "message" : "The client sent an invalid sequence of frames, attempting to perform an operation that was considered invalid by the server. This usually implies a programming error in the client."};
_constants.CHANNEL_ERROR = {"value": 504, "message" : "The client attempted to work with a channel that had not been correctly opened. This most likely indicates a fault in the client layer."};
_constants.UNEXPECTED_FRAME = {"value": 505, "message" : "The peer sent a frame that was not expected, usually in the context of a content header and body.  This strongly indicates a fault in the peer's content processing."};
_constants.RESOURCE_ERROR = {"value": 506, "message" : "The server could not complete the method because it lacked sufficient resources. This may be due to the client creating too many of some type of entity."};
_constants.NOT_ALLOWED = {"value": 530, "message" : "The client tried to work with some entity in a manner that is prohibited by the server, due to security settings or by some other criteria."};
_constants.NOT_IMPLEMENTED = {"value": 540, "message" : "The client tried to use functionality that is not implemented in the server."};
_constants.INTERNAL_ERROR = {"value": 541, "message" : "The server could not complete the method because of an internal error. The server may require intervention by an operator in order to resume normal operations."};

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// AMQP Domains
////////////////////////////////////////////////////////////////////////////////

var _domains = {

    "ClassId" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "ConsumerTag" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "DeliveryTag" : 
        { "type" : "longlong",
          "asserts" : [ ]
        }, 
    "ExchangeName" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "MethodId" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "NoAck" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "NoLocal" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "NoWait" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "Path" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "PeerProperties" : 
        { "type" : "table",
          "asserts" : [ ]
        }, 
    "QueueName" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "Redelivered" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "MessageCount" : 
        { "type" : "long",
          "asserts" : [ ]
        }, 
    "ReplyCode" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "ReplyText" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "Bit" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "Octet" : 
        { "type" : "octet",
          "asserts" : [ ]
        }, 
    "Short" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "Long" : 
        { "type" : "long",
          "asserts" : [ ]
        }, 
    "Longlong" : 
        { "type" : "longlong",
          "asserts" : [ ]
        }, 
    "Shortstr" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "Longstr" : 
        { "type" : "longstr",
          "asserts" : [ ]
        }, 
    "Timestamp" : 
        { "type" : "timestamp",
          "asserts" : [ ]
        }, 
    "Table" : 
        { "type" : "table",
          "asserts" : [ ]
        }
};
/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// AMQP Methods
//
// TODO (optimization):
// As a second pass, we can reduce the generated file size by making these
// structures literals instead of instantiating empty objects and populating
// them with assignment operators.
////////////////////////////////////////////////////////////////////////////////

var _classes = {};


_classes.Connection = {};
_classes.Connection.startConnection = {};

    _classes.Connection.startConnection.allParameters = [ { "name" : "versionMajor", "type" : "Octet"},  { "name" : "versionMinor", "type" : "Octet"},  { "name" : "serverProperties", "type" : "PeerProperties"},  { "name" : "mechanisms", "type" : "Longstr"},  { "name" : "locales", "type" : "Longstr"}];

    _classes.Connection.startConnection.returnType = "StartOkConnection";
    _classes.Connection.startConnection.index = 10;
    _classes.Connection.startConnection.classIndex = 10;
    _classes.Connection.startConnection.synchronous = true;
    _classes.Connection.startConnection.hasContent = false;
_classes.Connection.startOkConnection = {};

    _classes.Connection.startOkConnection.allParameters = [ { "name" : "clientProperties", "type" : "PeerProperties"},  { "name" : "mechanism", "type" : "Shortstr"},  { "name" : "response", "type" : "Longstr"},  { "name" : "locale", "type" : "Shortstr"}];

    _classes.Connection.startOkConnection.returnType = "voidConnection";
    _classes.Connection.startOkConnection.index = 11;
    _classes.Connection.startOkConnection.classIndex = 10;
    _classes.Connection.startOkConnection.synchronous = true;
    _classes.Connection.startOkConnection.hasContent = false;
_classes.Connection.secureConnection = {};

    _classes.Connection.secureConnection.allParameters = [ { "name" : "challenge", "type" : "Longstr"}];

    _classes.Connection.secureConnection.returnType = "SecureOkConnection";
    _classes.Connection.secureConnection.index = 20;
    _classes.Connection.secureConnection.classIndex = 10;
    _classes.Connection.secureConnection.synchronous = true;
    _classes.Connection.secureConnection.hasContent = false;
_classes.Connection.secureOkConnection = {};

    _classes.Connection.secureOkConnection.allParameters = [ { "name" : "response", "type" : "Longstr"}];

    _classes.Connection.secureOkConnection.returnType = "voidConnection";
    _classes.Connection.secureOkConnection.index = 21;
    _classes.Connection.secureOkConnection.classIndex = 10;
    _classes.Connection.secureOkConnection.synchronous = true;
    _classes.Connection.secureOkConnection.hasContent = false;
_classes.Connection.tuneConnection = {};

    _classes.Connection.tuneConnection.allParameters = [ { "name" : "channelMax", "type" : "Short"},  { "name" : "frameMax", "type" : "Long"},  { "name" : "heartbeat", "type" : "Short"}];

    _classes.Connection.tuneConnection.returnType = "TuneOkConnection";
    _classes.Connection.tuneConnection.index = 30;
    _classes.Connection.tuneConnection.classIndex = 10;
    _classes.Connection.tuneConnection.synchronous = true;
    _classes.Connection.tuneConnection.hasContent = false;
_classes.Connection.tuneOkConnection = {};

    _classes.Connection.tuneOkConnection.allParameters = [ { "name" : "channelMax", "type" : "Short"},  { "name" : "frameMax", "type" : "Long"},  { "name" : "heartbeat", "type" : "Short"}];

    _classes.Connection.tuneOkConnection.returnType = "voidConnection";
    _classes.Connection.tuneOkConnection.index = 31;
    _classes.Connection.tuneOkConnection.classIndex = 10;
    _classes.Connection.tuneOkConnection.synchronous = true;
    _classes.Connection.tuneOkConnection.hasContent = false;
_classes.Connection.openConnection = {};

    _classes.Connection.openConnection.allParameters = [ { "name" : "virtualHost", "type" : "Path"},  { "name" : "reserved1", "type" : "Shortstr"},  { "name" : "reserved2", "type" : "Bit"}];

    _classes.Connection.openConnection.returnType = "OpenOkConnection";
    _classes.Connection.openConnection.index = 40;
    _classes.Connection.openConnection.classIndex = 10;
    _classes.Connection.openConnection.synchronous = true;
    _classes.Connection.openConnection.hasContent = false;
_classes.Connection.openOkConnection = {};

    _classes.Connection.openOkConnection.allParameters = [ { "name" : "reserved1", "type" : "Shortstr"}];

    _classes.Connection.openOkConnection.returnType = "voidConnection";
    _classes.Connection.openOkConnection.index = 41;
    _classes.Connection.openOkConnection.classIndex = 10;
    _classes.Connection.openOkConnection.synchronous = true;
    _classes.Connection.openOkConnection.hasContent = false;
_classes.Connection.closeConnection = {};

    _classes.Connection.closeConnection.allParameters = [ { "name" : "replyCode", "type" : "ReplyCode"},  { "name" : "replyText", "type" : "ReplyText"},  { "name" : "classId", "type" : "ClassId"},  { "name" : "methodId", "type" : "MethodId"}];

    _classes.Connection.closeConnection.returnType = "CloseOkConnection";
    _classes.Connection.closeConnection.index = 50;
    _classes.Connection.closeConnection.classIndex = 10;
    _classes.Connection.closeConnection.synchronous = true;
    _classes.Connection.closeConnection.hasContent = false;
_classes.Connection.closeOkConnection = {};

    _classes.Connection.closeOkConnection.allParameters = [];

    _classes.Connection.closeOkConnection.returnType = "voidConnection";
    _classes.Connection.closeOkConnection.index = 51;
    _classes.Connection.closeOkConnection.classIndex = 10;
    _classes.Connection.closeOkConnection.synchronous = true;
    _classes.Connection.closeOkConnection.hasContent = false;


_classes.Connection.methodLookup = {10 : "startConnection", 11 : "startOkConnection", 20 : "secureConnection", 21 : "secureOkConnection", 30 : "tuneConnection", 31 : "tuneOkConnection", 40 : "openConnection", 41 : "openOkConnection", 50 : "closeConnection", 51 : "closeOkConnection"}
_classes.Connection.className = "Connection";

_classes.Channel = {};
_classes.Channel.openChannel = {};

    _classes.Channel.openChannel.allParameters = [ { "name" : "reserved1", "type" : "Shortstr"}];

    _classes.Channel.openChannel.returnType = "OpenOkChannel";
    _classes.Channel.openChannel.index = 10;
    _classes.Channel.openChannel.classIndex = 20;
    _classes.Channel.openChannel.synchronous = true;
    _classes.Channel.openChannel.hasContent = false;
_classes.Channel.openOkChannel = {};

    _classes.Channel.openOkChannel.allParameters = [ { "name" : "reserved1", "type" : "Longstr"}];

    _classes.Channel.openOkChannel.returnType = "voidChannel";
    _classes.Channel.openOkChannel.index = 11;
    _classes.Channel.openOkChannel.classIndex = 20;
    _classes.Channel.openOkChannel.synchronous = true;
    _classes.Channel.openOkChannel.hasContent = false;
_classes.Channel.flowChannel = {};

    _classes.Channel.flowChannel.allParameters = [ { "name" : "active", "type" : "Bit"}];

    _classes.Channel.flowChannel.returnType = "FlowOkChannel";
    _classes.Channel.flowChannel.index = 20;
    _classes.Channel.flowChannel.classIndex = 20;
    _classes.Channel.flowChannel.synchronous = true;
    _classes.Channel.flowChannel.hasContent = false;
_classes.Channel.flowOkChannel = {};

    _classes.Channel.flowOkChannel.allParameters = [ { "name" : "active", "type" : "Bit"}];

    _classes.Channel.flowOkChannel.returnType = "voidChannel";
    _classes.Channel.flowOkChannel.index = 21;
    _classes.Channel.flowOkChannel.classIndex = 20;
    _classes.Channel.flowOkChannel.synchronous = false;
    _classes.Channel.flowOkChannel.hasContent = false;
_classes.Channel.closeChannel = {};

    _classes.Channel.closeChannel.allParameters = [ { "name" : "replyCode", "type" : "ReplyCode"},  { "name" : "replyText", "type" : "ReplyText"},  { "name" : "classId", "type" : "ClassId"},  { "name" : "methodId", "type" : "MethodId"}];

    _classes.Channel.closeChannel.returnType = "CloseOkChannel";
    _classes.Channel.closeChannel.index = 40;
    _classes.Channel.closeChannel.classIndex = 20;
    _classes.Channel.closeChannel.synchronous = true;
    _classes.Channel.closeChannel.hasContent = false;
_classes.Channel.closeOkChannel = {};

    _classes.Channel.closeOkChannel.allParameters = [];

    _classes.Channel.closeOkChannel.returnType = "voidChannel";
    _classes.Channel.closeOkChannel.index = 41;
    _classes.Channel.closeOkChannel.classIndex = 20;
    _classes.Channel.closeOkChannel.synchronous = true;
    _classes.Channel.closeOkChannel.hasContent = false;


_classes.Channel.methodLookup = {10 : "openChannel", 11 : "openOkChannel", 20 : "flowChannel", 21 : "flowOkChannel", 40 : "closeChannel", 41 : "closeOkChannel"}
_classes.Channel.className = "Channel";

_classes.Exchange = {};
_classes.Exchange.declareExchange = {};

    _classes.Exchange.declareExchange.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "type", "type" : "Shortstr"},  { "name" : "passive", "type" : "Bit"},  { "name" : "durable", "type" : "Bit"},  { "name" : "reserved2", "type" : "Bit"},  { "name" : "reserved3", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Exchange.declareExchange.returnType = "DeclareOkExchange";
    _classes.Exchange.declareExchange.index = 10;
    _classes.Exchange.declareExchange.classIndex = 40;
    _classes.Exchange.declareExchange.synchronous = true;
    _classes.Exchange.declareExchange.hasContent = false;
_classes.Exchange.declareOkExchange = {};

    _classes.Exchange.declareOkExchange.allParameters = [];

    _classes.Exchange.declareOkExchange.returnType = "voidExchange";
    _classes.Exchange.declareOkExchange.index = 11;
    _classes.Exchange.declareOkExchange.classIndex = 40;
    _classes.Exchange.declareOkExchange.synchronous = true;
    _classes.Exchange.declareOkExchange.hasContent = false;
_classes.Exchange.deleteExchange = {};

    _classes.Exchange.deleteExchange.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "ifUnused", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Exchange.deleteExchange.returnType = "DeleteOkExchange";
    _classes.Exchange.deleteExchange.index = 20;
    _classes.Exchange.deleteExchange.classIndex = 40;
    _classes.Exchange.deleteExchange.synchronous = true;
    _classes.Exchange.deleteExchange.hasContent = false;
_classes.Exchange.deleteOkExchange = {};

    _classes.Exchange.deleteOkExchange.allParameters = [];

    _classes.Exchange.deleteOkExchange.returnType = "voidExchange";
    _classes.Exchange.deleteOkExchange.index = 21;
    _classes.Exchange.deleteOkExchange.classIndex = 40;
    _classes.Exchange.deleteOkExchange.synchronous = true;
    _classes.Exchange.deleteOkExchange.hasContent = false;


_classes.Exchange.methodLookup = {10 : "declareExchange", 11 : "declareOkExchange", 20 : "deleteExchange", 21 : "deleteOkExchange"}
_classes.Exchange.className = "Exchange";

_classes.Queue = {};
_classes.Queue.declareQueue = {};

    _classes.Queue.declareQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "passive", "type" : "Bit"},  { "name" : "durable", "type" : "Bit"},  { "name" : "exclusive", "type" : "Bit"},  { "name" : "autoDelete", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Queue.declareQueue.returnType = "DeclareOkQueue";
    _classes.Queue.declareQueue.index = 10;
    _classes.Queue.declareQueue.classIndex = 50;
    _classes.Queue.declareQueue.synchronous = true;
    _classes.Queue.declareQueue.hasContent = false;
_classes.Queue.declareOkQueue = {};

    _classes.Queue.declareOkQueue.allParameters = [ { "name" : "queue", "type" : "QueueName"},  { "name" : "messageCount", "type" : "MessageCount"},  { "name" : "consumerCount", "type" : "Long"}];

    _classes.Queue.declareOkQueue.returnType = "voidQueue";
    _classes.Queue.declareOkQueue.index = 11;
    _classes.Queue.declareOkQueue.classIndex = 50;
    _classes.Queue.declareOkQueue.synchronous = true;
    _classes.Queue.declareOkQueue.hasContent = false;
_classes.Queue.bindQueue = {};

    _classes.Queue.bindQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Queue.bindQueue.returnType = "BindOkQueue";
    _classes.Queue.bindQueue.index = 20;
    _classes.Queue.bindQueue.classIndex = 50;
    _classes.Queue.bindQueue.synchronous = true;
    _classes.Queue.bindQueue.hasContent = false;
_classes.Queue.bindOkQueue = {};

    _classes.Queue.bindOkQueue.allParameters = [];

    _classes.Queue.bindOkQueue.returnType = "voidQueue";
    _classes.Queue.bindOkQueue.index = 21;
    _classes.Queue.bindOkQueue.classIndex = 50;
    _classes.Queue.bindOkQueue.synchronous = true;
    _classes.Queue.bindOkQueue.hasContent = false;
_classes.Queue.unbindQueue = {};

    _classes.Queue.unbindQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Queue.unbindQueue.returnType = "UnbindOkQueue";
    _classes.Queue.unbindQueue.index = 50;
    _classes.Queue.unbindQueue.classIndex = 50;
    _classes.Queue.unbindQueue.synchronous = true;
    _classes.Queue.unbindQueue.hasContent = false;
_classes.Queue.unbindOkQueue = {};

    _classes.Queue.unbindOkQueue.allParameters = [];

    _classes.Queue.unbindOkQueue.returnType = "voidQueue";
    _classes.Queue.unbindOkQueue.index = 51;
    _classes.Queue.unbindOkQueue.classIndex = 50;
    _classes.Queue.unbindOkQueue.synchronous = true;
    _classes.Queue.unbindOkQueue.hasContent = false;
_classes.Queue.purgeQueue = {};

    _classes.Queue.purgeQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Queue.purgeQueue.returnType = "PurgeOkQueue";
    _classes.Queue.purgeQueue.index = 30;
    _classes.Queue.purgeQueue.classIndex = 50;
    _classes.Queue.purgeQueue.synchronous = true;
    _classes.Queue.purgeQueue.hasContent = false;
_classes.Queue.purgeOkQueue = {};

    _classes.Queue.purgeOkQueue.allParameters = [ { "name" : "messageCount", "type" : "MessageCount"}];

    _classes.Queue.purgeOkQueue.returnType = "voidQueue";
    _classes.Queue.purgeOkQueue.index = 31;
    _classes.Queue.purgeOkQueue.classIndex = 50;
    _classes.Queue.purgeOkQueue.synchronous = true;
    _classes.Queue.purgeOkQueue.hasContent = false;
_classes.Queue.deleteQueue = {};

    _classes.Queue.deleteQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "ifUnused", "type" : "Bit"},  { "name" : "ifEmpty", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Queue.deleteQueue.returnType = "DeleteOkQueue";
    _classes.Queue.deleteQueue.index = 40;
    _classes.Queue.deleteQueue.classIndex = 50;
    _classes.Queue.deleteQueue.synchronous = true;
    _classes.Queue.deleteQueue.hasContent = false;
_classes.Queue.deleteOkQueue = {};

    _classes.Queue.deleteOkQueue.allParameters = [ { "name" : "messageCount", "type" : "MessageCount"}];

    _classes.Queue.deleteOkQueue.returnType = "voidQueue";
    _classes.Queue.deleteOkQueue.index = 41;
    _classes.Queue.deleteOkQueue.classIndex = 50;
    _classes.Queue.deleteOkQueue.synchronous = true;
    _classes.Queue.deleteOkQueue.hasContent = false;


_classes.Queue.methodLookup = {10 : "declareQueue", 11 : "declareOkQueue", 20 : "bindQueue", 21 : "bindOkQueue", 50 : "unbindQueue", 51 : "unbindOkQueue", 30 : "purgeQueue", 31 : "purgeOkQueue", 40 : "deleteQueue", 41 : "deleteOkQueue"}
_classes.Queue.className = "Queue";

_classes.Basic = {};
_classes.Basic.qosBasic = {};

    _classes.Basic.qosBasic.allParameters = [ { "name" : "prefetchSize", "type" : "Long"},  { "name" : "prefetchCount", "type" : "Short"},  { "name" : "global", "type" : "Bit"}];

    _classes.Basic.qosBasic.returnType = "QosOkBasic";
    _classes.Basic.qosBasic.index = 10;
    _classes.Basic.qosBasic.classIndex = 60;
    _classes.Basic.qosBasic.synchronous = true;
    _classes.Basic.qosBasic.hasContent = false;
_classes.Basic.qosOkBasic = {};

    _classes.Basic.qosOkBasic.allParameters = [];

    _classes.Basic.qosOkBasic.returnType = "voidBasic";
    _classes.Basic.qosOkBasic.index = 11;
    _classes.Basic.qosOkBasic.classIndex = 60;
    _classes.Basic.qosOkBasic.synchronous = true;
    _classes.Basic.qosOkBasic.hasContent = false;
_classes.Basic.consumeBasic = {};

    _classes.Basic.consumeBasic.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "consumerTag", "type" : "ConsumerTag"},  { "name" : "noLocal", "type" : "NoLocal"},  { "name" : "noAck", "type" : "NoAck"},  { "name" : "exclusive", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Basic.consumeBasic.returnType = "ConsumeOkBasic";
    _classes.Basic.consumeBasic.index = 20;
    _classes.Basic.consumeBasic.classIndex = 60;
    _classes.Basic.consumeBasic.synchronous = true;
    _classes.Basic.consumeBasic.hasContent = false;
_classes.Basic.consumeOkBasic = {};

    _classes.Basic.consumeOkBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"}];

    _classes.Basic.consumeOkBasic.returnType = "voidBasic";
    _classes.Basic.consumeOkBasic.index = 21;
    _classes.Basic.consumeOkBasic.classIndex = 60;
    _classes.Basic.consumeOkBasic.synchronous = true;
    _classes.Basic.consumeOkBasic.hasContent = false;
_classes.Basic.cancelBasic = {};

    _classes.Basic.cancelBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Basic.cancelBasic.returnType = "CancelOkBasic";
    _classes.Basic.cancelBasic.index = 30;
    _classes.Basic.cancelBasic.classIndex = 60;
    _classes.Basic.cancelBasic.synchronous = true;
    _classes.Basic.cancelBasic.hasContent = false;
_classes.Basic.cancelOkBasic = {};

    _classes.Basic.cancelOkBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"}];

    _classes.Basic.cancelOkBasic.returnType = "voidBasic";
    _classes.Basic.cancelOkBasic.index = 31;
    _classes.Basic.cancelOkBasic.classIndex = 60;
    _classes.Basic.cancelOkBasic.synchronous = true;
    _classes.Basic.cancelOkBasic.hasContent = false;
_classes.Basic.publishBasic = {};

    _classes.Basic.publishBasic.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "mandatory", "type" : "Bit"},  { "name" : "immediate", "type" : "Bit"}];

    _classes.Basic.publishBasic.returnType = "voidBasic";
    _classes.Basic.publishBasic.index = 40;
    _classes.Basic.publishBasic.classIndex = 60;
    _classes.Basic.publishBasic.synchronous = false;
    _classes.Basic.publishBasic.hasContent = true;
_classes.Basic.returnBasic = {};

    _classes.Basic.returnBasic.allParameters = [ { "name" : "replyCode", "type" : "ReplyCode"},  { "name" : "replyText", "type" : "ReplyText"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"}];

    _classes.Basic.returnBasic.returnType = "voidBasic";
    _classes.Basic.returnBasic.index = 50;
    _classes.Basic.returnBasic.classIndex = 60;
    _classes.Basic.returnBasic.synchronous = false;
    _classes.Basic.returnBasic.hasContent = true;
_classes.Basic.deliverBasic = {};

    _classes.Basic.deliverBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"},  { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "redelivered", "type" : "Redelivered"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"}];

    _classes.Basic.deliverBasic.returnType = "voidBasic";
    _classes.Basic.deliverBasic.index = 60;
    _classes.Basic.deliverBasic.classIndex = 60;
    _classes.Basic.deliverBasic.synchronous = false;
    _classes.Basic.deliverBasic.hasContent = true;
_classes.Basic.getBasic = {};

    _classes.Basic.getBasic.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "noAck", "type" : "NoAck"}];

    _classes.Basic.getBasic.returnType = "GetOkBasic";
    _classes.Basic.getBasic.index = 70;
    _classes.Basic.getBasic.classIndex = 60;
    _classes.Basic.getBasic.synchronous = true;
    _classes.Basic.getBasic.hasContent = false;
_classes.Basic.getOkBasic = {};

    _classes.Basic.getOkBasic.allParameters = [ { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "redelivered", "type" : "Redelivered"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "messageCount", "type" : "MessageCount"}];

    _classes.Basic.getOkBasic.returnType = "voidBasic";
    _classes.Basic.getOkBasic.index = 71;
    _classes.Basic.getOkBasic.classIndex = 60;
    _classes.Basic.getOkBasic.synchronous = true;
    _classes.Basic.getOkBasic.hasContent = true;
_classes.Basic.getEmptyBasic = {};

    _classes.Basic.getEmptyBasic.allParameters = [ { "name" : "reserved1", "type" : "Shortstr"}];

    _classes.Basic.getEmptyBasic.returnType = "voidBasic";
    _classes.Basic.getEmptyBasic.index = 72;
    _classes.Basic.getEmptyBasic.classIndex = 60;
    _classes.Basic.getEmptyBasic.synchronous = true;
    _classes.Basic.getEmptyBasic.hasContent = false;
_classes.Basic.ackBasic = {};

    _classes.Basic.ackBasic.allParameters = [ { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "multiple", "type" : "Bit"}];

    _classes.Basic.ackBasic.returnType = "voidBasic";
    _classes.Basic.ackBasic.index = 80;
    _classes.Basic.ackBasic.classIndex = 60;
    _classes.Basic.ackBasic.synchronous = false;
    _classes.Basic.ackBasic.hasContent = false;
_classes.Basic.rejectBasic = {};

    _classes.Basic.rejectBasic.allParameters = [ { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "requeue", "type" : "Bit"}];

    _classes.Basic.rejectBasic.returnType = "voidBasic";
    _classes.Basic.rejectBasic.index = 90;
    _classes.Basic.rejectBasic.classIndex = 60;
    _classes.Basic.rejectBasic.synchronous = false;
    _classes.Basic.rejectBasic.hasContent = false;
_classes.Basic.recoverAsyncBasic = {};

    _classes.Basic.recoverAsyncBasic.allParameters = [ { "name" : "requeue", "type" : "Bit"}];

    _classes.Basic.recoverAsyncBasic.returnType = "voidBasic";
    _classes.Basic.recoverAsyncBasic.index = 100;
    _classes.Basic.recoverAsyncBasic.classIndex = 60;
    _classes.Basic.recoverAsyncBasic.synchronous = false;
    _classes.Basic.recoverAsyncBasic.hasContent = false;
_classes.Basic.recoverBasic = {};

    _classes.Basic.recoverBasic.allParameters = [ { "name" : "requeue", "type" : "Bit"}];

    _classes.Basic.recoverBasic.returnType = "voidBasic";
    _classes.Basic.recoverBasic.index = 110;
    _classes.Basic.recoverBasic.classIndex = 60;
    _classes.Basic.recoverBasic.synchronous = false;
    _classes.Basic.recoverBasic.hasContent = false;
_classes.Basic.recoverOkBasic = {};

    _classes.Basic.recoverOkBasic.allParameters = [];

    _classes.Basic.recoverOkBasic.returnType = "voidBasic";
    _classes.Basic.recoverOkBasic.index = 111;
    _classes.Basic.recoverOkBasic.classIndex = 60;
    _classes.Basic.recoverOkBasic.synchronous = true;
    _classes.Basic.recoverOkBasic.hasContent = false;


_classes.Basic.methodLookup = {10 : "qosBasic", 11 : "qosOkBasic", 20 : "consumeBasic", 21 : "consumeOkBasic", 30 : "cancelBasic", 31 : "cancelOkBasic", 40 : "publishBasic", 50 : "returnBasic", 60 : "deliverBasic", 70 : "getBasic", 71 : "getOkBasic", 72 : "getEmptyBasic", 80 : "ackBasic", 90 : "rejectBasic", 100 : "recoverAsyncBasic", 110 : "recoverBasic", 111 : "recoverOkBasic"}
_classes.Basic.className = "Basic";

_classes.Tx = {};
_classes.Tx.selectTx = {};

    _classes.Tx.selectTx.allParameters = [];

    _classes.Tx.selectTx.returnType = "SelectOkTx";
    _classes.Tx.selectTx.index = 10;
    _classes.Tx.selectTx.classIndex = 90;
    _classes.Tx.selectTx.synchronous = true;
    _classes.Tx.selectTx.hasContent = false;
_classes.Tx.selectOkTx = {};

    _classes.Tx.selectOkTx.allParameters = [];

    _classes.Tx.selectOkTx.returnType = "voidTx";
    _classes.Tx.selectOkTx.index = 11;
    _classes.Tx.selectOkTx.classIndex = 90;
    _classes.Tx.selectOkTx.synchronous = true;
    _classes.Tx.selectOkTx.hasContent = false;
_classes.Tx.commitTx = {};

    _classes.Tx.commitTx.allParameters = [];

    _classes.Tx.commitTx.returnType = "CommitOkTx";
    _classes.Tx.commitTx.index = 20;
    _classes.Tx.commitTx.classIndex = 90;
    _classes.Tx.commitTx.synchronous = true;
    _classes.Tx.commitTx.hasContent = false;
_classes.Tx.commitOkTx = {};

    _classes.Tx.commitOkTx.allParameters = [];

    _classes.Tx.commitOkTx.returnType = "voidTx";
    _classes.Tx.commitOkTx.index = 21;
    _classes.Tx.commitOkTx.classIndex = 90;
    _classes.Tx.commitOkTx.synchronous = true;
    _classes.Tx.commitOkTx.hasContent = false;
_classes.Tx.rollbackTx = {};

    _classes.Tx.rollbackTx.allParameters = [];

    _classes.Tx.rollbackTx.returnType = "RollbackOkTx";
    _classes.Tx.rollbackTx.index = 30;
    _classes.Tx.rollbackTx.classIndex = 90;
    _classes.Tx.rollbackTx.synchronous = true;
    _classes.Tx.rollbackTx.hasContent = false;
_classes.Tx.rollbackOkTx = {};

    _classes.Tx.rollbackOkTx.allParameters = [];

    _classes.Tx.rollbackOkTx.returnType = "voidTx";
    _classes.Tx.rollbackOkTx.index = 31;
    _classes.Tx.rollbackOkTx.classIndex = 90;
    _classes.Tx.rollbackOkTx.synchronous = true;
    _classes.Tx.rollbackOkTx.hasContent = false;


_classes.Tx.methodLookup = {10 : "selectTx", 11 : "selectOkTx", 20 : "commitTx", 21 : "commitOkTx", 30 : "rollbackTx", 31 : "rollbackOkTx"}
_classes.Tx.className = "Tx";
/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// AMQP Internal lookup structures
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// index->classes
////////////////////////////////////////////////////////////////////////////////
var _classLookup = {

    10 : _classes.Connection, 
    20 : _classes.Channel, 
    40 : _classes.Exchange, 
    50 : _classes.Queue, 
    60 : _classes.Basic, 
    90 : _classes.Tx
};

////////////////////////////////////////////////////////////////////////////////
// methodName->function object
////////////////////////////////////////////////////////////////////////////////
var _methodsByName = {
  "startConnection" : _classes.Connection.startConnection ,"startOkConnection" : _classes.Connection.startOkConnection ,"secureConnection" : _classes.Connection.secureConnection ,"secureOkConnection" : _classes.Connection.secureOkConnection ,"tuneConnection" : _classes.Connection.tuneConnection ,"tuneOkConnection" : _classes.Connection.tuneOkConnection ,"openConnection" : _classes.Connection.openConnection ,"openOkConnection" : _classes.Connection.openOkConnection ,"closeConnection" : _classes.Connection.closeConnection ,"closeOkConnection" : _classes.Connection.closeOkConnection 
,"openChannel" : _classes.Channel.openChannel ,"openOkChannel" : _classes.Channel.openOkChannel ,"flowChannel" : _classes.Channel.flowChannel ,"flowOkChannel" : _classes.Channel.flowOkChannel ,"closeChannel" : _classes.Channel.closeChannel ,"closeOkChannel" : _classes.Channel.closeOkChannel 
,"declareExchange" : _classes.Exchange.declareExchange ,"declareOkExchange" : _classes.Exchange.declareOkExchange ,"deleteExchange" : _classes.Exchange.deleteExchange ,"deleteOkExchange" : _classes.Exchange.deleteOkExchange 
,"declareQueue" : _classes.Queue.declareQueue ,"declareOkQueue" : _classes.Queue.declareOkQueue ,"bindQueue" : _classes.Queue.bindQueue ,"bindOkQueue" : _classes.Queue.bindOkQueue ,"unbindQueue" : _classes.Queue.unbindQueue ,"unbindOkQueue" : _classes.Queue.unbindOkQueue ,"purgeQueue" : _classes.Queue.purgeQueue ,"purgeOkQueue" : _classes.Queue.purgeOkQueue ,"deleteQueue" : _classes.Queue.deleteQueue ,"deleteOkQueue" : _classes.Queue.deleteOkQueue 
,"qosBasic" : _classes.Basic.qosBasic ,"qosOkBasic" : _classes.Basic.qosOkBasic ,"consumeBasic" : _classes.Basic.consumeBasic ,"consumeOkBasic" : _classes.Basic.consumeOkBasic ,"cancelBasic" : _classes.Basic.cancelBasic ,"cancelOkBasic" : _classes.Basic.cancelOkBasic ,"publishBasic" : _classes.Basic.publishBasic ,"returnBasic" : _classes.Basic.returnBasic ,"deliverBasic" : _classes.Basic.deliverBasic ,"getBasic" : _classes.Basic.getBasic ,"getOkBasic" : _classes.Basic.getOkBasic ,"getEmptyBasic" : _classes.Basic.getEmptyBasic ,"ackBasic" : _classes.Basic.ackBasic ,"rejectBasic" : _classes.Basic.rejectBasic ,"recoverAsyncBasic" : _classes.Basic.recoverAsyncBasic ,"recoverBasic" : _classes.Basic.recoverBasic ,"recoverOkBasic" : _classes.Basic.recoverOkBasic 
,"selectTx" : _classes.Tx.selectTx ,"selectOkTx" : _classes.Tx.selectOkTx ,"commitTx" : _classes.Tx.commitTx ,"commitOkTx" : _classes.Tx.commitOkTx ,"rollbackTx" : _classes.Tx.rollbackTx ,"rollbackOkTx" : _classes.Tx.rollbackOkTx 

};
////////////////////////////////////////////////////////////////////////////////
// AMQP Basic Content fields
////////////////////////////////////////////////////////////////////////////////
/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * Data and framing layer for the AMQP protocol
 *
 * @constructor
 * @private
 * @class  AmqpBuffer extends ByteBuffer to add support for AMQP primative and
 *          compound types.
 */

var AmqpBuffer = function(bytes) {
    this.array = bytes || [];
    this._mark = -1;
    this.limit = this.capacity = this.array.length;
    // Default to network byte order
    this.order = $rootModule.ByteOrder.BIG_ENDIAN;

    // consecutive bit counter for bit packing
    this.bitCount = 0;
};

AmqpBuffer.prototype = new $rootModule.ByteBuffer();

var _assert = function(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
};

var _typeCodecMap = {
    "octet" : "Unsigned",
    "short" : "UnsignedShort",
    "long" : "UnsignedInt",
    "longlong" : "UnsignedLong",
    "int" : "Int",
    "table" : "Table",
    "longstr" : "LongString",
    "shortstr": "ShortString",
    "bit" : "Bit",
    "fieldtable" : "FieldTable",
    "timestamp" : "Timestamp",
    "void" : "Void"
};

// 4.2.1 Formal Protocol Grammar
var _typeIdentifierMap = {
/*    "t" : "octet",
    "b" : /
    "B" : "octet",
    "U" :
    "u" : "short"
    "I" : "int",
    "i" :
    "L" :
    "l" :
    "f" :
    "d" :
    "D" :
    "s" :
    "S" : "longstr",
    "A" :
    "T" : "table",
    "F" :
    "V" : "void"
*/
    "F" : "fieldtable",
    "S" : "longstr",
    "I" : "int",
    "V" : "void"
}


var _typeNameMap = {

    "longstr" : "S",
    "int"  : "I",
    "void" : "V"
}

/**
 * Encodes the AMQPLAIN authentication response as an AmqpTable
 * @private
 */
var _encodeAuthAmqPlain = function(username, password) {
    var bytes = new AmqpBuffer();
    bytes.putShortString("LOGIN");
        bytes.putTypeIdentifier("longstr");
    bytes.putLongString(username);

    bytes.putShortString("PASSWORD");
        bytes.putTypeIdentifier("longstr");
    bytes.putLongString(password);
    bytes.rewind();

    var len = bytes.remaining();
    var chars = [];
    for (var i=0; i<len; i++) {
        chars.push(String.fromCharCode(bytes.getUnsigned()));
    }
    return chars.join("");
};

var _encodeAuthPlain = function(username, password) {
    // OpenAmq uses (SASL)PLAIN authentication instead of
    // AMQPLAIN
    // 0 username 0 password
    throw new Error("AMQPLAIN not implemented");
};



/**
 * getLongString returns an AMQP long string, which is a string prefixed
 * by a unsigned 32 bit integer.
 *
 * @public
 * @function
 * @name getLongString
 * @memberOf AmqpBuffer
 */
AmqpBuffer.prototype.getLongString = function() {
    var len = this.getUnsignedInt();
    var chars = [];
    for (var i=0; i<len; i++) {
        chars.push(String.fromCharCode(this.getUnsigned()));
    }
    return chars.join("");
};

AmqpBuffer.prototype.getShortString = function() {
    var len = this.getUnsigned();
    var chars = [];
    for (var i=0; i<len; i++) {
        chars.push(String.fromCharCode(this.getUnsigned()));
    }
    return chars.join("");
};

// getVoid was added to support Void type header(header value is null).
AmqpBuffer.prototype.getVoid = function() {
};

AmqpBuffer.prototype.getTypeIdentifier = function() {
    var i = this.getUnsigned();
    return _typeIdentifierMap[String.fromCharCode(i)];
};

AmqpBuffer.prototype.putTypeIdentifier = function(type) {
    var ti = _typeNameMap[type];
    this.putUnsigned(ti.charCodeAt(0));
};

AmqpBuffer.prototype.getFieldValue=function(){
    var typeCode = this.getUnsigned();
    switch(String.fromCharCode(typeCode)) {
    case 't':
        return !!this.getUnsigned();
    default:
        throw new Error("Decoding Error in AmqpBuffer: cannot decode field value")
    }
}

AmqpBuffer.prototype.getFieldTable=function(){
    // length of field table
    var l = this.getUnsignedInt();
    // empty table
    var ft = {};

    var initial = this.position;
    while(l > (this.position - initial)) {
        var key = this.getShortString();
        var value = this.getFieldValue();
        ft[key] = value;
    }
    return ft;
}

AmqpBuffer.prototype.getTable = function() {
    var table = new AmqpArguments();
    var len = this.getUnsignedInt();
    
    // get the table sliced out;
    var bytes = new AmqpBuffer(this.array.slice(this.position, this.position+len));
    this.position += len;

    while (bytes.remaining()) {
        var kv = {};
        kv.key = bytes.getShortString();
        var ti = bytes.getTypeIdentifier();
        kv.value = bytes["get"+_typeCodecMap[ti]]();        
        kv.type = _typeCodecMap[ti];
        table.push(kv);
    }

    return table;
};

/**
 * Returns the bit at the specified offset
 */
AmqpBuffer.prototype.getBit = function(offset) {
    
    return this.getUnsigned();
}

/**
 * Packs one (of possibly several) boolean values as bits into a single 8-bit
 * field.
 *
 * If the last value written was a bit, the buffer's bit flag is false.
 * If the buffer's bit flag is set, putBit will try to pack the current bit
 * value into the same byte.
 */
AmqpBuffer.prototype.putBit = function(v) {
    //log2("bit counter was: ", this.bitCount);
    if (this.bitCount > 0) {
        var lastByte = this.array[this.position-1];
        lastByte = v << this.bitCount | lastByte;
        this.array[this.position-1] = lastByte;
        //log2("last byte was", lastByte);
    } else {
        this.putUnsigned(v);
    }
};

AmqpBuffer.prototype.putUnsignedLong = function(v) {
    this.putInt(0);
    return this.putUnsignedInt(v);
};

AmqpBuffer.prototype.getUnsignedLong = function(v) {
    // For unsigned longs (8 byte integers)
    // throw away the first word, then read the next
    // word as an unsigned int
    this.getInt();
    return this.getUnsignedInt();
};


AmqpBuffer.prototype.putTimestamp = function(v) {
    var ts = v.getTime(); 
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 7; i >= 0; i--) {
        var b = v & 0xff;
        byteArray[i] = b;
        v = (v - b)/256;
    }
    this.putBytes(byteArray);
    return this;
};

AmqpBuffer.prototype.getTimestamp = function(v) {
    var bytes = this.getBytes(8);
    var val = 0;
    for(var i = 0; i < 8; i++) {
        val = val * 256 + (bytes[i] & 0xff);
    }
    return new Date(val);
};

AmqpBuffer.prototype.putLongString = function(s) {
    this.putUnsignedInt(s.length);
    for (var i=0; i<s.length; i++) {
        this.putUnsigned(s.charCodeAt(i));
    }
};

AmqpBuffer.prototype.putShortString = function(s) {
    this.putUnsigned(s.length);
    for (var i=0; i<s.length; i++) {
        this.putUnsigned(s.charCodeAt(i));
    }
};

// putVoid was added to support Void type header(header value is null).
AmqpBuffer.prototype.putVoid = function(s) {
};

AmqpBuffer.prototype.putTable = function(table) {
    // accept null arguments for table
    if (!table) {
        this.putUnsignedInt(0);
        return this;
    }


    var bytes = new AmqpBuffer();
    for (var i=0; i<table.length; i++) {
        var entry = table[i];
        bytes.putShortString(entry.key);
        bytes.putTypeIdentifier(entry.type);
        bytes["put" + _typeCodecMap[entry.type]](entry.value);
    }

    bytes.rewind();
    this.putUnsignedInt(bytes.remaining());
    this.putBuffer(bytes);

    return this;
};

////////////////////////////////////////////////////////////////////////////////
// frame types
////////////////////////////////////////////////////////////////////////////////

AmqpBuffer.prototype.getFrameHeader = function() {
    var frameType = this.getUnsigned();
    var channel = this.getUnsignedShort();
    var size = this.getUnsignedInt();

    var header = {}
    header.type = frameType;
    header.size = size;
    header.channel = channel;

    return header;
};

AmqpBuffer.prototype.getFrame = function() {
    var pos = this.position;
    var frame = {};

    // If there is at least one frame in the buffer, attempt to decode it.
    if (this.remaining() > 7) {
        


        frame.header = this.getFrameHeader();
        frame.channel = frame.header.channel;
        frame.type = frame.header.type;

        // the buffer must have an additional byte for the frame end marker
        if (this.remaining() >= frame.header.size + 1) {


            switch (frame.type) {
                case _constants.FRAME_BODY.value:
                    // get the body sliced out;
                    var body = new AmqpBuffer(this.array.slice(this.position, this.position+frame.header.size));
                    this.position += frame.header.size;
                    frame.body = body;

                    frame.methodName = "body";
                    break;
                case _constants.FRAME_HEADER.value:
                    var classIndex = this.getUnsignedShort();
                    var weight = this.getUnsignedShort();
                    var bodySize = this.getUnsignedLong();

                    frame.contentProperties = this.getContentProperties();
                    frame.methodName = "header";
                    break;
                case _constants.FRAME_METHOD.value:
                    var classIndex = this.getUnsignedShort();
                    var methodIndex = this.getUnsignedShort();

                    var clzname = _classLookup[classIndex].className;
                    var methodName = _classLookup[classIndex].methodLookup[methodIndex];

                    var method = _classLookup[classIndex][methodName];
                    // pull paramater list off of method
                    var params = _classLookup[classIndex][methodName].allParameters;

                    frame.methodName = methodName;
                    frame.args = this.getMethodArguments(params);
                    break;

                case 4:                                 // Heartbeat in AMQP 0-9-1
                case _constants.FRAME_HEARTBEAT.value:  // Heartbeat in RabbitMQ 
                    throw new Error("Received heartbeat frame even though the client has expressed no interest in heartbeat via tune-ok method.");

                default:
                    throw new Error("Unrecognized AMQP 0-9-1 Frame type = " + frame.type);
                    break;
            }


            // Having read the frame, check frame end for terminator value
            _assert((this.getUnsigned() === _constants.FRAME_END.value), "AMQP: Frame terminator missing");

        } else {
            //log2("bailing out", this.remaining(), header.size)
            this.position = pos;
            return null;
        }
        return frame;
    }
    //log2("bailing out2", this.remaining());
    return null;
};


AmqpBuffer.prototype.putFrame = function(type, channel, payload) {
    this.putUnsigned(type);
    this.putUnsignedShort(channel);

    // compute size from payload bytes
    var size = payload.remaining();
    this.putUnsignedInt(size);
    this.putBuffer(payload);

    // write terminator
    this.putUnsigned(_constants.FRAME_END.value);
    return this;
};


AmqpBuffer.prototype.putMethodFrame = function(method, channel, args) {
    var payload = new AmqpBuffer();
    payload.putUnsignedShort(method.classIndex);
    payload.putUnsignedShort(method.index);
    payload.putMethodArguments(args, method.allParameters);
    payload.flip();

    return this.putFrame(_constants.FRAME_METHOD.value, channel, payload);
};

AmqpBuffer.prototype.putHeaderFrame = function(channel, classIndex, weight, bodySize, properties) {
    var payload = new AmqpBuffer();

    payload.putUnsignedShort(classIndex);
    payload.putUnsignedShort(weight);
    payload.putUnsignedLong(bodySize);
    // headers have properties
    payload.putContentProperties(properties);

    payload.flip();
    return this.putFrame(_constants.FRAME_HEADER.value, channel, payload);
};


AmqpBuffer.prototype.putBodyFrame = function(channel, payload) {
    return this.putFrame(_constants.FRAME_BODY.value, channel, payload);
};

AmqpBuffer.prototype.putHeartbeat = function() {
    throw new Error("Heartbeat not implemented");
};


/**
 * Encodes arguments given a method's parameter list and the provided arguments
 */
AmqpBuffer.prototype.putMethodArguments = function(args, formalParams) {
    for (var i=0; i<formalParams.length; i++) {
        var p = formalParams[i];
        // lookup type
        var dtype = p.type;
        // TODO check assertions on amqp types
        var domain = _domains[dtype];
        if (domain) {
            var type = domain.type;
        } else {
            throw new Error("Unknown AMQP domain " + dtype);
        }
        this["put"+_typeCodecMap[type]](args[i]);

        // support packing of consecutive bits into a single byte
        this.bitCount = (type === "bit") ? this.bitCount+1 : 0;
    }
    return this;
};

/**
 * Decodes arguments given a method's parameter list
 */
AmqpBuffer.prototype.getMethodArguments = function(params) {
    var values = [];
    for (var i=0; i<params.length; i++) {
        var p = params[i];
        // lookup type
        var dtype = p.type;
        // TODO check assertions on amqp types
        var type = _domains[dtype].type;
        
        var arg = {}
        arg.type = type;
        arg.name = p.name;
        try {
            var v = this["get"+_typeCodecMap[type]]();
        } catch (e) {
            throw new Error("type codec failed for type " + type + " for domain " + dtype);
        }

        // support unpacking of consecutive bits from a single byte
        this.bitCount = (type === "bit") ? this.bitCount+1 : 0;

        arg.value = v;
        values.push(arg);
    }
    return values;
};

/**
 * Writes typed arguments for AMQP methods and content properties
 */
AmqpBuffer.prototype.putArgument = function(domainName, arg) {
    var domain = _domains[domainName];
    if (domain) {
        var type = domain.type;
    } else {
        throw new Error("Unknown AMQP domain " + dtype);
    }
    this["put"+_typeCodecMap[type]](arg);
}

/**
 * Reads typed arguments for AMQP methods and content properties
 */
AmqpBuffer.prototype.getArgument = function(type) {
    try {
        return this["get"+_typeCodecMap[type]]();
    } catch (e) {
        throw new Error("type codec failed for type " + type + " for domain " + dtype);
    }
};

////////////////////////////////////////////////////////////////////////////////
// Content properties
//
// Content properties are optional, binary headers.
// The format for content properties is:
// 1) bit flags packed into 2 or more bytes
//      -the last bit (16th bit) signals whether or not there are more flags
// 2) values for the properties which had flags set to 1
//
// The types for these arguments are given in _basicProperties, which is
//   generated from the amqp spec xml.
//
////////////////////////////////////////////////////////////////////////////////

AmqpBuffer.prototype.getContentProperties = function() {
    var contentProperties = {};

    var propertyFlags = [];
    var packedPropertyFlags = this.getUnsignedShort();

    // 16 is the size of the unsigned short integer in which content properties
    // are packed
    for (var i=0; i<=16; i++) {
        var bit = (packedPropertyFlags >> (i)) & 0x01;
        if (bit) {
            // remember the index of any set flags
            propertyFlags.unshift(i+1);
        }
    }
    // After the content property flags are read, we know which properties
    // to read.
    for (var i=0; i<propertyFlags.length; i++) {
            var k = 16 - propertyFlags[i];
            var propertyName = _basicProperties[k].name;
            var propertyDomain = _basicProperties[k].domain;
            var propertyType = _domains[propertyDomain];
            contentProperties[propertyName] = this.getArgument(propertyType.type);
    }

    return contentProperties;
};

AmqpBuffer.prototype.putContentProperties = function(contentProperties) {
    // If no properties are specified, put an unsigned short and return
    if (!contentProperties) {
        return this.putUnsignedShort(0);
    }

    // create empty unsigned short to fill with property flags
    var packedPropertyFlags = 0x00;

    var properties = [];
    for (var i=0; i<_basicProperties.length; i++) {
        var propertyName = _basicProperties[i].name;
        var domain = _basicProperties[i].domain;
        var propertyValue = contentProperties[propertyName];

        if (typeof(propertyValue) !== "undefined") {
            properties.push({"propertyName" : propertyName, "propertyValue" : propertyValue, "domain" : domain});
            // shift and write property flag as bit
            packedPropertyFlags = packedPropertyFlags << 1 | 0x1;
        } else {
            // just shift
            packedPropertyFlags = packedPropertyFlags << 1;
        }


    }

    // There are 14 properties in AMQP 0-9-x
    //  and the continue bit will always be false
    //  always shift 2
    packedPropertyFlags = packedPropertyFlags << 2;


    // write out the property flags
    this.putUnsignedShort(packedPropertyFlags);
    
    // write each property
    for (var i=0; i<properties.length; i++) {
        var property = properties[i];
        var propertyDomain = property.domain;
        this.putArgument(propertyDomain, property.propertyValue);
    }
    return this;
};

/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */


/**
 * <b>Application developers should use AmqpClientFactory.createAmqpClient() 
 * function to create an instance of AmqpClient.</b>
 *
 * AmqpClient is used to connect to the end-point that handles AMQP 0-9-1
 * protocol over WebSocket.
 *
 * @constructor
 * @param factory {AmqpClientFactory} factory used to create AmqpClient instance
 *
 * @class  AmqpClient models the CONNECTION class defined in AMQP 0-9-1 protocol
 * by abstracting the methods defined in the protocol and exposing a far simpler 
 * API. <b>Application developers should use 
 * <code>AmqpClientFactory#createAmqpClient()</code> function to create an 
 * instance of AmqpClient.</b>
 *
 */


AmqpClient.prototype = new AsyncClient();
var _prototype = AmqpClient.prototype;

_prototype.CLOSED = 0;
_prototype.OPEN = 1;
_prototype.CONNECTING = 2;

_prototype.getReadyState = function() { return this._readyState; };

_prototype.setReadyState = function(state) {
    this._readyState = state;    
};

/**
 * The onopen handler is called when the connection opens.
 *
 * @param {AmqpEvent} e  the event
 *
 * @public
 * @field
 * @type Function
 * @name onopen
 * @memberOf AmqpClient#
 */
_prototype.onopen = function(e) {};

/**
 * The onclose handler is called when the connection closes.
 *
 * @param {AmqpEvent} e  the event
 *
 * @public
 * @field
 * @type Function
 * @name onclose
 * @memberOf AmqpClient#
 */
_prototype.onclose = function(e) {};

/**
 * The onerror handler is called when the ..
 *
 * @param {AmqpEvent} e  the event
 *
 * @public
 * @field
 * @type Function
 * @name onerror
 * @memberOf AmqpClient#
 */
_prototype.onerror = function(e) {};

var _assert = function(condition, message) {
    if (!condition) {
        throw(new Error(message));
    }
};


/**
 * _init sets up the client's state
 * @private
 */
_prototype._init = function() {
    this._initAsyncClient();
    this._buffer = new AmqpBuffer();
    this._channels = {};
    this._channelCount = 0;

    // Setup state machine
    this._stateMachine.addState("handshaking", 
        [
            {"inputs": ["startConnectionFrame"], "targetState": "starting"},
            {"inputs": ["closeConnectionFrame"], "targetState": "closing"}
        ], handshakeStartHandler);

    this._stateMachine.addState("starting",
        [
            {"inputs": ["startOkConnectionAction"], "targetState": "started"}
        ], startingHandler);

    this._stateMachine.addState("started",
        [
            {"inputs": ["tuneConnectionFrame"], "targetState": "tuning"}
        ]);

    this._stateMachine.addState("tuning",
        [
            {"inputs": ["tuneOkConnectionAction"], "targetState": "tuned"}
        ], tuneConnectionHandler, advanceActionsHandler);

    this._stateMachine.addState("tuned",
        [
            {"inputs": ["openConnectionAction"], "targetState": "opening"}
        ]);

    this._stateMachine.addState("opening",
        [
            {"inputs": ["openOkConnectionFrame"], "targetState": "ready"}
        ], registerSynchronousRequest, genericResponseHandler);

    this._stateMachine.addState("ready",
        [
            // inputs that renter the idling/ready state
            // these are (probably) all frames intended for channels
            {"inputs": [                        
                         // channel management
                         "openOkChannelFrame",
                         "closeChannelFrame",
                         "closeOkChannelFrame",

                         "flowOkChannelFrame",
                         "flowChannelFrame",

                         // queues and exchanges
                         "declareOkExchangeFrame",
                         "declareOkQueueFrame",
                         "bindOkQueueFrame",
                         "unbindOkQueueFrame",
                         "deleteOkQueueFrame",
                         "deleteOkExchangeFrame",

                         // transactions
                         "commitOkTxFrame",
                         "rollbackOkTxFrame",
                         "selectOkTxFrame",

                         // browsing
                         "purgeOkQueueFrame",
                         "cancelOkBasicFrame",
                         "getOkBasicFrame",
                         "getEmptyBasicFrame",
                         "consumeOkBasicFrame",
                         "recoverOkBasicFrame",
                         "rejectOkBasicFrame",


                        // async message delivery:
                        "deliverBasicFrame",
                        "bodyFrame",
                        "headerFrame"


                        ], "targetState": "ready"},
            {"inputs": ["closeConnectionFrame",
                        "closeConnectionAction"

                        ], "targetState": "closing"}
            

        ], idlingHandler);
    this._stateMachine.addState("closing", 
        [
            {"inputs": ["closeOkConnectionFrame", "closeOkConnectionAction"], "targetState": "closed"}
        ], genericResponseHandler, null);
    this._stateMachine.addState("closed", [], closedHandler, null);
};



// 'A', 'M', 'Q', "P', 0, 0, 9, 1
// But, to talk to rabbit, use this instead : 'A', 'M', 'Q', "P', 1, 1, 8, 0
// But, to talk to openamq, use this instead : 'A', 'M', 'Q', "P', 0, 0, 9, 1
// But, to talk to qpid, use this instead : 'A', 'M', 'Q', "P', 1, 1, 0, 9
// true for the latest releases as of may 20, 09
var _protocolHeaders = {"0-9-1" : [65, 77, 81, 80, 0, 0, 9, 1] };

/*
 * Connects to the AMQP broker at the given URL with given credentials
 *
 * @param {String}     url            Location of AMQP broker
 * @param {String}     virtualHost    Name of the virtual host
 * @param {Object|Key} credentials    Login credentials or Key
 * @param {Function}   callback       Function to be called on success
 * @return {void}
 *
 * @private
 * @function
 * @name connect
 * @memberOf AmqpClient#
 */
_prototype.connect = function connect(url, virtualHost, credentials, callback) {
    if (this._socket) {
        throw(new Error("AmqpClient already connected."));
    }

    // url might be a String or an Array of Strings
    var url0;
    if (typeof(url) === "string") {
        url0 = [url]
    } else {
        url0 = url;
    }

    //this._readyState = this.CONNECTING;
    this.setReadyState(this.CONNECTING);

    var args = {
        "url":url0[0],
        "virtualHost":virtualHost,
        "credentials":credentials
    };

    this._openContinuation = callback;
    // this._openErrorCb = error;
    this._hasNegotiated = false;

    _reconnect(this, url0[0], virtualHost, credentials);
};

/**
 * Connects to the AMQP broker at the given URL with given credentials using
 * Configuration style API with named parameters/properties.
 * 
 * <p> For example, the developers should use this function as shown below:
 * <pre>
 *   var client = new AmqpClient();
 *   var config = {url: 'ws://localhost:8001/amqp',
 *                 virtualHost: '/',
 *                 credentials: {username: 'guest', password: 'guest'}
 *                };
 *   client.connect(config, openHandler);
 * </pre>
 * 
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           url: 'url_str_value', 
 *                           virtualHost: 'vh_str_value', 
 *                           credentials: {username: 'uname_str_value', 
 *                                         password: 'passwd_str_value'}
 *                         }
 *                        </pre>
 *  
 *  Note that 'url', 'virtualHost' and 'credentials' are required properties
 *  and valid values must be passed in. A JavaScript error is thrown if the
 *  aforementioned arguments are undefined, null, or empty string.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * @return {void}
 * @public
 * @function
 * @name connect
 * @memberOf AmqpClient#
 */
var clientConnFunc = _prototype.connect;
_prototype.connect = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var url = myConfig.url;
       var virtualHost = myConfig.virtualHost;
       var credentials = myConfig.credentials;
       
       if (!url || typeof url != 'string') {
           throw new Error("AmqpClient.connect(): Parameter \'url\' is required");
       }
       
       if (!virtualHost || typeof url != 'string')
       {
           throw new Error("AmqpClient.connect(): Parameter \'virtualHost\' is required");
       }

       if (!credentials                            || 
           !credentials.username                   || 
           !credentials.password                   ||
           typeof credentials.username != 'string' ||
           typeof credentials.password != 'string')
       {
           throw new Error("AmqpClient.connect(): credentials are required");
       }

       clientConnFunc.call(this, url, virtualHost, credentials, callback);
   }
   else {
       clientConnFunc.apply(this, arguments);
   }
};

/**
 * Disconnect from the AMQP broker.
 * @return {void}
 *
 * @public
 * @function
 * @name disconnect 
 * @memberOf AmqpClient#
 */
_prototype.disconnect = function disconnect() {
    if (this.getReadyState() == this.OPEN) {
        closeConnection(this, 0, "", 0, 0)
    }

    if(this.getReadyState() == this.CONNECTING) {
        this.setReadyState(this.CLOSED);
        var frame = {};
        frame.methodName = "closeConnection";
        frame.type = "closeConnection";
        frame.args = "";
        var e = new AmqpEvent(this, frame);        
        this.dispatchEvent(e);
    }
};

/**
 * Opens an AMQP Channel
 *
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name openChannel
 * @memberOf AmqpClient#
 */
_prototype.openChannel = function openChannel(callback) {
    //log2("calling openChannel on ", this);  

    var id = ++this._channelCount;
    var channel = new $module.AmqpChannel();
    initChannel(channel, id, this, callback);
    this._channels[id] = channel;
    return channel;
};

/**
 * Returns the AmqpClientFactory that was used to create AmqpClient.
 * 
 * @return {AmqpClientFactory}
 *
 * @public
 * @function
 * @name getAmqpClientFactory
 * @memberOf AmqpClient#
 */
_prototype.getAmqpClientFactory = function getAmqpClientFactory(callback) {
    return (this._amqpClientFactory || null);
}


////////////////////////////////////////////////////////////////////////////////
// Socket IO
//
////////////////////////////////////////////////////////////////////////////////


var _socketOpenHandler = function (client) {
    var header = new $rootModule.ByteBuffer(_protocolHeaders["0-9-1"]);
    var buf = header;

    if ((typeof(ArrayBuffer) !== "undefined") && 
        (client._socket.binaryType == "arraybuffer")) {
        buf = header.getArrayBuffer(header.remaining());
    }
    client._socket.send(buf);
};

var _socketCloseHandler = function(client) {
    closedHandler(client);
};


var compareStringToBuffer = function (s, b) {
    if (b.remaining() < s.length) {
        return false;
    } else {
        var lim = b.limit;
        b.limit = s.length;
        var bufferString = b.getString($rootModule.Charset.UTF8);
        b.limit = lim;

        return s === bufferString;
    }
}

var _socketMessageHandler = function(client, e) {
    // question: why is skipping, flipping not working w/amqpbuffer?
    var bytebuf = e.data;

    if ((typeof(ArrayBuffer) !== "undefined") && 
        (client._socket.binaryType == "arraybuffer")) {
        bytebuf = decodeArrayBuffer2ByteBuffer(e.data);
    }

    var buf = client._buffer;
    buf.mark();
    buf.position = buf.limit;
    buf.putBuffer(bytebuf);
    buf.reset();

    if (!client._hasNegotiated && buf.remaining() > 7) {
        if (compareStringToBuffer("AMQP", buf)) {
            var serverVersion = [buf.get(), buf.get(), buf.get(), buf.get()];

            var protocolNegotiationFrame = {"args":[
                {
                    "name" : "replyText",
                    "value" : "Server does not support AMQP protocol versions after " + serverVersion[2] + "-" + serverVersion[3]
                }
            ], "methodName":"closeOkConnection"}

            var errFrame = {};
            errFrame.methodName = "error";
            errFrame.args = protocolNegotiationFrame.args;
            client.dispatchEvent(new AmqpEvent(client, errFrame));

            closedHandler(client, "", protocolNegotiationFrame);
            return;
        } else {
            buf.reset();
            client._hasNegotiated = true;
        }
    }

    var frame = null;
    while (frame = buf.getFrame()) {
        var f = frame;
        client._stateMachine.feedInput(f.methodName + "Frame", f);
    }

    buf.compact();
};

var _sendFrame = function (client, buffer) {
    var buf = buffer;

    if ((typeof(ArrayBuffer) !== "undefined") && 
        (client._socket.binaryType == "arraybuffer")) {
        buf = buffer.getArrayBuffer(buffer.remaining());
    }

    client._socket.send(buf);
};

var _write = function write(client, amqpMethod, channel, args) {
    var buf = new AmqpBuffer();
    //log2("_write", client, amqpMethod, channel, args);
    var classIndex = amqpMethod.classIndex;

    buf.putMethodFrame(amqpMethod, channel, args);

    buf.flip();
    //log2("sending with buffer", buf.getHexDump());
    _sendFrame(client, buf);
};


////////////////////////////////////////////////////////////////////////////////
// State Behavior
//
////////////////////////////////////////////////////////////////////////////////
var handshakeStartHandler = function handshakeStartHandler(connection, input, args, stateName) {
    // Setup IO handlers
    var socket = null;

    if (connection._amqpClientFactory) {
         var wsFactory = connection._amqpClientFactory.getWebSocketFactory();
         if (wsFactory) {
             // Use Kaazing's WebSocket implementation.
             socket = wsFactory.createWebSocket(args.url);
         }
    }

    if (socket == null) {
        // Use browser's WebSocket implementation.
    	if (typeof(WebSocket) !== "undefined") {
            socket = new WebSocket(args.url);
    	}
    	else {
    		throw new Error("Browser does not support WebSocket.");
    	}
    }

    if (typeof(ArrayBuffer) === "undefined") {
        // If an older browser is being used that does not support ArrayBuffer,
        // then set "bytebuffer" as the binaryType. This implies using Kaazing's
        // WebSocket implementation.
        socket.binaryType = "bytebuffer";
    }
    else {
        // If ArrayBuffer is available/supported, then set "bytebuffer" as the 
        // binaryType. This will optionally allow us to use browser's WebSocket 
        // implementation without relying on Kaazing's WebSocket implementation.
        socket.binaryType = "arraybuffer";
    }

    socket.onopen = function() { _socketOpenHandler(connection); };
    socket.onclose = function() { _socketCloseHandler(connection); };
    socket.onmessage = function(e) { _socketMessageHandler(connection, e); };
    connection._socket = socket;

    // other state
    connection._virtualHost = args.virtualHost;
    connection._credentialsOrKey = args.credentials;
};

// declare startOkConnection early so we can use it in startingHandler
var startOkConnection = null;

var startingHandler = function(client, input, frame) {
    _assert((frame.channel === 0), _constants.UNEXPECTED_FRAME.message);
    var buf = new AmqpBuffer();

    // Respond with startOk
    var clientProperties = new AmqpArguments();
    clientProperties.addLongString("library", "KaazingAmqpClient");
    clientProperties.addLongString("library_version", "5.0.0");
    clientProperties.addLongString("library_platform", "JavaScript");

    // TODO locale setting (probably system-wide, like Kaazing.locale)
    var locale = client._locale || "en_US";
    var mechanism = "AMQPLAIN";

    var credentialsOrKey = client._credentialsOrKey

    if (typeof(credentialsOrKey.resolve) != "function") {
        var response = _encodeAuthAmqPlain(credentialsOrKey.username, credentialsOrKey.password);
        startOkConnection(client, clientProperties, mechanism, response, locale);
    }
    else {
        credentialsOrKey.resolve(function(credentials) {
            var response = _encodeAuthAmqPlain(credentials.username, credentials.password);
            startOkConnection(client, clientProperties, mechanism, response, locale);
        });
    }
};


/**
 * tuneConnectionHandler responds to the server's tuneConnection frame and also
 *      sends the open frame.
 *
 *  At this stage it is legal to set lower values for any of the connection 
 *      options sent by the server.
 * @private
 */
var tuneConnectionHandler = function(client, input, frame) {
    _assert((frame.channel === 0), _constants.UNEXPECTED_FRAME.message);
    // TODO tune connection with platform appropriate limits
    // This is where we can prevent the server from sending 10gB frames to
    //      JavaScript clients.

    var channelMax = frame.args[0].value;
    var frameMax = frame.args[1].value;
    var heartbeat = 0;  // (server asks for heartbeat=frame.args[2].value)
                        // ...we respond by asking for no heartbeat

    tuneOkConnection(client, channelMax,frameMax,heartbeat);
    openConnection(client, client._virtualHost, client._openContinuation, client._openErrorCb);
}

var genericResponseHandler = function genericResponseHandler(clientOrChannel, input, frame) {
    if (frame) {
        if (frame.actionName && (frame.actionName == "closeConnection")) {
            return;
        }
    }

    if (input === "nowaitAction") {
        clientOrChannel._waitingAction = null;
        return;
    }
    
    var client = {};
    if (!client._connection) {
        client = clientOrChannel;
    }
    else {
        client = clientOrChannel._connection; 
    }

    var e = new AmqpEvent(clientOrChannel, frame);

    // Return result in two styles 1) continuation 2) event dispatch
    if (clientOrChannel._waitingAction) {
        if (input === "closeChannelFrame") {
            clientOrChannel._waitingAction.error(e);
        } 
        else if (frame.methodName == "closeConnection") {
            // The broker is closing the connection. This might be due to an
            // application error. So, we will fire the error event.
            var errFrame = {};
            errFrame.methodName = "error";
            errFrame.args = frame.args;
            client.dispatchEvent(new AmqpEvent(client, errFrame));

            // And, when we close the WebSocket, we will be notified
            // when the socket is really closed via socketClosedHandler()
            // in which we can fire the close event.
            closedHandler(client, "", frame);
            return;
        }
        else {            
            if (frame.methodName == "openOkConnection") {
                client.setReadyState(client.OPEN);
            }
            else {
                clientOrChannel._waitingAction.continuation(e);
            }
        }

        // clientOrChannel._waitingAction = null;
    }
    else {
        throw(new Error("AmqpClient not in waiting state: protocol violation")); 
    }

    clientOrChannel.dispatchEvent(e);
    if (frame.methodName == "openOkConnection") {
        client._openContinuation();
    }
}

/**
 * advanceActionsHandler is a behavior that causes the client's wait queue
 * to attempt to advance.
 *
 * @private
 */
var advanceActionsHandler = function advanceActionsHandler(client, input, frame) {
    var context = client;
    setTimeout(function(){
        context._processActions();
    },0);
}

/**
 * idlingHandler is called when the amqp client enters or reenters
 * the ready state.
 *
 * @private
 */
var idlingHandler = function openHandler (client, input, frame) {
    // rules
    if (frame.channel === 0) {

    } else if (client._channels[frame.channel]) {
        // dispatch frame to the channel's io layer
        var channel = client._channels[frame.channel];
        _channelReadHandler(channel, input, frame);
    } else {
        // error and close connection
    }
};

var closingHandler = function closingHandler (context, input, frame) {
};

var closedHandler = function closedHandler (context, input, frame) {
    if( !(context.getReadyState() == context.CLOSED) )
    {
        // dispatch close event
        var e;
        if (typeof(frame) === "undefined") {
            e = new AmqpEvent(context, {"args":[], "methodName":"closeOkConnection"});
        } else {
            frame.methodName = "closeOkConnection";
            e = new AmqpEvent(context, frame);
        }
        context.dispatchEvent(e);
        context.setReadyState(context.CLOSED);

        if (typeof(context._channels) !== "undefined") {
            // dispatch close event on each channel
            for (var i in context._channels) {
                var channel = context._channels[i];
                channel.dispatchEvent(e);
            }
        }
    }

    // close socket without the previously registered socket.onclose firing
    context._socket.onclose = function() {};
    if (context._socket.readyState == 0 || context._socket.readyState == 1) {
        //close the socket if is OPEN
        context._socket.close();
    }

    // call connection error cb
    if (typeof(context._openErrorCb) !== "undefined") {
        context._openErrorCb(e);
    }
};

function _reconnect(context, url, virtualHost, credentials) {
    var args = {"url":url,"virtualHost":virtualHost,"credentials":credentials};
    context._stateMachine.enterState("handshaking", "", args);
};


var initChannel = function initChannel(channel, id, connection, cb) {
    channel._id = id;
    // channel._callbacks = {};
    channel._callbacks = cb;
    channel._connection = connection;

    // transaction state
    channel._transacted = false;
    // action for which the client is waiting to get a response
    channel._waitingAction = null;

    channel._initAsyncClient();

    channel._stateMachine.addState("channelReady",
        [
            // transition to a waiting state (synchronous requests)
            {"inputs": [
                         "openChannelAction",
                         "closeChannelAction",

                         "consumeBasicAction",
                         "flowChannelAction",

                         "declareExchangeAction",
                         "declareQueueAction",
                         "bindQueueAction",
                         "unbindQueueAction",
                         "deleteQueueAction",
                         "deleteExchangeAction",
                         "purgeQueueAction",
                         "cancelBasicAction",

                         "recoverBasicAction",
                         "rejectBasicAction",


                         "selectTxAction",
                         "commitTxAction",
                         "rollbackTxAction",


                        ], "targetState": "waiting"},

            // perform asychronous action and stay in the ready state
            {"inputs": ["publishBasicAction",
                        "ackBasicAction"
                        ], "targetState" : "channelReady"},

            // start getting a single message
            {"inputs": ["getBasicAction"
                        ], "targetState" : "getting"},


            // start reading a delivered message
            {"inputs": ["deliverBasicFrame"
                        ], "targetState" : "readingContentHeader"}
  

        ], advanceActionsHandler);

    channel._stateMachine.addState("getting",
        [
            {"inputs": ["getOkBasicFrame"
                        ], "targetState": "readingContentHeader"},

            {"inputs": ["getEmptyBasicFrame"
                        ], "targetState": "channelReady"},

            {"inputs": ["closeChannelFrame"
                        ], "targetState": "closing"}

        ], registerSynchronousRequest, getEmptyResponseHandler);


    channel._stateMachine.addState("waiting",
        [
            // return from a waiting state (synchronous responses);
            {"inputs": [
                         // channel management
                         "openOkChannelFrame",
                         "closeOkChannelFrame",                         

                         "flowOkChannelFrame",

                         // queues and exchanges
                         "declareOkExchangeFrame",
                         "declareOkQueueFrame",
                         "bindOkQueueFrame",
                         "unbindOkQueueFrame",
                         "deleteOkQueueFrame",
                         "deleteOkExchangeFrame",
                         "purgeOkQueueFrame",
                         "cancelOkBasicFrame",
                         "recoverOkBasicFrame",
                         "rejectOkBasicFrame",


                         // transactions
                         "commitOkTxFrame",
                         "rollbackOkTxFrame",
                         "selectOkTxFrame",

                         // browsing
                         "getOkBasicFrame",
                         "getEmptyBasicFrame",
                         "consumeOkBasicFrame",

                         // sometimes (nowait) we don't want to return anything
                        "nowaitAction"
                         
                        ], "targetState": "channelReady"},

            {"inputs": ["closeChannelFrame"
                        ], "targetState" : "closing"}


        ], registerSynchronousRequest, genericResponseHandler);

    channel._stateMachine.addState("readingContentHeader",
        [
            {"inputs": ["headerFrame"], "targetState": "readingContentBody"}
        ], deliveryHandler, contentHeaderHandler);

    channel._stateMachine.addState("readingContentBody",
        [
            {"inputs": ["bodyFrame"
                        ], "targetState": "channelReady"}
        ], null, messageBodyHandler);

    channel._stateMachine.addState("closing",
        [
            {"inputs": ["closeOkChannelAction"
                        ], "targetState": "closed"}
        ], null);
    channel._stateMachine.addState("closed", null, null);


    //channel._stateMachine.enterState("channelReady", "", null);
    if (connection.getReadyState() == connection.OPEN) {
        openChannel(channel, [cb]);
    }

};

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * AmqpChannel
 *
 * @class  AmqpChannel is a channel opened with the AMQP broker. Use AmqpClient.openChannel() to create a new AmqpChannel.
 * @alias AmqpChannel
 * @constructor
 */
var AmqpChannel = function() {
}

AmqpChannel.prototype = new AsyncClient();
var _prototype = AmqpChannel.prototype;

_prototype._init = function(params) {
};

////////////////////////////////////////////////////////////////////////////////
// Channel IO
//
////////////////////////////////////////////////////////////////////////////////
var _channelWrite = function _channelWrite(channel, amqpMethod, channelId, args, body, headers) {
    var buf = new AmqpBuffer();
    var classIndex = amqpMethod.classIndex;

    buf.putMethodFrame(amqpMethod, channelId, args);

    if (amqpMethod.hasContent) {
        // weight is deprecated:
        // "The weight field is unused and must be zero"
        var weight = 0;

        buf.putHeaderFrame(channelId, classIndex, weight, body.remaining(), headers);

        // skip the body frame if there is a zero-length body
        if (body.remaining() > 0) {
            buf.putBodyFrame(channelId, body);
        }

    }

    buf.flip();
    //log2("sending with buffer", buf.getHexDump());
    _sendFrame(channel._connection, buf);

};

var _channelReadHandler = function _channelReadHandler(channel, input, frame) {
    if (frame) {
        var methodName = frame.methodName || "";
        if (methodName == "closeChannel") {
            var errFrame = {};
            errFrame.methodName = "error";
            errFrame.type = "error";
            errFrame.args = frame.args;
            
            channel.dispatchEvent(new AmqpEvent(channel, errFrame)); 
    
            channel.dispatchEvent(new AmqpEvent(channel, frame));
            return;
        }
    }  
    channel._stateMachine.feedInput(input, frame);
}

////////////////////////////////////////////////////////////////////////////////
// Channel state behaviors
//
////////////////////////////////////////////////////////////////////////////////

var messageBodyHandler = function messageBodyHandler(client, input, frame) {
    frame.args = client._headerFrame.args;
    frame.methodName = client._headerFrame.methodName;
    var e = new AmqpEvent(client, frame, client._headerFrame.contentProperties);

    if (frame.methodName === "getOkBasic") {
        client._waitingAction.continuation(e);
    }

    client.dispatchEvent(e);
}


var deliveryHandler = function deliveryHandler(client, input, frame) {
    client._headerFrame = frame;
}

var contentHeaderHandler = function contentHeaderHandler(client, input, frame) {
    client._headerFrame.contentProperties = frame.contentProperties;
}

var getEmptyResponseHandler = function (channel, input, frame) {
    var e = new AmqpEvent(channel, frame);

    // Return result in two styles 1) continuation 2) event dispatch
    if (channel._waitingAction) {

        // don't dispatch an event for successful get requests yet
        // the body needs to be read in in the next two states

        if (input === "closeChannelFrame") {
            channel._waitingAction.error(e);
            channel.dispatchEvent(e);
            channel._waitingAction = null;
        }
        else if (input === "getEmptyBasicFrame") {
            channel._waitingAction.continuation(e);
            channel.dispatchEvent(e);
            channel._waitingAction = null;
        }
    }
    else {
        throw new Error("AmqpClient not in waiting state: protocol violation");
    }
}


/**
 * registerSynchronousRequest puts the client into a waiting state that will
 * be able to call the continuation for a method that expects a particular
 * synchronous response
 *
 * This also lets us call the error cb when there is a close frame (which
 * AMQP uses to raise exceptions) with a reason why the last command failed.
 *
 * @private
 */
var registerSynchronousRequest = function registerSynchronousRequest(context, input, action) {

    // extract method from positional args (regrettable, but expedient)
    var method = action.args[1];
    if (method.synchronous) {

        context._waitingAction = action;
    } else {
        throw(new Error("AMQP: trying to enter wait state for method that is not sychronous"));
    }  

}

/**
 * property used to indicate current flow 
 * @private
 */
AmqpChannel.prototype.flowFlag = true;


/**
 * The message handler is called when a message is received.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onmessage
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onmessage = function(e) {};


/**
 * The close handler is called when the channel closes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onclose
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onclose = function(e) {};


/**
 * The error handler is called when the channel ...
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onerror
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onerror = function(e) {};


/**
 * The open handler is called when the channel opens.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onopen
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onopen = function(e) {};


/**
 * The declarequeue handler is called when a queue declaration completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeclarequeue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeclarequeue = function(e) {};


/**
 * The declareexchange handler is called when an exchange declaration completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeclareexchange
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeclareexchange = function(e) {};


/**
 * The flow handler is called when a flow request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onflow
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onflow = function(e) {};


/**
 * The bindqueue handler is called when a bind request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onbindqueue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onbindqueue = function(e) {};


/**
 * The unbindqueue handler is called when a request to unbind a queue from and exchange completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onunbindqueue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onunbindqueue = function(e) {};


/**
 * The deletequeue handler is called when a request to delete a queue completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeletequeue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeletequeue = function(e) {};


/**
 * The deleteexchange handler is called when a request to delete an exchange completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeleteexchange
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeleteexchange = function(e) {};


/**
 * The consume handler is called when a consume request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onconsume
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onconsume = function(e) {};


/**
 * The cancel handler is called when a cancel request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name oncancel
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.oncancel = function(e) {};


/**
 * The committransaction handler is called when a transaction commit completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name oncommittransaction
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.oncommittransaction = function(e) {};


/**
 * The rollbacktransaction handler is called when a transaction rollback completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onrollbacktransaction
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onrollbacktransaction = function(e) {};


/**
 * The selecttransaction handler is called when a select request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onselecttransaction
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onselecttransaction = function(e) {};


/**
 * The get handler is called when a get request returns.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onget
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onget = function(e) {};


/**
 * The purgequeue handler is called when a purge request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onpurgequeue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onpurgequeue = function(e) {};


/**
 * The recover handler is called when a recover request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onrecover
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onrecover = function(e) {};


/**
 * The reject handler is called when a reject request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onreject
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onreject = function(e) {};





////////////////////////////////////////////////////////////////////////////////
// generate public methods and jsdoc
//
////////////////////////////////////////////////////////////////////////////////



 


   

  var startOkConnection = function(_this,  clientProperties, mechanism, response, locale, callback) {
      var args = [ clientProperties  , mechanism  , response  , locale   ];

      var methodName = 'startOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   

  var secureOkConnection = function(_this, response, callback) {
      var args = [ response   ];

      var methodName = 'secureOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   

  var tuneOkConnection = function(_this,  channelMax,frameMax,heartbeat, callback) {
      var args = [ channelMax  , frameMax  , heartbeat   ];

      var methodName = 'tuneOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };

   

  var openConnection = function(_this,  virtualHost, callback) {
      var args = [ virtualHost  , 0  , 0   ];

      var methodName = 'openConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   

  var closeConnection = function(_this,  replyCode,replyText,classId,methodId, callback) {
      var args = [ replyCode  , replyText  , classId  , methodId   ];

      var methodName = 'closeConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };

   

  var closeOkConnection = function(_this,   callback) {
      var args = [ ];

      var methodName = 'closeOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   


  AmqpChannel.prototype.openChannel = function(callback) {
      var args = [ 0   ];
      var methodName = 'openChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /**
  *
  * This method asks the peer to pause or restart the flow of content data sent by
  * a consumer. This is a simple flow-control mechanism that a peer can use to avoid
  * overflowing its queues or otherwise finding itself receiving more messages than
  * it can process. Note that this method is not intended for window control. It does
  * not affect contents returned by Basic.Get-Ok methods.
  *
  * @param {Bit} active  start/stop content frames
  * <p>
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name flowChannel
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.flowChannel = function(
   active, callback) {
      var args = [ active   ];
      var methodName = 'flowChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   
   
  /**
  *
  * Confirms to the peer that a flow command was received and processed.
  *
  * @param {Bit} active  current flow setting
  * <p>
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name flowOkChannel
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.flowOkChannel = function(
   active, callback) {
      var args = [ active   ];
      var methodName = 'flowOkChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   
   
  /*
  *
          This method indicates that the sender wants to close the channel. This may be due to
          internal conditions (e.g. a forced shut-down) or due to an error handling a specific
          method, i.e. an exception. When a close is due to an exception, the sender provides
          the class and method id of the method which caused the exception.
        
  *
  *
  * @param {ReplyCode} replyCode  reply-code
  * @param {ReplyText} replyText  reply-text
  * @param {ClassId} classId  failing method class
  * @param {MethodId} methodId  failing method ID
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name closeChannel
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.closeChannel = function(replyCode,replyText,classId,methodId, callback) {
      var args = [ replyCode  , replyText  , classId  , methodId   ];
      var methodName = 'closeChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   


  AmqpChannel.prototype.closeOkChannel = function(
    callback) {
      var args = [ ];
      var methodName = 'closeOkChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method creates an exchange if it does not already exist, and if the exchange
          exists, verifies that it is of the correct and expected class.
        
  *
  *
  * @param {ExchangeName} exchange  exchange
  * @param {Shortstr} type  exchange type
  * @param {Bit} passive  do not create exchange
  * @param {Bit} durable  request a durable exchange
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for declaration
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name declareExchange
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.declareExchange = function(
   exchange,type,passive,durable,noWait,arguments, callback) {
      var args = [ 0  , exchange  , type  , passive  , durable  , 0  , 0  , noWait  , arguments   ];
      var methodName = 'declareExchange';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method deletes an exchange. When an exchange is deleted all queue bindings on
          the exchange are cancelled.
        
  *
  *
  * @param {ExchangeName} exchange  exchange
  * @param {Bit} ifUnused  delete only if unused
  * @param {NoWait} noWait  no-wait
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name deleteExchange
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.deleteExchange = function(
   exchange,ifUnused,noWait, callback) {
      var args = [ 0  , exchange  , ifUnused  , noWait   ];
      var methodName = 'deleteExchange';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method creates or checks a queue. When creating a new queue the client can
          specify various properties that control the durability of the queue and its
          contents, and the level of sharing for the queue.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {Bit} passive  do not create queue
  * @param {Bit} durable  request a durable queue
  * @param {Bit} exclusive  request an exclusive queue
  * @param {Bit} autoDelete  auto-delete queue when unused
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for declaration
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name declareQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.declareQueue = function(
   queue,passive,durable,exclusive,autoDelete,noWait,arguments, callback) {
      var args = [ 0  , queue  , passive  , durable  , exclusive  , autoDelete  , noWait  , arguments   ];
      var methodName = 'declareQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method binds a queue to an exchange. Until a queue is bound it will not
          receive any messages. In a classic messaging model, store-and-forward queues
          are bound to a direct exchange and subscription queues are bound to a topic
          exchange.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {ExchangeName} exchange  name of the exchange to bind to
  * @param {Shortstr} routingKey  message routing key
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for binding
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name bindQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.bindQueue = function(
   queue,exchange,routingKey,noWait,arguments, callback) {
      var args = [ 0  , queue  , exchange  , routingKey  , noWait  , arguments   ];
      var methodName = 'bindQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *This method unbinds a queue from an exchange.
  *
  *
  * @param {QueueName} queue  queue
  * @param {ExchangeName} exchange  exchange
  * @param {Shortstr} routingKey  routing key of binding
  * @param {Table} arguments  arguments of binding
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name unbindQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.unbindQueue = function(
   queue,exchange,routingKey,arguments, callback) {
      var args = [ 0  , queue  , exchange  , routingKey  , arguments   ];
      var methodName = 'unbindQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method removes all messages from a queue which are not awaiting
          acknowledgment.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {NoWait} noWait  no-wait
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name purgeQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.purgeQueue = function(
   queue,noWait, callback) {
      var args = [ 0  , queue  , noWait   ];
      var methodName = 'purgeQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method deletes a queue. When a queue is deleted any pending messages are sent
          to a dead-letter queue if this is defined in the server configuration, and all
          consumers on the queue are cancelled.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {Bit} ifUnused  delete only if unused
  * @param {Bit} ifEmpty  delete only if empty
  * @param {NoWait} noWait  no-wait
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name deleteQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.deleteQueue = function(
   queue,ifUnused,ifEmpty,noWait, callback) {
      var args = [ 0  , queue  , ifUnused  , ifEmpty  , noWait   ];
      var methodName = 'deleteQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method requests a specific quality of service. The QoS can be specified for the
          current channel or for all channels on the connection. The particular properties and
          semantics of a qos method always depend on the content class semantics. Though the
          qos method could in principle apply to both peers, it is currently meaningful only
          for the server.
        
  *
  *
  * @param {Long} prefetchSize  prefetch window in octets
  * @param {Short} prefetchCount  prefetch window in messages
  * @param {Bit} global  apply to entire connection
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name qosBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.qosBasic = function(
   prefetchSize,prefetchCount,global, callback) {
      var args = [ prefetchSize  , prefetchCount  , global   ];
      var methodName = 'qosBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method asks the server to start a "consumer", which is a transient request for
          messages from a specific queue. Consumers last as long as the channel they were
          declared on, or until the client cancels them.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {ConsumerTag} consumerTag  consumer-tag
  * @param {NoLocal} noLocal  no-local
  * @param {NoAck} noAck  no-ack
  * @param {Bit} exclusive  request exclusive access
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for declaration
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name consumeBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.consumeBasic = function(
   queue,consumerTag,noLocal,noAck,exclusive,noWait,arguments, callback) {
      var args = [ 0  , queue  , consumerTag  , noLocal  , noAck  , exclusive  , noWait  , arguments   ];
      var methodName = 'consumeBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method cancels a consumer. This does not affect already delivered
          messages, but it does mean the server will not send any more messages for
          that consumer. The client may receive an arbitrary number of messages in
          between sending the cancel method and receiving the cancel-ok reply.
        
  *
  *
  * @param {ConsumerTag} consumerTag  consumer-tag
  * @param {NoWait} noWait  no-wait
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name cancelBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.cancelBasic = function(
   consumerTag,noWait, callback) {
      var args = [ consumerTag  , noWait   ];
      var methodName = 'cancelBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method publishes a message to a specific exchange. The message will be routed
          to queues as defined by the exchange configuration and distributed to any active
          consumers when the transaction, if any, is committed.
        
  *
  *
  * @param {ByteBuffer} body AMQP message payload 
  * @param {Object} headers AMQP content properties 
  * @param {ExchangeName} exchange  exchange
  * @param {Shortstr} routingKey  Message routing key
  * @param {Bit} mandatory  indicate mandatory routing
  * @param {Bit} immediate  request immediate delivery
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name publishBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.publishBasic = function(
  body, headers, 
   exchange,routingKey,mandatory,immediate, callback) {
      var args = [ 0  , exchange  , routingKey  , mandatory  , immediate   ];
      var methodName = 'publishBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args, body, headers], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method provides a direct access to the messages in a queue using a synchronous
          dialogue that is designed for specific types of application where synchronous
          functionality is more important than performance.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {NoAck} noAck  no-ack
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name getBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.getBasic = function(
   queue,noAck, callback) {
      var args = [ 0  , queue  , noAck   ];
      var methodName = 'getBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method acknowledges one or more messages delivered via the Deliver or Get-Ok
          methods. The client can ask to confirm a single message or a set of messages up to
          and including a specific message.
        
  *
  *
  * @param {DeliveryTag} deliveryTag  delivery-tag
  * @param {Bit} multiple  acknowledge multiple messages
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name ackBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.ackBasic = function(
   deliveryTag,multiple, callback) {
      var args = [ deliveryTag  , multiple   ];
      var methodName = 'ackBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   
   
  /*
  *
          This method allows a client to reject a message. It can be used to interrupt and
          cancel large incoming messages, or return untreatable messages to their original
          queue.
        
  *
  *
  * @param {DeliveryTag} deliveryTag  delivery-tag
  * @param {Bit} requeue  requeue the message
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name rejectBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.rejectBasic = function(
   deliveryTag,requeue, callback) {
      var args = [ deliveryTag  , requeue   ];
      var methodName = 'rejectBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   

  /**
   *
   * This method asks the server to redeliver all unacknowledged messages on a
   * specified channel. Zero or more messages may be redelivered.  This method
   * replaces the asynchronous Recover.
   *
   * @param {Bit} requeue  requeue the message
   * <p>
   * @param {Function} callback Function to be called on success
   * <p>
   * @return {AmqpChannel}
   *
   * @public
   * @function
   * @name recoverBasic
   * @memberOf AmqpChannel#
   */
  AmqpChannel.prototype.recoverBasic = function(
   requeue, callback) {
      var args = [ requeue   ];
      var methodName = 'recoverBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


_basicProperties = [
 {"name":"contentType", "domain":"Shortstr", "label":"MIME content type"}, {"name":"contentEncoding", "domain":"Shortstr", "label":"MIME content encoding"}, {"name":"headers", "domain":"Table", "label":"message header field table"}, {"name":"deliveryMode", "domain":"Octet", "label":"non-persistent (1) or persistent (2)"}, {"name":"priority", "domain":"Octet", "label":"message priority, 0 to 9"}, {"name":"correlationId", "domain":"Shortstr", "label":"application correlation identifier"}, {"name":"replyTo", "domain":"Shortstr", "label":"address to reply to"}, {"name":"expiration", "domain":"Shortstr", "label":"message expiration specification"}, {"name":"messageId", "domain":"Shortstr", "label":"application message identifier"}, {"name":"timestamp", "domain":"Timestamp", "label":"message timestamp"}, {"name":"type", "domain":"Shortstr", "label":"message type name"}, {"name":"userId", "domain":"Shortstr", "label":"creating user id"}, {"name":"appId", "domain":"Shortstr", "label":"creating application id"}, {"name":"reserved", "domain":"Shortstr", "label":"reserved, must be empty"}
];
   
   
/**
*
* This method sets the channel to use standard transactions. The client must use this
* method at least once on a channel before using the Commit or Rollback methods.
*
* @param {Function} callback Function to be called on success
* <p>
* @return {AmqpChannel}
*
* @public
* @function
* @name selectTx
* @memberOf AmqpChannel#
*/
  AmqpChannel.prototype.selectTx = function(
    callback) {
      var args = [ ];
      var methodName = 'selectTx';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /**
  *
  * This method commits all message publications and acknowledgments performed in
  * the current transaction.  A new transaction starts immediately after a commit.
  *
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name commitTx
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.commitTx = function(
    callback) {
      var args = [ ];
      var methodName = 'commitTx';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /**
  *
  * This method abandons all message publications and acknowledgments performed in
  * the current transaction. A new transaction starts immediately after a rollback.
  * Note that unacked messages will not be automatically redelivered by rollback;
  * if that is required an explicit recover call should be issued.
  *
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name rollbackTx
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.rollbackTx = function(
    callback) {
      var args = [ ];
      var methodName = 'rollbackTx';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };




// AmqpChannel.openChannel is public but should be private
// wrap it, store it locally, and remove it
var func = AmqpChannel.prototype.openChannel;
var openChannel = function(channel, args) {
    channel._stateMachine.enterState("channelReady", "", null);
    func.apply(channel, args);
}
delete AmqpChannel.prototype.openChannel;

// make closeOkChannel private

var func2 = AmqpChannel.prototype.closeOkChannel;
var closeOkChannel = function(channel, args) {
    func2.apply(channel, args);
}
delete AmqpChannel.prototype.closeOkChannel;


/**
 * This method indicates that the sender wants to close the channel. This 
 * may be due to internal conditions (e.g. a forced shut-down) or due to an error 
 * handling a specific method, i.e. an exception. When a close is due to an
 * exception, the sender provides the class and method id of the method which
 * caused the exception.
 * 
 * <p> AmqpChannel.closeChannel() function that supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *     var channel = ...;
 *     var config = {replyCode: int1, 
 *                   replyText, 'foo', 
 *                   classId: int2,
 *                   methodId: int3};
 *     channel.closeChannel(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                        {
 *                          replyCode: int_value,
 *                          replyText: 'str_value',
 *                          classId: int_value,
 *                          methodId: int_value
 *                        }
 *                        </pre>
 * Default values are as follows: 
 *                        <pre>
 *                          replyCode  --  0
 *                          replyText  --  "" 
 *                          classId    --  0
 *                          methodId   --  0
 *                          callback   -- undefined
 *                        </pre>
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name closeChannel
 * @memberOf AmqpChannel#
 */
var closeChannelFunc = AmqpChannel.prototype.closeChannel;
AmqpChannel.prototype.closeChannel = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var replyCode = myConfig.replyCode || 0;
       var replyText = myConfig.replyText || '';
       var classId = myConfig.classId || 0;
       var methodId = myConfig.methodId || 0;
       
       if (typeof replyCode != 'number') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'replyCode\' is expected to be of numeric type");
       }

       if (typeof replyText != 'string') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'replyText\' is expected to be a string");
       }

       if (typeof classId != 'number') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'classId\' is expected to be of numeric type");
       }
       
       if (typeof methodId != 'number') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'methodId\' is expected to be of numeric type");
       }
       
       return closeChannelFunc.call(this, replyCode, replyText, classId, methodId, callback);
   }
   else {
       return closeChannelFunc.apply(this, arguments);
   }
};


/**
 * This method creates an exchange if it does not already exist, and if the 
 * exchange exists, verifies that it is of the correct and expected class.
 * 
 * <p> AmqpChannel.declareExchange() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *    var channel = ...;
 *    var config = {exchange: myExchangeName, type: 'direct'};
 *    channel.declareExchange(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           exchange: 'str_value',
 *                           type: 'direct'|'fanout'|'headers'|'topic',
 *                           passive: true|false,
 *                           durable: true|false,
 *                           noWait: true|false,
 *                           args: {  }
 *                         }
 *                        </pre>
 * 'exchange' specifies the name of the exchange and is a required param. The
 * legal values of the required 'type' param are 'direct', 'fanout', 'headers', 
 * and 'topic' Boolean params 'passive', 'durable', and 'noWait' have a default
 * value of false. Param 'args' is an optional param that can be used to pass 
 * in additional properties. 
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name declareExchange
 * @memberOf AmqpChannel#
 */
var declareExchangeFunc = AmqpChannel.prototype.declareExchange;
AmqpChannel.prototype.declareExchange = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var exchange = myConfig.exchange;
       var type = myConfig.type;
       var passive = myConfig.passive || false;
       var durable = myConfig.durable || false;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.declareExchange(): String parameter \'exchange\' is required");
       }

       if (!type                   || 
           typeof type != 'string' ||
           ((type != 'fanout') && (type != 'direct') && (type != 'topic') && (type != 'headers'))) {
           throw new Error("AmqpChannel.declareExchange(): Legal values of parameter \'type\' are direct | fanout | headers | topic");
       }
       
       if (typeof passive != 'boolean') {
           throw new Error("AmqpChannel.declareExchange(): Parameter \'passive\' only accepts boolean values");
       }

       if (typeof durable != 'boolean') {
           throw new Error("AmqpChannel.declareExchange(): Parameter \'durable\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.declareExchange(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return declareExchangeFunc.call(this, exchange, type, passive, durable, noWait, args, callback);
   }
   else {
       return declareExchangeFunc.apply(this, arguments);
   }
};

/**
 * This method deletes an exchange. When an exchange is deleted all queue 
 * bindings on the exchange are cancelled.
 * 
 * <p> AmqpChannel.deleteExchange() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {exchange: myExchangeName, noWait: false};
 *    channel.deleteExchange(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           exchange: 'exchange_name_str_value',
 *                           ifUnused: true|false,
 *                           noWait: true|false
 *                         }
 *                        </pre>
 * Required parameter 'exchange' specifies the name of the exchange. Default 
 * values of the optional boolean parameters 'ifUnused' and 'noWait' is false.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name deleteExchange
 * @memberOf AmqpChannel#
 */
var deleteExchangeFunc = AmqpChannel.prototype.deleteExchange;
AmqpChannel.prototype.deleteExchange = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var exchange = myConfig.exchange;
       var ifUnused = myConfig.ifUnused || false;
       var noWait = myConfig.noWait || false;
       
       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.deleteExchange(): String parameter \'exchange\' is required");
       }

       if (typeof ifUnused != 'boolean') {
           throw new Error("AmqpChannel.deleteExchange(): Parameter \'ifUnused\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.deleteExchange(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return deleteExchangeFunc.call(this, exchange, ifUnused, noWait, callback);
   }
   else {
       return deleteExchangeFunc.apply(this, arguments);
   }
};

/**
 * This method creates or checks a queue. When creating a new queue the client 
 * can specify various properties that control the durability of the queue and 
 * its contents, and the level of sharing for the queue.
 *
 * <p> AmqpChannel.declareQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, exclusive: false};
 *    channel.declareQueue(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           passive: true|false,
 *                           durable: true|false,
 *                           exclusive: true|false,
 *                           autoDelete: true|false,
 *                           noWait: true|false,
 *                           args: { }
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Boolean parameters
 * 'passive', 'durable', 'noWait', 'exclusive' and 'autoDelete' are optional 
 * with false as the default value. Param 'args' is an optional param that 
 * can be used to pass in additional properties for declaration.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name declareQueue
 * @memberOf AmqpChannel#
 */
var declareQueueFunc = AmqpChannel.prototype.declareQueue;
AmqpChannel.prototype.declareQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var passive = myConfig.passive || false;
       var durable = myConfig.durable || false;
       var exclusive = myConfig.exclusive || false;
       var autoDelete = myConfig.autoDelete || false;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.declareQueue(): String parameter \'queue\' is required");
       }

       if (typeof passive != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'passive\' only accepts boolean values");
       }

       if (typeof durable != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'durable\' only accepts boolean values");
       }

       if (typeof exclusive != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'exclusive\' only accepts boolean values");
       }

       if (typeof autoDelete != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'autoDelete\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return declareQueueFunc.call(this, queue, passive, durable, exclusive, autoDelete, noWait, args, callback);
   }
   else {
       return declareQueueFunc.apply(this, arguments);
   }
};

/**
 * This method binds a queue to an exchange. Until a queue is bound it will not
 * receive any messages. In a classic messaging model, store-and-forward queues
 * are bound to a direct exchange and subscription queues are bound to a topic
 * exchange. Developers should invoke this function as shown below:
 * 
 * <p> AmqpChannel.bindQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, 
 *                  exchange: myExchangeName,
 *                  routingKey: key};
 *    channel.bindQueue(config, callback);
 * </pre>
 *
 * <p> 
 * 
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           exchange: 'exchange_name_str_value',
 *                           routingKey: 'key_str_value'
 *                           noWait: true|false,
 *                           args: { }
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Required parameter
 * 'exchange' specifies the exchange name. Required parameter 'routingKey'
 * specifies the key to be used to bind the queue to the exchange. Boolean
 * parameter 'noWait' is optional with false as the default value. Param 'args'
 * is an optional amd can be used to pass in additional properties for 
 * declaration.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name bindQueue
 * @memberOf AmqpChannel#
 */
var bindQueueFunc = AmqpChannel.prototype.bindQueue;
AmqpChannel.prototype.bindQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var exchange = myConfig.exchange;
       var routingKey = myConfig.routingKey;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.bindQueue(): String parameter \'queue\' is required");
       }

       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.bindQueue(): String parameter \'exchange\' is required");
       }

       if (!routingKey || typeof routingKey != 'string') {
           throw new Error("AmqpChannel.bindQueue(): String parameter \'routingKey\' is required");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.bindQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return bindQueueFunc.call(this, queue, exchange, routingKey, noWait, args, callback);
   }
   else {
       return bindQueueFunc.apply(this, arguments);
   }
};

/**
 * This method unbinds a queue from an exchange.
 * 
 * <p> AmqpChannel.unbindQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, exchange: exchangeName, routingKey: key};
 *    channel.unbindQueue(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           exchange: 'exchange_name_str_value',
 *                           routingKey: 'routingKey_str_value',
 *                           args: { }
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Required parameter
 * 'exchange' specifies the exchange name. Required parameter 'routingKey'
 * specifies the key that was used to bind the queue to the exchange. Parameter 
 * 'args' is optional and can be used to pass in additional properties for 
 * declaration.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name unbindQueue
 * @memberOf AmqpChannel#
 */
var unbindQueueFunc = AmqpChannel.prototype.unbindQueue;
AmqpChannel.prototype.unbindQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var exchange = myConfig.exchange;
       var routingKey = myConfig.routingKey;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.unbindQueue(): String parameter \'queue\' is required");
       }

       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.unbindQueue(): String parameter \'exchange\' is required");
       }

       if (!routingKey || typeof routingKey != 'string') {
           throw new Error("AmqpChannel.unbindQueue(): String parameter \'routingKey\' is required");
       }
       
       return unbindQueueFunc.call(this, queue, exchange, routingKey, args, callback);
   }
   else {
       return unbindQueueFunc.apply(this, arguments);
   }
};

/**
 * This method removes all messages from a queue which are not awaiting
 * acknowledgment.
 * 
 * <p> AmqpChannel.purgeQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName};
 *    channel.purgeQueue(config, callback);
 * </pre>
 * 
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           noWait: true|false
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Boolean parameter 
 * 'noWait' is optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name purgeQueue
 * @memberOf AmqpChannel#
 */
var purgeQueueFunc = AmqpChannel.prototype.purgeQueue;
AmqpChannel.prototype.purgeQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var noWait = myConfig.noWait || false;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.purgeQueue(): String parameter \'queue\' is required");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.purgeQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return purgeQueueFunc.call(this, queue, noWait, callback);
   }
   else {
       return purgeQueueFunc.apply(this, arguments);
   }
};


/**
 * This method deletes a queue. When a queue is deleted any pending messages 
 * are sent to a dead-letter queue if this is defined in the server configuration, 
 * and all consumers on the queue are cancelled.
 *
 * <p> AmqpChannel.deleteQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, ifEmpty: true};
 *    channel.deleteQueue(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        {
 *                          queue: 'queue_name_str_value',
 *                          ifUnused: true|false,
 *                          ifEmpty: true|false,
 *                          noWait: true|false
 *                        }
 * Required parameter 'queue' specifies the queue name. Boolean parameters 
 * 'ifUnused', 'ifEmpty', and 'noWait' are optional with false as the default 
 * value. 
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name deleteQueue
 * @memberOf AmqpChannel#
 */
var deleteQueueFunc = AmqpChannel.prototype.deleteQueue;
AmqpChannel.prototype.deleteQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var ifUnused = myConfig.ifUnused || false;
       var ifEmpty = myConfig.ifEmpty || false;
       var noWait = myConfig.noWait || false;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.deleteQueue(): String parameter \'queue\' is required");
       }

       if (typeof ifUnused != 'boolean') {
           throw new Error("AmqpChannel.deleteQueue(): Parameter \'ifUnused\' only accepts boolean values");
       }
       
       if (typeof ifEmpty != 'boolean') {
           throw new Error("AmqpChannel.deleteQueue(): Parameter \'ifEmpty\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.deleteQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return deleteQueueFunc.call(this, queue, ifUnused, ifEmpty, noWait, callback);
   }
   else {
       return deleteQueueFunc.apply(this, arguments);
   }
};

/**
 * This method requests a specific quality of service. The QoS can be specified
 * for the current channel or for all channels on the connection. The particular
 * properties and semantics of a qos method always depend on the content class 
 * semantics. Though the qos method could in principle apply to both peers, it 
 * is currently meaningful only for the server.
 * 
 * <p> AmqpChannel.qosBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {prefetchSize: size, prefetchCount: count, global: true};
 *    channel.qosBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           prefetchSize: size_long_value_in_octets,
 *                           prefetchCount: count_short_value_in_octets,
 *                           global: true|false
 *                         }
 *                        </pre>
 * Parameter 'prefetchSize' and 'prefetchCount' are required. Boolean parameter
 * 'global' is optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name qosBasic
 * @memberOf AmqpChannel#
 */
var qosBasicFunc = AmqpChannel.prototype.qosBasic;
AmqpChannel.prototype.qosBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var prefetchSize = myConfig.prefetchSize || 0;
       var prefetchCount = myConfig.prefetchCount || 0;
       var global = myConfig.global || false;
       
       if (typeof prefetchSize != 'number') {
           throw new Error("AmqpChannel.qosBasic(): Parameter \'prefetchSize\' is expected to be of numeric type");
       }

       if (typeof prefetchCount != 'number') {
           throw new Error("AmqpChannel.qosBasic(): Parameter \'prefetchCount\' is expected to be of numeric type");
       }

       if (typeof global != 'boolean') {
           throw new Error("AmqpChannel.qosBasic(): Parameter \'global\' only accepts boolean values");
       }
       
       return qosBasicFunc.call(this, prefetchSize, prefetchCount, global, callback);
   }
   else {
       return qosBasicFunc.apply(this, arguments);
   }
};


/**
 * This method asks the server to start a "consumer", which is a transient 
 * request for messages from a specific queue. Consumers last as long as the 
 * channel they were declared on, or until the client cancels them.
 * 
 * <p> AmqpChannel.consumeBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, 
 *                  consumerTag: clientTag, 
 *                  exclusive: false,
 *                  noLocal: true};
 *    channel.consumeBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           consumerTag: 'consumer_tag_str_value',
 *                           noLocal: true|false,
 *                           noAck: true|false,
 *                           exclusive: true|false,
 *                           noWait: true|false,
 *                           args: { }
 *                         }
 *                        </pre>
 *
 * Required parameter 'queue' specifies the queue name. Parameter
 * 'consumerTag' is required. Boolean parameters 'noLocal', 'noWait', and
 * 'exclusive' are optional with false as the default value. 
 *<p>
 * Boolean parameter 'noAck' is optional with default value of true. If noAck is 
 * true, the broker will not expect any acknowledgement from the client before
 * discarding the message. If noAck is false, then the broker will expect an
 * acknowledgement before discarding the message.  If noAck is specified to be
 * false, then it's developers responsibility to explicitly acknowledge the
 * received message using AmqpChannel.ackBasic() as shown below: 
 * 
 * <pre>
 * var handleMessageReceived = function(event) {
 *    ....
 *    var props = event.properties;
 *    var exchange = event.args.exchange;
 *    var routingKey = event.args.routingKey;
 *    var dt = event.args.deliveryTag;
 *    var channel = event.target;
 *   
 *    // Acknowledge the received message. Otherwise, the broker will eventually
 *    // run out of memory.
 *    var config = {deliveryTag: dt, multiple: true};
 *    setTimeout(function() {
 *                channel.ackBasic(config);
 *              }, 0);
 * }
 * </pre>
 *
 * Parameter 'args' is optional and can be used to pass in additional properties
 * for declaration.
 * 
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name consumeBasic
 * @memberOf AmqpChannel#
 */
var consumeBasicFunc = AmqpChannel.prototype.consumeBasic;
AmqpChannel.prototype.consumeBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var consumerTag = myConfig.consumerTag;
       var noLocal = myConfig.noLocal || false;
       var noAck = true;
       var exclusive = myConfig.exclusive || false;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.consumeBasic(): String parameter \'queue\' is required");
       }

       if (!consumerTag || typeof consumerTag != 'string') {
           throw new Error("AmqpChannel.consumeBasic(): String parameter \'consumerTag\' is required");
       }

       if (typeof noLocal != 'boolean') {
           throw new Error("AmqpChannel.consumeBasic(): Parameter \'noLocal\' only accepts boolean values");
       }

       if (typeof(myConfig.noAck) !== "undefined" ) {
           if (typeof(myConfig.noAck) != 'boolean') {
               throw new Error("AmqpChannel.consumeBasic(): Parameter \'noAck\' only accepts boolean values");
           }

           // If myConfig.noAck is defined and it is a boolean, then use it.
           noAck = myConfig.noAck;
       }

       if (typeof exclusive != 'boolean') {
           throw new Error("AmqpChannel.consumeBasic(): Parameter \'exclusive\' only accepts boolean values");
       }
       
       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.consumeBasic(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return consumeBasicFunc.call(this, queue, consumerTag, noLocal, noAck, exclusive, noWait, args, callback);
   }
   else {
       return consumeBasicFunc.apply(this, arguments);
   }
};

/**
 * This method cancels a consumer. This does not affect already delivered
 * messages, but it does mean the server will not send any more messages for
 * that consumer. The client may receive an arbitrary number of messages in
 * between sending the cancel method and receiving the cancel-ok reply.
 * 
 * <p> AmqpChannel.cancelBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {consumerTag: clientTag, noWait: true};
 *    channel.cancelBasic(config, callback);
 * </pre>
 *
 * <p> 
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           consumerTag: 'consumer_tag_str_value',
 *                           noWait: true|false
 *                         }
 *                        </pre>
 * Required parameter consumerTag' is required. Boolean parameters 'noWait' is 
 * optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name cancelBasic
 * @memberOf AmqpChannel#
 */
var cancelBasicFunc = AmqpChannel.prototype.cancelBasic;
AmqpChannel.prototype.cancelBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var consumerTag = myConfig.consumerTag;
       var noWait = myConfig.noWait || false;
       
       if (!consumerTag || typeof consumerTag != 'string') {
           throw new Error("AmqpChannel.cancelBasic(): String parameter \'consumerTag\' is required");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.cancelBasic(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return cancelBasicFunc.call(this, consumerTag, noWait, callback);
   }
   else {
       return cancelBasicFunc.apply(this, arguments);
   }
};

/**
 * This method publishes a message to a specific exchange. The message will 
 * be routed to queues as defined by the exchange configuration and distributed
 * to any active consumers when the transaction, if any, is committed.
 * 
 * <p> AmqpChannel.publishBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var props = new AmqpProperties();
 *    props.setMessageId("msgId1");
 *    var config = {body: buffer, 
 *                  properties: props,
 *                  exchange: myExchangeName, 
 *                  routingKey: key};
 *    channel.publishBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           body: ArrayBuffer_or_ByteBuffer_instance,
 *                           properties: AmqpProperties_instance,
 *                           exchange: 'exchange_name_str_value',
 *                           routingKey: 'routingKey_str_value',
 *                           mandatory: true|false,
 *                           immediate: true|false
 *                         }
 *                        </pre>
 * Required parameter 'body' takes an instance of either ArrayBuffer or 
 * ByteBuffer. Newer browsers support ArrayBuffer. However, developers can
 * continue to support older browsers by specify a ByteBuffer payload as 'body'.
 * The 'properties' parameter takes an instance of AmqpProperties topass the 
 * pre-defined properties as per AMQP 0-9-1 specification. AmqpProperties 
 * provides getter/setter APIs for all the pre-defined properties as a 
 * convenience. Required parameter 'exchange' specifies the name of the exchange. 
 * Parameter 'routingKey' is required. Boolean parameters 'mandatory' and 
 * 'immediate' are optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name publishBasic
 * @memberOf AmqpChannel#
 */
var publishBasicFunc = AmqpChannel.prototype.publishBasic;
AmqpChannel.prototype.publishBasic = function(config, callback) {
    if (typeof config == 'object' && config.body) {
       myConfig = config || {};
       var body = myConfig.body;
       var properties = myConfig.properties;
       var exchange = myConfig.exchange;
       var routingKey = myConfig.routingKey;
       var mandatory = myConfig.mandatory || false;
       var immediate = myConfig.immediate || false;
       var msgBody = null;
       
       if (!body) {
           throw new Error("AmqpChannel.publishBasic(): \'body\' is a required parameter.");
       }

       if ((typeof(ArrayBuffer) !== "undefined") &&
           (body instanceof ArrayBuffer)) {
           msgBody = decodeArrayBuffer2ByteBuffer(body);
       }
       else if (body instanceof $rootModule.ByteBuffer) {
           msgBody = body;
       }
       else {
           throw new Error("AmqpChannel.publishBasic(): \'body\' should be an instance of either ArrayBuffer or ByteBuffer");
       }

       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.publishBasic(): String parameter \'exchange\' is required");
       }

       if (!routingKey || typeof routingKey != 'string') {
           throw new Error("AmqpChannel.publishBasic(): String parameter \'routingKey\' is required");
       }

       if (typeof mandatory != 'boolean') {
           throw new Error("AmqpChannel.publishBasic(): Parameter \'mandatory\' only accepts boolean values");
       }

       if (typeof immediate != 'boolean') {
           throw new Error("AmqpChannel.publishBasic(): Parameter \'immediate\' only accepts boolean values");
       }
       var prop = {};
       if (properties != undefined) {
           prop = properties.getProperties();
       }

       return publishBasicFunc.call(this, msgBody, prop, exchange, routingKey, mandatory, immediate, callback);
   }
   else {
       return publishBasicFunc.apply(this, arguments);
   }
};

/**
 * This method provides a direct access to the messages in a queue using a 
 * synchronous dialogue that is designed for specific types of application 
 * where synchronous functionality is more important than performance.
 * 
 * <p> AmqpChannel.getBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, noAck: true};
 *    channel.getBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           noAck: true|false
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Boolean parameter 
 * 'noAck' is optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name getBasic
 * @memberOf AmqpChannel#
 */
var getBasicFunc = AmqpChannel.prototype.getBasic;
AmqpChannel.prototype.getBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var noAck = myConfig.noAck || false;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.getBasic(): String parameter \'queue\' is required");
       }

       if (typeof noAck != 'boolean') {
           throw new Error("AmqpChannel.getBasic(): Parameter \'noAck\' only accepts boolean values");
       }
       
       return getBasicFunc.call(this, queue, noAck, callback);
   }
   else {
       return getBasicFunc.apply(this, arguments);
   }
};

/**
 * This method acknowledges one or more messages delivered via the Deliver
 * or Get-Ok methods. The client can ask to confirm a single message or a set of 
 * messages up to and including a specific message.
 * 
 * <p> AmqpChannel.ackBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {deliveryTag: dt, multiple: true};
 *    channel.ackBasic(config);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           deliveryTag: dt_num_value,
 *                           multiple: true|false
 *                         }
 *                        </pre>
 * Parameter 'deliveryTag' is required. Boolean parameter 'multiple' is optional
 * with false as the default value.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name ackBasic
 * @memberOf AmqpChannel#
 */
var ackBasicFunc = AmqpChannel.prototype.ackBasic;
AmqpChannel.prototype.ackBasic = function(config) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var deliveryTag = myConfig.deliveryTag;
       var multiple = myConfig.multiple || false;
       
       if (!deliveryTag || typeof deliveryTag != 'number') {
           throw new Error("AmqpChannel.ackBasic(): Numeric parameter \'deliveryTag\' is required");
       }

       if (typeof multiple != 'boolean') {
           throw new Error("AmqpChannel.ackBasic(): Parameter \'multiple\' only accepts boolean values");
       }
       
       return ackBasicFunc.call(this, deliveryTag, multiple, null);
   }
   else {
       return ackBasicFunc.apply(this, arguments);
   }
};


/**
 * This is the overloaded form of AmqpChannel.rejectBasic() function that 
 * named parameters or arguments using the Configuration object.
 * 
 * <p> AmqpChannel.rejectBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *    var channel = ...;
 *    var config = {deliveryTag: dt, requeue: true};
 *    channel.rejectBasic(config);
 * </pre>
 *
 * This method allows a client to reject a message. It can be used to interrupt 
 * and cancel large incoming messages, or return untreatable messages to their 
 * original queue.
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           deliveryTag: dt_num_value,
 *                           requeue: true|false
 *                         }
 *                        </pre>
 * Parameter 'deliveryTag' is required. Boolean parameter 'requeue' is optional
 * with false as the default value.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name rejectBasic
 * @memberOf AmqpChannel#
 */
var rejectBasicFunc = AmqpChannel.prototype.rejectBasic;
AmqpChannel.prototype.rejectBasic = function(config) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var deliveryTag = myConfig.deliveryTag;
       var requeue = myConfig.requeue || false;
       
       if (!deliveryTag || typeof deliveryTag != 'number') {
           throw new Error("AmqpChannel.rejectBasic(): Numeric parameter \'deliveryTag\' is required");
       }

       if (typeof requeue != 'boolean') {
           throw new Error("AmqpChannel.rejectBasic(): Parameter \'requeue\' only accepts boolean values");
       }
       
       return rejectBasicFunc.call(this, deliveryTag, requeue, null);
   }
   else {
       return rejectBasicFunc.apply(this, arguments);
   }
};

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * An object for storing list of actions and then executing them when required
 * @private
 */
var ActionList = function() {
    this._actionList = new Array();
    this.currentAction = 0;
    this._replayLength = 0;
};

/**
 * Return reference to actionList array
 */
ActionList.prototype.getActionList = function() { return this._actionList };

ActionList.prototype.setReplayLength = function(l) { this._replayLength = l; };

/**
 * Executes an action in the actionList each time it is invoked and keeps 
 * track with of current action by using 'currentAction' variable
 */
ActionList.prototype._processActions = function _processActions() {
    if (!this._actionList.length) {            
        return;
    }

    if(this.currentAction == this._actionList.length) {
        this.currentAction = 0;
    }

    var action = this._actionList[this.currentAction];
    this.currentAction++;
    
    action.func.apply(action.object, action.args);
};

/**
 * Executes all the actions in the actionList
 */
ActionList.prototype._processAllActions = function _processAllActions() {
    for (i=0; i < this._replayLength; i++) {
        var action = this._actionList[i];
        action.func.apply(action.object, action.args);
    }
};

ActionList.prototype._processAllNewActions = function _processAllNewActions() {
    for (i=this._replayLength; i < this._actionList.length; i++) {
        var action = this._actionList[i];
        action.func.apply(action.object, action.args);
    }
};

/**
 * Function is used to add an action to list which will be executed later
 * @param {methodName} name of method to be executed (used for filtering out unwanted methods).
 * @param {object} object on which function to be executed
 * @param {func} function to be executed
 * @param {args} function arguments to be passed
 */
ActionList.prototype._addAction = function _addAction(methodName, object, func, args) {
    // switch case is used only to prevent addition of actions from unwanted methods and 
    // allow only declareExchange(), declareQueue(), bindQueue() and consumeBasic() methods to add action
    // need conditional insertion of function call while using string template to remove this switch case
    switch(methodName)
    {
        case 'declareExchange':
            break;
        case 'declareQueue':
            break;
        case 'bindQueue':
            break;
        case 'consumeBasic':
            break;
        default:
            return;
    }
    var nullCallable = function nullCallable(){};
    var action = {};
    action.object = object;        
    action.func = func || nullCallable;
    action.args = args || null;

    this._actionList.push(action);
};
/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

window.AmqpClient = $module.AmqpClient  = AmqpClient;
window.AmqpChannel  = $module.AmqpChannel = AmqpChannel;

})();


/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * AmqpArguments is a table of optional arguments for AMQP commands
 *
 * @constructor
 *
 * @class AmqpArguments
 *
 */
var AmqpArguments = function() {};
AmqpArguments.prototype = new Array();
(function($module) {
    var $prototype = AmqpArguments.prototype;

    var _add = function($this, key, value, type) {
        var entry = {};
        entry.key = key;
        entry.value = value;
        // If value is null, we will use Void as the type so that the
        // encoding and decoding can work properly.
        if (value==null) {
           type = "void";
        }
        entry.type = type;
        $this.push(entry);
    }


    /**
     * Adds a long string value to an AmqpArguments table.
     *
     * @param {String} key
     * <p>
     * @param {String} value
     *
     * @return {AmqpArguments}
     *
     * @public
     * @function
     * @name addLongString
     * @memberOf AmqpArguments#
     */
    $prototype.addLongString = function(key, value) {
        _add(this, key, value, "longstr");
        return this;
    }

    /**
     * Adds an integer value to an AmqpArguments table.
     *
     * @param {String}  key
     * <p>
     * @param {Number} value
     *
     * @return {AmqpArguments}
     *
     * @public
     * @function
     * @name addInteger
     * @memberOf AmqpArguments#
     */
    $prototype.addInteger = function(key, value) {
        _add(this, key, value, "int");
        return this;
    }

    /**
     * Returns String representation of the AmqpArguments.
     *
     * @public
     * @function
     * @return {String}
     * @name toString
     * @memberOf AmqpArguments#
     */
    $prototype.toString = function() {
        var buffer = [];
        for (var i = 0; i < this.length; i++) {
            if (this[i].key != null) {
                buffer.push("{key:" + this[i].key + ", value:" + this[i].value + ", type:" + this[i].type + "}");
            }
        }
        
        return "{" + buffer.join(", ") + "}";
    };

    $module.AmqpArguments = AmqpArguments;
    
})(window || Kaazing.AMQP);



/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * Creates an AmqpProperties instance.  
 * <p>
 * The value of the "headers" property is of type AmqpArguments. Kaazing
 * AMQP implementation uses AmqpArguments to encode the "table". Similarly,
 * Kaazing AMQP implementation decodes the "table" and constructs an instance
 * of AmqpArguments.
 *
 * @constructor
 *
 * @class AmqpProperties class is used to specify the pre-defined properties as per
 * AMQP 0-9-1 specification. This class provides type-safe convenience getters
 * and setters for the pre-defined or standard AMQP properties.
 *
 * @see AmqpArguments
 */

var AmqpProperties = function(headers) {
    this._properties = {};
    if (headers != null) {
        // Confirm that the passed in map contains just the pre-defined
        // properties.
        var propFound = false;
            
        // For each property available in the set, we confirm whether it is
        // a valid pre-defined property by cross-checking with the
        // AmqpBuffer.basicProperties.
        for (var prop in headers) {
            propFound = false;
            for (var i = 0; i <_basicProperties.length; i++) {
                if (prop == _basicProperties[i].name) {
                    // Move to the next prop in the set.
                    propFound = true;
                    break;
                }
            }
                
            if (!propFound) {
                throw new Error("Illegal property: '" + prop.getKey() + "' passed");
            }
        }
            
        // Validate the values specified in the map.
        for (var propName in headers) {
            var propValue = headers[propName];
            if (propName == "appId"           ||
                propName == "contentType"     ||
                propName == "contentEncoding" ||
                propName == "correlationId"   ||
                propName == "expiration"      ||
                propName == "messageId"       ||
                propName == "replyTo"         ||
                propName == "type"            ||
                propName == "userId")
                {
                    
                if ((propValue != null) && (typeof(propValue) != "string")) {
                    var s = "Invalid type: Value of '" + propName +
                    "' should be of type String";
                    throw new Error(s);
                }
            }
            else if (propName == "headers") {
                if ((propValue != null) && 
                    !(propValue instanceof AmqpArguments)) {
                    s = "Invalid type: Value of '" + propName +
                    "' should be of type AmqpArguments";
                    throw new Error(s);
                }
            }
            else if (propName =="timestamp") {
                // There is no good way to figure out whether an object is
                // an instance of Date. That's why we are checking whether
                // the object has getMonth function that is callable.
                if ((propValue != null) && 
                     propValue.getMonth && propValue.getMonth.call) {
                    continue;
                }
                
                // Otherwise, throw an error.
                var s = "Invalid type: Value of '" + propName +
                    "' should be of type Date";
                throw new Error(s);
            }
            else if (propName== "deliveryMode") {
                if ((propValue != null) && (typeof(propValue) != "number")) {
                    var s = "Invalid type: Value of '" + propName +
                    "' should be of type Integer";
                    throw new Error(s);
                }
                    
                if ((propValue != 1) && (propValue != 2)) {
                    var s = "Invalid value: Value of '" + propName +
                    "' should be either 1(non-persistent) or 2(persistent)";
                    throw new Error(s);
                }
            }
            else if (propName == "priority") {
                if ((propValue != null) && (typeof(propValue) != "number")) {
                    var s = "Invalid type: Value of '" + propName +
                    "' should be of type Integer";
                    throw new Error(s);
                }
                    
                if ((propValue < 0) || (propValue > 9)) {
                    var s = "Invalid value: Value of property '" + propName +
                    "' should be between 0 and 9";
                    throw new Error(s);
                }
            }
            else {
                var s = "Illegal property '" + propName + "' specified";
                throw new Error(s);
            }
        }      
        this._properties = headers;
    }
};
(function() {    
    var $prototype = AmqpProperties.prototype;
    /**
     * Returns the value of "appId" property. A null is returned if the property
     * is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getAppId
     * @memberOf AmqpProperties#
     * @return String value for "appId" property
     */
    $prototype.getAppId = function() {
        return this._properties["appId"];
    }

    /**
     * Returns the value of "contentType" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getContentType
     * @memberOf AmqpProperties#
     * @return String value for "contentType" property
     */
    $prototype.getContentType = function() {
        return this._properties["contentType"];
    }
    
    /**
     * Returns the value of "contentEncoding" property. A null is returned if
     * the property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getContentEncoding
     * @memberOf AmqpProperties#
     * @return String value for "contentEncoding" property
     */
    $prototype.getContentEncoding = function() {
        return /*(String)*/ this._properties["contentEncoding"];
    }
    
    /**
     * Returns the value of "correlationId" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getCorrelationId
     * @memberOf AmqpProperties#
     * @return String value for "correlationId" property
     */
    $prototype.getCorrelationId = function() {
        return /*(String)*/ this._properties["correlationId"];
    }

    /**
     * Returns the value of "deliveryMode" property. A null is returned if the
     * property is not set. If deliveryMode is 1, then it indicates 
     * non-persistent mode. If deliveryMode is 2, then it indicates a persistent
     * mode.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getDeliveryMode
     * @memberOf AmqpProperties#
     * @return Integer value between 0 and 9 for "deliveryMode" property
     */
    $prototype.getDeliveryMode = function() {
        return parseInt(this._properties["deliveryMode"]);
    }
    
    /**
     * Returns the value of "expiration" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getExpiration
     * @memberOf AmqpProperties#
     * @return String value for "expiration" property
     */
    $prototype.getExpiration = function() {
        return this._properties["expiration"];
    }

    /**
     * Returns the value of "headers" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {object}
     * @name getHeaders
     * @memberOf AmqpProperties#
     * @return AmqpArguments as value for "headers" property
     */
    $prototype.getHeaders = function() {
        return this._properties["headers"];
    }
    
    /**
     * Returns the value of "messageId" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getMessageId
     * @memberOf AmqpProperties#
     * @return String value for the "messageId" property
     */
    $prototype.getMessageId = function() {
        return this._properties["messageId"];
    }

    /**
     * Returns the value of "priority" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getPriority
     * @memberOf AmqpProperties#
     * @return Integer value for "priority" property between 0 and 9
     */
    $prototype.getPriority = function() {
        return parseInt(this._properties["priority"]);
    }
    
    /**
     * Returns a clone of the properties by shallow copying the values.
     * 
     * @public
     * @function
     * @return {object}
     * @name getProperties
     * @memberOf AmqpProperties#
     * @return Object with the name-value pairs
     */
    $prototype.getProperties = function() {
        // Shallow copy entries to a newly instantiated HashMap.
        var clone = {};
        
        for (var key in this._properties) {
            if (this._properties[key] != null) {
                clone[key] =  this._properties[key];
            }
        }
        
        return clone;
    }

    /**
     * Returns the value of "replyTo" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getReplyTo
     * @memberOf AmqpProperties#
     * @return String value for "replyTo" property
     */
    $prototype.getReplyTo = function() {
        return this._properties["replyTo"];
    }
    
    /**
     * Returns the value of "timestamp" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getTimestamp
     * @memberOf AmqpProperties#
     * @return Timestamp value for "timestamp" property
     */
    $prototype.getTimestamp = function() {
        return this._properties["timestamp"];
    }
    
    /**
     * Returns the value of "type" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getType
     * @memberOf AmqpProperties#
     * @return String value for "type" property
     */
    $prototype.getType = function() {
        return this._properties["type"];
    }
    
    /**
     * Returns the value of "userId" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getUserId
     * @memberOf AmqpProperties#
     * @return String value for  "userId" property
     */
    $prototype.getUserId = function() {
        return this._properties["userId"];
    }
    
    /**
     * Sets the value of "appId" property. If a null value is passed in, it
     * indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setAppId
     * @param  appId    value of "appId" property
     * @memberOf AmqpProperties#
     */
    $prototype.setAppId = function(appId) {
        this._properties["appId"] = appId;
    }

    /**
     * Sets the value of "contentType" property. If a null value is passed in, it
     * indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setContentType
     * @param  contentType    value of "contentType" property
     * @memberOf AmqpProperties#
     */
    $prototype.setContentType = function(contentType) {
        this._properties["contentType"] = contentType;
    }
    
    /**
     * Sets the value of "contentEncoding" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setContentEncoding
     * @param  encoding    value of "contentEncoding" property
     * @memberOf AmqpProperties#
     */
    $prototype.setContentEncoding = function(encoding) {
        this._properties["contentEncoding"] = encoding;
    }
    
    /**
     * Sets the value of "correlationId" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setCorrelationId
     * @param  correlationId    value of "correlationId" property
     * @memberOf AmqpProperties#
     */
    $prototype.setCorrelationId = function(correlationId) {
        this._properties["correlationId"] = correlationId;
    }

    /**
     * Sets the value of "deliveryMode" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setDeliveryMode
     * @memberOf AmqpProperties#
     * @param  deliveryMode    value of "deliveryMode" property
     */
    $prototype.setDeliveryMode = function(deliveryMode) {
        if (deliveryMode == null) {
            var s = "Null parameter passed into AmqpProperties.setPriority()";
            throw new Error(s);
        }
        
        // Perhaps, we could do an enum for deliveryMode. But, it will require
        // some major changes in encoding and decoding and we don't have much
        // time to do it across all the clients.
        if ((deliveryMode != 1) && (deliveryMode != 2)) {
            s = "AMQP 0-9-1 spec mandates 'deliveryMode' value to be " +
            "either 1(for non-persistent) or 2(for persistent)";
            throw new Error(s);
        }
        
        this._properties["deliveryMode"] = deliveryMode;
    }
    
    /**
     * Sets the value of "expiration" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setExpiration
     * @memberOf AmqpProperties#
     * @param  expiration    value of "expiration" property
     */
    $prototype.setExpiration = function(expiration) {
        this._properties["expiration"] = expiration;
    }

    /**
     * Sets the value of "headers" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setHeaders
     * @memberOf AmqpProperties#
     * @param  headers    value of "headers" property
     */
    $prototype.setHeaders = function(headers) {
        this._properties["headers"] = headers;
    }
    
    /**
     * Sets the value of "messageId" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setMessageId
     * @memberOf AmqpProperties#
     * @param  messageId    value of "messageId" property
     */
    $prototype.setMessageId = function(messageId) {
        this._properties["messageId"] = messageId;
    }

    /**
     * Sets the value of "priority" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setPriority
     * @memberOf AmqpProperties#
     * @param  priority    value of "priority" property
     */
    $prototype.setPriority = function(priority) {        
        if (priority == null) {
            var s = "Null parameter passed into AmqpProperties.setPriority()";
            throw new Error(s);
        }
        
        if ((priority < 0) || (priority > 9)) {
            s = "AMQP 0-9-1 spec mandates 'priority' value to be between 0 and 9";
            throw new Error(s);
        }
        
        this._properties["priority"] = priority;
    }
    
    /**
     * Sets the value of "replyTo" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setReplyTo
     * @memberOf AmqpProperties#
     * @param  replyTo    value of "replyTo" property
     */
    $prototype.setReplyTo = function(replyTo) {
        this._properties["replyTo"] = replyTo;
    }
    
    /**
     * Sets the value of "timestamp" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setTimestamp
     * @memberOf AmqpProperties#
     * @param  date    of type Date
     */
    $prototype.setTimestamp = function(date) {
        if (date != null) {
            if (date.getMonth && date.getMonth.call) {
               s = "AmqpProperties.setTimestamp() expects a Date"
            }
        }
        this._properties["timestamp"] = date;
    }
    
    /**
     * Sets the value of "type" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setType
     * @memberOf AmqpProperties#
     * @param  type    value of "type" property
     */
    $prototype.setType = function(type) {
        this._properties["type"] = type;
    }
    
    /**
     * Sets the value of "userId" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setUserId
     * @memberOf AmqpProperties#
     * @param  userId    value of "userId" property
     */
    $prototype.setUserId = function(userId) {
        this._properties["userId"] = userId;
    }
    
    /**
     * Returns String representation of the properties.
     *
     * @public
     * @function
     * @return {String}
     * @name toString
     * @memberOf AmqpProperties#
     *
     */
    $prototype.toString = function() {
        if ((this._properties == null) || (this._properties.length == 0)) {
            return "";
        }
        
        var buffer = []; 
        
        for (var key in this._properties) {
            if (this._properties[key] != null) {
                buffer.push(key + ":" + this._properties[key]);
            }
        }
        
        return "{" + buffer.join(", ") + "}";
    };

    $module.AmqpProperties = AmqpProperties;
    
})(window || Kaazing.AMQP);

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

(function($module) {

    var _rename = function(type) {
        switch(type) {
            case "deliverBasic":
                return "message";
    
            case "closeOkChannel":
            case "closeChannel":
            case "closeOkConnection":
            case "closeConnection":
                return "close";
    
            case "getOkBasic":
            case "getEmptyBasic":
                return "get";
    
            // change in terminology
            case "consumeOkBasic":
                return "consume";
            case "cancelOkBasic":
                return "cancel";
            
            case "openOkConnection":
            case "openOkChannel":
                return "open";
            case "declareOkQueue":
                return "declarequeue";
            case "declareOkExchange":
                return "declareexchange";
            case "flowOkChannel":
                return "flow";
            case "bindOkQueue":
                return "bindqueue";
            case "unbindOkQueue":
                return "unbindqueue";
            case "deleteOkQueue":
                return "deletequeue";
            case "deleteOkExchange":
                return "deleteexchange";
            case "commitOkTx":
                return "committransaction";
            case "rollbackOkTx":
                return "rollbacktransaction";
            case "selectOkTx":
                return "selecttransaction";
            case "purgeOkQueue":
                return "purgequeue";
            case "recoverOkBasic":
                return "recover";
            case "rejectOkBasic":
                return "reject";
                
            case "error":
                return "error";
    
    
            default:
                throw(new Error("AMQP: unknown event name " + type));
    
        }    
    };
    
    /**
     * AmqpEvent is dispatched to event listeners and callback functions
     *  registered when using AmqpClient and AmqpChannel
     *
     * @constructor
     *
     * @class  AmqpEvent 
     *
     */
    AmqpEvent = function(sender, frame, headers) {
        this.type = frame.methodName;
        this.type = _rename(this.type);
    
        /*
         ideas :
            pull out method arguments into a dictionary with arg name and value
        */
        this.args = {};
        for (var i=0; i<frame.args.length; i++) {
            this.args[frame.args[i].name] = frame.args[i].value;
        }
    
        // TODO: change message event construction to pass in body param, headers
        this.headers = headers
        this.target = sender;
        
        // No longer exposing body as a public property. Instead, we are exposing
        // two methods/function -- getBodyAsArrayBuffer() and getBodyAsByteBuffer().
        this._body = frame.body;

        if (this.type == "message") {
            this.properties = new AmqpProperties(headers);
        }
    
        if (this.type == "error") {
            this.message = this.args["replyText"];
        }
    };
    
    var $prototype = AmqpEvent.prototype;

    /**
     * Indicates the type of the event.
     *
     * @public
     * @field
     * @type String
     * @name type
     * @memberOf AmqpEvent#
     */
    $prototype.type;

    /**
     * Specifies the error message when the event type is "error".
     *
     * @public
     * @field
     * @type String
     * @name errorMessage
     * @memberOf AmqpEvent#
     */
    $prototype.message;

    /**
     * This has been <b>deprecated</b>. Please use the 'properties' field to 
     * retrieve AMQP 0-9-1 properties included with the message.
     *
     * @public
     * @field
     * @type Object
     * @name headers
     * @memberOf AmqpEvent#
     * @deprecated  -- Please use 'properties' field of type AmqpProperties
     */
    $prototype.headers;

    /**
     * The content properties for message events. The type of the 'properties'
     * field is AmqpProperties.
     *
     * @public
     * @field
     * @type AmqpProperties
     * @name properties
     * @memberOf AmqpEvent#
     */
    $prototype.properties;
    
    /**
     * The target object that dispatched the event.
     *
     * @public
     * @field
     * @type AmqpChannel | AmqpClient
     * @name target
     * @memberOf AmqpEvent#
     */
    $prototype.target;

    /**
     * Returns the body or the payload of the event as an ArrayBuffer. If
     * the browser does not support ArrayBuffer, then an error is thrown.
     *
     * @return {ArrayBuffer}
     *
     * @public
     * @function
     * @name getBodyAsArrayBuffer
     * @memberOf AmqpEvent#
     */
    $prototype.getBodyAsArrayBuffer = function() {
        if (typeof(ArrayBuffer) === "undefined") {
            throw new Error("AmqpEvent.getBodyAsArrayBuffer(): Browser does not support ArrayBuffer.");
        }

        if (typeof (this._body) !== "undefined") {
            return this._body.getArrayBuffer(this._body.remaining());
        }
        
        return null;
    }
    
    /**
     * Returns the body or the payload of the event as a ByteBuffer.
     *
     * @return {ByteBuffer}
     *
     * @public
     * @function
     * @name getBodyAsByteBuffer
     * @memberOf AmqpEvent#
     */
    $prototype.getBodyAsByteBuffer = function() {
        return (this._body || null);
    }

    $module.AmqpEvent = AmqpEvent;
    
})(window || Kaazing.AMQP);



/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
  Creates a new AmqpClientFactory instance.

  @constructor
  @class AmqpClientFactory is used to create instances of AmqpClient.
*/
var AmqpClientFactory = function() {
    if ($gatewayModule && typeof($gatewayModule.WebSocketFactory) === "function") {
        this._webSocketFactory = new $gatewayModule.WebSocketFactory();
    }
};

(function($module) {    
    var $prototype = AmqpClientFactory.prototype;
    
    /**
     * Creates an instance of AmqpClient to run AMQP 0-9-1 protocol over a 
     * full-duplex WebSocket connection.
     *
     * @public
     * @function
     * @name createAmqpClient
     * @return {AmqpClient} the AmqpClient
     * @memberOf AmqpClientFactory#
     */
    $prototype.createAmqpClient = function() {
        return new AmqpClient(this);
    }

    /**
     * Returns WebSocketFactory instance that is used to create connection
     * if Kaazing's WebSocket implementation is used. This method returns a
     * null if the browser's WebSocket implementation is being used. The
     * WebSocketFactory instance can be used to set WebSocket related
     * characteristics such as connection-timeout, challenge handlers, etc.
     *
     * @public
     * @function
     * @name getWebSocketFactory
     * @return {WebSocketFactory}
     * @memberOf AmqpClientFactory#
     */
    $prototype.getWebSocketFactory = function() {
        return (this._webSocketFactory || null);
    }

    /**
     * Sets WebSocketFactory instance that is used to create connection if
     * Kaazing's WebSocket implementation is used. This method will throw an 
     * error if the parameter is null, undefined or not an instance of 
     * WebSocketFactory.
     *
     * @public
     * @function
     * @name setWebSocketFactory
     * @param factory {WebSocketFactory}  instance of WebSocketFactory
     * @return {void}
     * @memberOf AmqpClientFactory#
     */
    $prototype.setWebSocketFactory = function(factory) {
        if ((factory === null) || (typeof(factory) === "undefined")) {
            throw new Error("AmqpClientFactory.setWebSocketFactory(): \'factory\' is required parameter.");
        }
        if (!(factory instanceof $gatewayModule.WebSocketFactory)) {
            throw new Error("AmqpClientFactory.setWebSocketFactory(): \'factory\' must be an instance of WebSocketFactory.");
        }
        this._webSocketFactory = factory;
    }

    $module.AmqpClientFactory = AmqpClientFactory;

})(window || Kaazing.AMQP);
