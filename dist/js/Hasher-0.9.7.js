/*!
 * Hasher <http://github.com/millermedeiros/Hasher>
 * Includes: MM.EventDispatcher (0.8.2), MM.queryUtils (0.8.2), MM.event-listenerFacade (0.3)
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.9.7 (2010/11/01)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
/*
 * Miller Medeiros JS Library
 * @author Miller Medeiros
 * @version 0.1 (2010/09/10)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
 
 /**
 * @namespace Miller Medeiros Namespace
 */
 var millermedeiros = {};
/**
 * EventDispatcher Object, used to allow Custom Objects to dispatch events.
 * @constructor
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.8.2 (2010/08/26)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
millermedeiros.EventDispatcher = function(){
	/** 
	 * Event Handlers
	 * @type Object.<string, Array.<Function>>
	 */
	this._handlers = {};
	
	/**
	 * Disabled Event Types (events types that shouldn't be dispatched)
	 * @type Array.<string>
	 */
	this._disabled = [];
};

millermedeiros.EventDispatcher.prototype = {
	
	/**
	 * Add Event Listener
	 * @param {string} eType	Event Type.
	 * @param {Function} fn	Event Handler.
	 */
	addEventListener : function(eType, fn){
		if(typeof this._handlers[eType] == 'undefined'){
			this._handlers[eType] = [];
		}
		this._handlers[eType].push(fn);
	},
	
	/**
	 * Remove Event Listener
	 * @param {string} eType	Event Type.
	 * @param {Function} fn	Event Handler.
	 */
	removeEventListener : function(eType, fn){
		if(! this.hasEventListener(eType)){
			return;
		}
		var	typeHandlers = this._handlers[eType], //stored for performance
			n = typeHandlers.length;
		if(n == 1){
			delete this._handlers[eType];
		}else{
			while(n--){ //faster than for
				if(typeHandlers[n] == fn){
					typeHandlers.splice(n, 1);
					break;
				}
			}
		}
	},
	
	/**
	 * Removes all Listeners from the EventDispatcher object.
	 * @param {(string|boolean)} eType	Event type or `true` if want to remove listeners of all event types.
	 */
	removeAllEventListeners : function(eType){
		if(typeof eType === 'string' && this.hasEventListener(eType)){
			delete this._handlers[eType];
		}else if(eType){
			this._handlers = {};
		}
	},
	
	/**
	 * Checks if the EventDispatcher has any listeners registered for a specific type of event. 
	 * @param {string} eType	Event Type.
	 * @return {boolean}
	 */
	hasEventListener : function(eType){
		return (typeof this._handlers[eType] != 'undefined');
	},

	/**
	 * Dispatch Event
	 * - Call all Handlers Listening to the Event.
	 * @param {(Object|string)} evt	Custom Event Object (property `type` is required) or String with Event type.
	 * @return {boolean} If Event was successfully dispatched.
	 */
	dispatchEvent : function(evt){
		evt = (typeof evt == 'string')? {type: evt} : evt; //create Object if not an Object to always call handlers with same type of argument.
		if(this.hasEventListener(evt.type)){
			var typeHandlers = this._handlers[evt.type], //stored for performance
				curHandler,
				i,
				n = typeHandlers.length;
			evt.target = evt.target || this; //ensure Event.target exists
			for(i=0; i<n; i++){
				curHandler = typeHandlers[i];
				curHandler(evt);
			}
			return true;
		}
		return false;
	},
	
	/**
	 * Check if Event will be dispatched (i.e. If event type is enabled)
	 * @param {string} evtType	Event type.	
	 * @return {boolean} If Event will be dispatched.
	 */
	willDispatch : function(evtType){
		var n = this._disabled.length;
		while(n--){
			if(this._disabled[n] === evtType){
				return false;
			}
		}
		return true;
	},
	
	/**
	 * Disable Event dispatching by type
	 * @param {...string} evtTypes	Event types that should be disabled (events types that shouldn't be dispatched)
	 */
	disableEvent : function(evtTypes){
		var types = Array.prototype.slice.call(arguments, 0),
			n = types.length,
			curType;
		while(n--){
			curType = types[n];
			if(this.willDispatch(curType)){ //avoid adding multiple times
				this._disabled.push(curType);
			}
		}
	},
	
	/**
	 * Enable Event dispatching by type
	 * @param {...string} evtTypes	Event types that should be enabled (events types that should be dispatched)
	 */
	enableEvent : function(evtTypes){
		var types = Array.prototype.slice.call(arguments, 0),
			n = types.length,
			m,
			curType;
		while(n--){
			curType = types[n];
			m = this._disabled.length;
			while(m--){
				if(this._disabled[m] === curType){
					this._disabled.splice(m, 1);
				}
			}
		}
	}
	
};
/**
 * @namespace Utilities for query string manipulation.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.8.2 (2010/08/12)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
millermedeiros.queryUtils = {
	
	/**
	 * Gets full query as string with all special chars decoded.
	 * @param {string} [url]	 URL to be parsed, defaults to `location.href`
	 * @return {string}	Query string
	 */
	getQueryString : function(url){
		url = url || location.href; //used location.href to avoid bug on IE6 and pseudo query string inside location.hash
		url = url.replace(/#[\w\W]*/, ''); //removes hash (to avoid getting hash query)
		var queryString = /\?[a-zA-Z0-9\=\&\%\$\-\_\.\+\!\*\'\(\)\,]+/.exec(url); //valid chars according to: http://www.ietf.org/rfc/rfc1738.txt
		return (queryString)? decodeURIComponent(queryString[0]) : '';
	},
	
	/**
	 * Gets query as Object.
	 * - Alias for `millermedeiros.queryUtils.toQueryObject( millermedeiros.queryUtils.getQueryString(url) )`
	 * @param {string} [url]	URL to be parsed, default to location.href.
	 * @return {Object.<string, (string|number)>}	Object with all the query "params => values" pairs.
	 */
	getQueryObject : function(url){
		return this.toQueryObject(this.getQueryString(url));
	},
	
	/**
	 * Convert Query String into an Object
	 * @param {string} queryString	 Query String to be parsed
	 * @return {Object.<string, (string|number)>}	Object with all the query "params => values" pairs.
	 */
	toQueryObject : function(queryString){
		var queryArr = queryString.replace('?', '').split('&'), 
			n = queryArr.length,
			queryObj = {},
			value;
		while (n--) {
			queryArr[n] = queryArr[n].split('=');
			value = queryArr[n][1];
			queryObj[queryArr[n][0]] = isNaN(value)? value : parseFloat(value);
		}
		return queryObj;
	},
	
	/**
	 * Get query parameter value.
	 * @param {string} param	Parameter name.
	 * @param {string} [url]	URL to be parsed, default to location.href
	 * @return {(string|number)}	Parameter value.
	 */
	getParamValue : function(param, url){
		url = url || location.href;
		var regexp = new RegExp('(\\?|&)'+ param + '=([^&]*)'), //matches `?param=value` or `&param=value`, value = $2
			result = regexp.exec(url),
			value = (result && result[2])? result[2] : null;
		return isNaN(value)? value : parseFloat(value);
	},
	
	/**
	 * Checks if query contains parameter.
	 * @param {string} param	Parameter name.
	 * @param {string} [url]	URL to be parsed, default to location.href
	 * @return {boolean} If parameter exist.
	 */
	hasParam : function(param, url){
		var regexp = new RegExp('(\\?|&)'+ param +'=', 'g'); //matches `?param=` or `&param=`
		return regexp.test(this.getQueryString(url));
	},
	
	/**
	 * Converts object into query string.
	 * @param {Object} obj	Object with "params => values" pairs.
	 * @return {string}	Formated query string starting with '?'.
	 */
	toQueryString : function(obj){
		var query = [],
			param;
		for(param in obj){
			if(obj.hasOwnProperty(param)){ //avoid copying properties from the prototype
				query.push(param +'='+ obj[param]);
			}
		}
		return (query.length)? '?'+ query.join('&') : '';
	}
	
};
/*
 * millermedeiros.event - DOM Event Listener Facade
 * - Cross-browser DOM Event Listener attachment/detachment.
 * - Based on Peter-Paul Koch addEventSimple <http://www.quirksmode.org/js/eventSimple.html>
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.3 (2010/06/23)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace Utilities for Browser Native Events
 */
millermedeiros.event = millermedeiros.event || {};

/**
* Adds DOM Event Listener
* @param {Element} elm Element.
* @param {string} eType Event type.
* @param {Function} fn Listener function.
*/
millermedeiros.event.addListener = function(elm, eType, fn){
	if(elm.addEventListener){
		elm.addEventListener(eType, fn, false);
	}else if(elm.attachEvent){
		elm.attachEvent('on' + eType, fn);
	}else{
		elm['on' + eType] = fn;
	}
};

/**
* Removes DOM Event Listener
* @param {Element} elm Element.
* @param {string} eType Event type.
* @param {Function} fn Listener function.
*/
millermedeiros.event.removeListener = function(elm, eType, fn){
	if(elm.removeEventListener){
		elm.removeEventListener(eType, fn, false);
	}else if(elm.detachEvent){
		elm.detachEvent('on' + eType, fn);
	}else{
		elm['on' + eType] = null;
	}
};
/*
 * Hasher Event
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.2 (2010/04/18)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * HasherEvent Object.
 * <p>According to the HTML5 spec `hashchange` event should have `oldURL` and `newURL` properties, since the only portion of the URL that changes is the hash I decided to use `oldHash` and `newHash` instead. (http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#event-hashchange)</p>
 * @param {string} eType	Hasher Event type.
 * @param {(string|null)} oldHash	Previous Hash.
 * @param {(string|null)} newHash	Current Hash.
 * @constructor
 */
var HasherEvent = function(eType, oldHash, newHash){
	/**
	 * Event Type
	 * @type string
	 */
	this.type = eType;
	/**
	 * Previous Hash value
	 * @type (string|null)
	 */
	this.oldHash = oldHash;
	/**
	 * Current Hash value
	 * @type (string|null)
	 */
	this.newHash = newHash;
};

/**
 * Returns string representation of the HasherEvent
 * @return {string} A string representation of the object.
 */
HasherEvent.prototype.toString = function(){
	return '[HasherEvent type="'+ this.type +'" oldHash="'+ this.oldHash +'" newHash="'+ this.newHash +'"]';
};

//-- Constants --//

/**
 * Defines the value of the type property of an change event object.
 * @type string
 * @constant
 */
HasherEvent.CHANGE = 'change';

 /**
 * Defines the value of the type property of an init event object.
 * @type string
 * @constant
 */
HasherEvent.INIT = 'init';

/**
 * Defines the value of the type property of an stop event object.
 * @type string
 * @constant
 */
HasherEvent.STOP = 'stop';
/*
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.9.6 (2010/11/01)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(window, document, location, history){
	
	
	//== Private Vars ==//
	
	var 
		/** @private {string} previous/current hash value */
		_hash, 
		
		/** @private {number} stores setInterval reference (used to check if hash changed on non-standard browsers) */
		_checkInterval,
		
		/** @private {boolean} If Hasher is active and should listen/dispatch changes on the window location hash */
		_isActive,
		
		/** @private {Element} iframe used for IE <= 7 */
		_frame,
		
		/** @private {string} User Agent */
		UA = navigator.userAgent,
		
		/** @private {boolean} if is IE */
		_isIE = /MSIE/.test(UA)  && (!window.opera),
		
		/** @private {boolean} If browser supports the `hashchange` event - FF3.6+, IE8+, Chrome 5+, Safari 5+ */
		_isHashChangeSupported = ('onhashchange' in window),
		
		/** @private {boolean} if is IE <= 7 */
		_isLegacyIE = /MSIE (6|7)/.test(UA) && !_isHashChangeSupported, //check if is IE6-7 since hash change is only supported on IE8+ and changing hash value on IE6-7 doesn't generate history record.
		
		/** @private {boolean} If it is a local file */
		_isLocal = (location.protocol === 'file:'),
		
		//-- local storage for performance improvement and better compression --//
		
		/** @private {millermedeiros} Miller Medeiros Namespace */
		mm = millermedeiros,
		
		/** @private {millermedeiros.EventDispatcher} @extends millermedeiros.EventDispatcher */
		Hasher = new mm.EventDispatcher(),
		
		/** @private {millermedeiros.queryUtils} Utilities for query string manipulation */
		_queryUtils = mm.queryUtils,
		
		/** @private {millermedeiros.event} Browser native events facade */
		_eventFacade = mm.event;
		
	
	//== Private Methods ==//
	
	/**
	 * Remove `Hasher.prependHash` and `Hasher.appendHash` from hashValue
	 * @param {string} hash	Hash value
	 * @private
	 */
	function _trimHash(hash){
		var regexp = new RegExp('^\\'+ Hasher.prependHash +'|\\'+ Hasher.appendHash +'$', 'g'); //match appendHash and prependHash
		return hash.replace(regexp, '');
	}
	
	/**
	 * Get hash value stored inside iframe
	 * - used for IE <= 7. [HACK] 
	 * @return {string}	Hash value without '#'.
	 * @private
	 */
	function _getFrameHash(){
		return (_frame)? _frame.contentWindow.frameHash : null;
	}
	
	/**
	 * Update iframe content, generating a history record and saving current hash/title on IE <= 7. [HACK]
	 * - based on Really Simple History, SWFAddress and YUI.history solutions.
	 * @param {(string|null)} hashValue	Hash value without '#'.
	 * @private
	 */
	function _updateFrame(hashValue){
		if(_frame && hashValue != _getFrameHash()){
			var frameDoc = _frame.contentWindow.document;
			frameDoc.open();
			frameDoc.write('<html><head><title>' + Hasher.getTitle() + '</title><script type="text/javascript">var frameHash="' + hashValue + '";</script></head><body>&nbsp;</body></html>'); //stores current hash inside iframe.
			frameDoc.close();
		}
	}
	
	/**
	 * Stores new hash value and dispatch `HasherEvent.CHANGE` if Hasher is "active".
	 * @param {string} newHash	New Hash Value.
	 * @private
	 */
	function _registerChange(newHash){
		newHash = decodeURIComponent(newHash); //fix IE8 while offline
		if(_hash != newHash){
			var oldHash = _hash;
			_hash = newHash; //should come before event dispatch to make sure user can get proper value inside event handler
			if(_isLegacyIE){
				_updateFrame(newHash);
			}
			Hasher.dispatchEvent(new HasherEvent(HasherEvent.CHANGE, _trimHash(oldHash), _trimHash(newHash)));
		}
	}
	
	/**
	 * Creates iframe used to record history state on IE <= 7. [HACK]
	 * @private
	 */
	function _createFrame(){
		_frame = document.createElement('iframe');
		_frame.src = 'about:blank';
		_frame.style.display = 'none';
		document.body.appendChild(_frame);
	}
	
	/**
	 * Get hash value from current URL
	 * @return {string}	Hash value without '#'.
	 * @private
	 */
	function _getWindowHash(){
		//parsed full URL instead of getting location.hash because Firefox decode hash value (and all the other browsers don't)
		//also because of IE8 bug with hash query in local file [issue #6]
		var result = /#(.*)$/.exec( Hasher.getURL() );
		return (result && result[1])? decodeURIComponent(result[1]) : '';
	}
	
	/**
	 * Checks if hash/history state has changed and dispatch HasherEvent.
	 * @private
	 */
	function _checkHistory(){
		var curHash = _getWindowHash();
		if(curHash != _hash){
			_registerChange(curHash);
		}
	}
	
	/**
	 * Check if browser history state has changed on IE <= 7. [HACK]
	 * - used since IE 6,7 doesn't generates new history record on hashchange.
	 * @private
	 */
	function _checkHistoryLegacyIE(){
		var windowHash = _getWindowHash(),
			frameHash = _getFrameHash();
		if(frameHash != _hash && frameHash != windowHash){ //detect changes made pressing browser history buttons. Workaround since history.back() and history.forward() doesn't update hash value on IE6/7 but updates content of the iframe.
			Hasher.setHash(frameHash);
		}else if(windowHash != _hash){ //detect if hash changed (manually or using setHash)
			_registerChange(windowHash);
		}
	}
	
	
	//== Public (API) ==//
	
	/**
	 * Hasher
	 * @namespace History Manager for rich-media applications.
	 * @extends millermedeiros.EventDispatcher
	 */
	this.Hasher = Hasher; //register Hasher to the global scope
	
	/**
	 * Hasher Version Number
	 * @type string
	 * @const
	 */
	Hasher.VERSION = '0.9.7';
	
	/**
	 * String that should always be added to the end of Hash value.
	 * <ul>
	 * <li>default value: '/';</li>
	 * <li>will be automatically removed from `Hasher.getHash()`</li>
	 * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
	 * </ul>
	 * @type string
	 */
	Hasher.appendHash = '/';
	
	/**
	 * String that should always be added to the beginning of Hash value.
	 * <ul>
	 * <li>default value: '/';</li>
	 * <li>will be automatically removed from `Hasher.getHash()`</li>
	 * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
	 * </ul>
	 * @type string
	 */
	Hasher.prependHash = '/';
	
	/**
	 * String used to split hash paths; used by `Hasher.getHashAsArray()` to split paths.
	 * <ul>
	 * <li>default value: '/';</li>
	 * </ul>
	 * @type string
	 */
	Hasher.separator = '/';
	
	/**
	 * Start listening/dispatching changes in the hash/history.
	 */
	Hasher.init = function(){
		if(_isActive){
			return;
		}
		
		var oldHash = _hash;
		_hash = _getWindowHash();
		
		//thought about branching/overloading Hasher.init() to avoid checking multiple times but don't think worth doing it since it probably won't be called multiple times. [?] 
		if(_isHashChangeSupported){
			_eventFacade.addListener(window, 'hashchange', _checkHistory);
		}else { 
			if(_isLegacyIE){
				if(!_frame){
					_createFrame();
					_updateFrame(_hash);
				}
				_checkInterval = setInterval(_checkHistoryLegacyIE, 25);
			}else{
				_checkInterval = setInterval(_checkHistory, 25);
			}
		}
		
		_isActive = true;
		this.dispatchEvent(new HasherEvent(HasherEvent.INIT, oldHash, _hash));
	};
	
	/**
	 * Stop listening/dispatching changes in the hash/history.
	 */
	Hasher.stop = function(){
		if(!_isActive){
			return;
		}
		
		if(_isHashChangeSupported){
			_eventFacade.removeListener(window, 'hashchange', _checkHistory);
		}else{
			clearInterval(_checkInterval);
			_checkInterval = null;
		}
		
		_isActive = false;
		this.dispatchEvent(new HasherEvent(HasherEvent.STOP, _hash, _hash)); //since it didn't changed oldHash and newHash should be the same. [?]
	};
	
	/**
	 * Retrieve full URL.
	 * @return {string}	Full URL.
	 */
	Hasher.getURL = function(){
		return location.href;
	};
	
	/**
	 * Retrieve URL without query string and hash.
	 * @return {string}	Base URL.
	 */
	Hasher.getBaseURL = function(){
		return this.getURL().replace(/(\?.*)|(\#.*)/, ''); //removes everything after '?' and/or '#'
	};
	
	/**
	 * Set Hash value.
	 * @param {string} value	Hash value without '#'.
	 */
	Hasher.setHash = function(value){
		value = (value)? this.prependHash + value.replace(/^\#/, '') + this.appendHash : value; //removes '#' from the beginning of string and append/prepend default values.
		if(value != _hash){
			_registerChange(value); //avoid breaking the application if for some reason `location.hash` don't change
			if(_isIE && _isLocal){
				value = value.replace(/\?/, '%3F'); //fix IE8 local file bug [issue #6]
			}
			location.hash = '#'+ encodeURI(value); //used encodeURI instead of encodeURIComponent to preserve '?', '/', '#'. Fixes Safari bug [issue #8]
		}
	};
	
	/**
	 * Return hash value as String.
	 * @return {string}	Hash value without '#'.
	 */
	Hasher.getHash = function(){
		//didn't used actual value of the `location.hash` to avoid breaking the application in case `location.hash` isn't available and also because value should always be synched.
		return _trimHash(_hash);
	};
	
	/**
	 * Return hash value as Array.	
	 * @return {Array.<string>}	Hash splitted into an Array.  
	 */
	Hasher.getHashAsArray = function(){
		return this.getHash().split(this.separator);
	};
	
	/**
	 * Get Query portion of the Hash as a String
	 * - alias to: `millermedeiros.queryUtils.getQueryString( Hasher.getHash() ).substr(1);`
	 * @return {string}	Hash Query without '?'
	 */
	Hasher.getHashQuery = function(){
		return _queryUtils.getQueryString( this.getHash() ).substr(1);
	};
	
	/**
	 * Get Query portion of the Hash as an Object
	 * - alias to: `millermedeiros.queryUtils.toQueryObject( Hasher.getHashQueryString() );`
	 * @return {Object} Hash Query
	 */
	Hasher.getHashQueryAsObject = function(){
		return _queryUtils.toQueryObject( this.getHashQuery() );
	};
	
	/**
	 * Get parameter value from the query portion of the Hash
	 * - alias to: `millermedeiros.queryUtils.getParamValue(paramName, Hasher.getHash() );`
	 * @param {string} paramName	Parameter Name.
	 * @return {string}	Parameter value.
	 */
	Hasher.getHashQueryParam = function(paramName){
		return _queryUtils.getParamValue(paramName, this.getHash() );
	};
	
	/**
	 * Set page title
	 * @param {string} value	Page Title
	 */
	Hasher.setTitle = function(value){
		document.title = value;
	};
	
	/**
	 * Get page title
	 * @return {string} Page Title
	 */
	Hasher.getTitle = function(){
		return document.title;
	};
	
	/**
	 * Navigate to previous page in history
	 */
	Hasher.back = function(){
		history.back();
	};
	
	/**
	 * Navigate to next page in history
	 */
	Hasher.forward = function(){
		history.forward();
	};
	
	/**
	 * Loads a page from the session history, identified by its relative location to the current page.
	 * - for example `-1` loads previous page, `1` loads next page.
	 * @param {int} delta	Relative location to the current page.
	 */
	Hasher.go = function(delta){
		history.go(delta);
	};
	
	/**
	 * Removes all event listeners, stops Hasher and destroy Hasher object.
	 * - IMPORTANT: Hasher won't work after calling this method, Hasher Object will be deleted.
	 */
	Hasher.dispose = function(){
		Hasher.removeAllEventListeners(true);
		Hasher.stop();
		_hash = _checkInterval = _isActive = _frame = UA  = _isIE = _isLegacyIE = _isHashChangeSupported = _isLocal = _queryUtils = _eventFacade = Hasher = window.Hasher = null;
		//can't use `delete window.hasher;` because on IE it throws errors, `window` isn't actually an object, delete can only be used on Object properties.
	};
	
	/**
	 * Returns string representation of the Hasher object.
	 * @return {string} A string representation of the object.
	 */
	Hasher.toString = function(){
		return '[Hasher version="'+ this.VERSION +'" hash="'+ this.getHash() +'"]';
	};
	
}(window, document, window.location, history));
