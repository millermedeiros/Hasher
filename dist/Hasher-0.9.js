/*!
 * Hasher
 * - History Manager for rich-media applications.
 * Includes: MM.EventDispatcher (0.7.2), MM.queryUtils (0.7), MM.event-listenerFacade (0.3)
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.9 (2010/06/28)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
/*
 * MM.EventDispatcher
 * - Class used to allow Custom Objects to dispatch events.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.7.2 (2010/06/21)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace Miller Medeiros namespace
 */
var MM = MM || {};

/**
 * EventDispatcher Object, used to allow Custom Objects to dispatch events.
 * @constructor
 */
MM.EventDispatcher = function(){
	this._handlers = {};
};

MM.EventDispatcher.prototype = {
	
	/**
	 * Add Event Listener
	 * @param {String} eType	Event Type.
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
	 * @param {String} eType	Event Type.
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
	 */
	removeAllEventListeners : function(){
		this._handlers = {};
	},
	
	/**
	 * Checks if the EventDispatcher has any listeners registered for a specific type of event. 
	 * @param {String} eType	Event Type.
	 * @return {Boolean}
	 */
	hasEventListener : function(eType){
		return (typeof this._handlers[eType] != 'undefined');
	},

	/**
	 * Dispatch Event
	 * - Call all Handlers Listening to the Event.
	 * @param {Event|String} e	Custom Event Object (property `type` is required) or String with Event type.
	 */
	dispatchEvent : function(e){
		e = (typeof e == 'string')? {type: e} : e; //create Object if not an Object to always call handlers with same type of argument.
		if(this.hasEventListener(e.type)){
			var typeHandlers = this._handlers[e.type], //stored for performance
				curHandler,
				i,
				n = typeHandlers.length;
			e.target = e.target || this; //ensure Event.target exists (default to Object that extends EventDispatcher)
			for(i=0; i<n; i++){
				curHandler = typeHandlers[i];
				curHandler(e);
			}	
		}
	}
	
};
/*
 * MM.queryUtils
 * - utilities for query string manipulation
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.7 (2010/06/22)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace Miller Medeiros namespace
 */
var MM = MM || {};

/**
 * @namespace Utilities for query string manipulation.
 */
MM.queryUtils = {
	
	/**
	 * Gets full query as string with all special chars decoded.
	 * @param {String} [url]	 URL to be parsed, defaults to `location.href`
	 * @return {String}	Query string
	 */
	getQueryString : function(url){
		url = url || location.href; //used location.href to avoid bug on IE6 and pseudo query string inside location.hash
		url = url.replace(/#[\w\W]*/, ''); //removes hash (to avoid getting hash query)
		var queryString = /\?[a-zA-Z0-9\=\&\%\$\-\_\.\+\!\*\'\(\)\,]+/.exec(url); //valid chars according to: http://www.ietf.org/rfc/rfc1738.txt
		return (queryString)? decodeURIComponent(queryString[0]) : '';
	},
	
	/**
	 * Gets query as Object.
	 * - Alias for `MM.queryUtils.toQueryObject( MM.queryUtils.getQueryString(url) )`
	 * @param {String} [url]	URL to be parsed, default to location.href.
	 * @return {Object}	Object with all the query "params => values" pairs.
	 */
	getQueryObject : function(url){
		return this.toQueryObject(this.getQueryString(url));
	},
	
	/**
	 * Convert Query String into an Object
	 * @param {String} queryString	 Query String to be parsed
	 * @return {Object}	Object with all the query "params => values" pairs.
	 */
	toQueryObject : function(queryString){
		var queryArr = queryString.replace('?', '').split('&'), 
			n = queryArr.length,
			queryObj = {};
		while (n--) {
			queryArr[n] = queryArr[n].split('=');
			queryObj[queryArr[n][0]] = queryArr[n][1];
		}
		return queryObj;
	},
	
	/**
	 * Get query parameter value.
	 * @param {String} param	Parameter name.
	 * @param {String} [url]	URL to be parsed, default to location.href
	 * @return {String}	Parameter value.
	 */
	getParamValue : function(param, url){
		return this.getQueryObject(url)[param];
	},
	
	/**
	 * Checks if query contains parameter.
	 * @param {String} param	Parameter name.
	 * @param {String} [url]	URL to be parsed, default to location.href
	 * @return {Boolean} If parameter exist.
	 */
	hasParam : function(param, url){
		var regexp = new RegExp('(\\?|&)'+ param +'=', 'g'); //matches `?param=` or `&param=`
		return regexp.test(this.getQueryString(url));
	},
	
	/**
	 * Converts object into query string.
	 * @param {Object} obj	Object with "params => values" pairs.
	 * @return {String}	Formated query string starting with '?'.
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
 * MM.event - DOM Event Listener Facade
 * - Cross-browser DOM Event Listener attachment/detachment.
 * - Based on Peter-Paul Koch addEventSimple <http://www.quirksmode.org/js/eventSimple.html>
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.3 (2010/06/23)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace Miller Medeiros Namespace
 */
var MM = MM || {};

/**
 * @namespace Utilities for Browser Native Events
 */
MM.event = MM.event || {};

/**
* Adds DOM Event Listener
* @param {Element} elm Element.
* @param {String} eType Event type.
* @param {Function} fn Listener function.
*/
MM.event.addListener = function(elm, eType, fn){
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
* @param {String} eType Event type.
* @param {Function} fn Listener function.
*/
MM.event.removeListener = function(elm, eType, fn){
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
 * @param {String} eType	Hasher Event type.
 * @param {String} oldHash	Previous Hash.
 * @param {String} newHash	Current Hash.
 * @constructor
 */
var HasherEvent = function(eType, oldHash, newHash){
	/**
	 * Event Type
	 * @type String
	 */
	this.type = eType;
	/**
	 * Previous Hash value
	 * @type String
	 */
	this.oldHash = oldHash;
	/**
	 * Current Hash value
	 * @type String
	 */
	this.newHash = newHash;
};

/**
 * Returns string representation of the HasherEvent
 * @return {String} A string representation of the object.
 */
HasherEvent.prototype.toString = function(){
	return '[HasherEvent type="'+ this.type +'" oldHash="'+ this.oldHash +'" newHash="'+ this.newHash +'"]';
};

//-- Constants --//

/**
 * Defines the value of the type property of an change event object.
 * @type String
 * @constant
 */
HasherEvent.CHANGE = 'change';

 /**
 * Defines the value of the type property of an init event object.
 * @type String
 * @constant
 */
HasherEvent.INIT = 'init';

/**
 * Defines the value of the type property of an stop event object.
 * @type String
 * @constant
 */
HasherEvent.STOP = 'stop';
/*
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.9 (2010/06/28)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(window, document, undef){
	
	
	//== Private Vars ==//
	
	var	Hasher = new MM.EventDispatcher(), //local storage, inherits MM.EventDispatcher
		_oldHash, //{String} used to check if hash changed
		_checkInterval, //stores setInterval reference (used to check if hash changed on non-standard browsers)
		_frame, //iframe used for IE <= 7
		_isLegacyIE = /msie (6|7)/.test(navigator.userAgent.toLowerCase()) && (!+"\v1"), //feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
		_isHashChangeSupported = ('onhashchange' in window); //{Boolean} If browser supports the `hashchange` event - FF3.6+, IE8+, Chrome 5+, Safari 5+
	
	
	//== Private methods ==//
	
	/**
	 * Dispatch `HasherEvent.CHANGE` and stores hash value.
	 * @param {String} newHash	New Hash Value.
	 * @private
	 */
	function _dispatchChange(newHash){
		Hasher.dispatchEvent(new HasherEvent(HasherEvent.CHANGE, _oldHash, newHash));
		_oldHash = newHash;
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
	 * Update iframe content, generating a history record and saving current hash/title on IE <= 7. [HACK]
	 * - based on Really Simple History, SWFAddress and YUI.history solutions.
	 * @private
	 */
	function _updateFrame(){
		var frameDoc = _frame.contentWindow.document;
		frameDoc.open();
		frameDoc.write('<html><head><title>'+ Hasher.getTitle() +'</title><script type="text/javascript">var frameHash="'+ Hasher.getHash() +'";</script></head><body>&nbsp;</body></html>'); //stores current hash inside iframe.
		frameDoc.close();
	}
	
	/**
	 * Checks if hash/history state has changed and dispatch HasherEvent.
	 * @private
	 */
	function _checkHistory(){
		var curHash = Hasher.getHash();
		if(curHash != _oldHash){
			_dispatchChange(curHash);
		}
	}
	
	/**
	 * Check if browser history state has changed on IE <= 7. [HACK]
	 * - used since IE 6,7 doesn't generates new history record on hashchange.
	 * @private
	 */
	function _checkHistoryLegacyIE(){
		var windowHash = Hasher.getHash(),
			frameHash = _frame.contentWindow.frameHash;
		if(frameHash != windowHash && frameHash != _oldHash){ //detect changes made pressing browser history buttons. Workaround since history.back() and history.forward() doesn't update hash value on IE6/7 but updates content of the iframe.
			Hasher.setHash(frameHash);
			_dispatchChange(frameHash);
		}else if(windowHash != _oldHash){ //detect if hash changed (manually or using setHash)
			if(frameHash != windowHash){
				_updateFrame();
			}
			_dispatchChange(windowHash);
		}
	}
	
	
	//== Public API ==//
	
	/**
	 * Hasher
	 * @namespace History Manager for rich-media applications.
	 * @extends MM.EventDispatcher
	 */
	this.Hasher = Hasher; //register Hasher to the global scope
	
	/**
	 * Start listening/dispatching changes in the hash/history.
	 */
	Hasher.init = function(){
		var newHash = this.getHash();
		if(_isHashChangeSupported){
			MM.event.removeListener(window, 'hashchange', _checkHistory); //always a good idea to remove listener before attaching!
			MM.event.addListener(window, 'hashchange', _checkHistory);
		}else {
			clearInterval(_checkInterval); //always clear the interval before setting a new one! 
			if(_isLegacyIE){
				if(!_frame){
					_createFrame();
					_updateFrame();
				}
				_checkInterval = setInterval(_checkHistoryLegacyIE, 25);
			}else{
				_checkInterval = setInterval(_checkHistory, 25);
			}
		}
		this.dispatchEvent(new HasherEvent(HasherEvent.INIT, _oldHash, newHash));
		_oldHash = newHash; //avoid dispatching CHANGE event just after INIT event (since it didn't changed).
	};
	
	/**
	 * Stop listening/dispatching changes in the hash/history.
	 */
	Hasher.stop = function(){
		if(_isHashChangeSupported){
			MM.event.removeListener(window, 'hashchange', _checkHistory);
		}else{
			clearInterval(_checkInterval);
			_checkInterval = null;
		}
		this.dispatchEvent(new HasherEvent(HasherEvent.STOP, _oldHash, _oldHash)); //since it didn't changed oldHash and newHash should be the same.
	};
	
	/**
	 * Retrieve full URL.
	 * @return {String}	Full URL.
	 */
	Hasher.getURL = function(){
		return location.href;
	};
	
	/**
	 * Retrieve URL without query string and hash.
	 * @return {String}	Base URL.
	 */
	Hasher.getBaseURL = function(){
		return location.href.replace(/(\?.*)|(\#.*)/, '');
	};
	
	/**
	 * Set Hash value.
	 * @param {String} value	Hash value without '#'.
	 */
	Hasher.setHash = function(value){
		location.hash = value;
	};
	
	/**
	 * Return hash value as String.
	 * @return {String}	Hash value without '#'.
	 */
	Hasher.getHash = function(){
		//parsed full URL instead of getting location.hash because Firefox decode hash value (and all the other browsers don't)
		//also because IE8 has some issues while setting a hash value that contains "?" while offline (it also adds it before the hash but without setting the location.search)
		var result = /#(.*)$/.exec( this.getURL() );
		return (result && result[1])? decodeURIComponent( result[1] ) : ''; 
	};
	
	/**
	 * Return hash value as Array.
	 * @param {String} [separator]	String used to divide hash (default = '/').	
	 * @return {Array}	Hash splitted into an Array.  
	 */
	Hasher.getHashAsArray = function(separator){
		separator = separator || '/';
		var hash = this.getHash(),
			regexp = new RegExp('^\\'+ separator +'|\\'+ separator +'$', 'g'); //match string starting and/or ending with separator
		hash = hash.replace(regexp, '');
		return hash.split(separator);
	};
	
	/**
	 * Get Query portion of the Hash as a String
	 * - alias to: `MM.queryUtils.getQueryString( Hasher.getHash() );`
	 * @return {String}	Hash Query without '?'
	 */
	Hasher.getHashQuery = function(){
		return MM.queryUtils.getQueryString( this.getHash() ).substr(1);
	};
	
	/**
	 * Get Query portion of the Hash as an Object
	 * - alias to: `MM.queryUtils.toQueryObject( Hasher.getHashQueryString() );`
	 * @return {Object} Hash Query
	 */
	Hasher.getHashQueryAsObject = function(){
		return MM.queryUtils.toQueryObject( this.getHashQuery() );
	};
	
	/**
	 * Get parameter value from the query portion of the Hash
	 * - alias to: `MM.queryUtils.getParamValue(paramName, Hasher.getHash() );`
	 * @param {String} paramName	Parameter Name.
	 * @return {String}	Parameter value.
	 */
	Hasher.getHashQueryParam = function(paramName){
		return MM.queryUtils.getParamValue(paramName, this.getHash() );
	};
	
	/**
	 * Set page title
	 * @param {String} title	Page Title
	 */
	Hasher.setTitle = function(title){
		document.title = title;
	};
	
	/**
	 * Get page title
	 * @return {String} Page Title
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
	
}(window, document));
