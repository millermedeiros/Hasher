/*!
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.6 (2010/05/09)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 *
 * Includes: MM.EventDispatcher (0.6), MM.queryUtils (0.3)
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
/*
 * MM.EventDispatcher
 * - Class used to allow Custom Objects to dispatch events.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.6 (2010/05/09)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace
 * @ignore
 */
this.MM = this.MM || {};

/**
 * EventDispatcher Object
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
 * @version 0.3 (2010/05/01)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace
 * @ignore
 */
this.MM = this.MM || {};

/**
 * Utilities for query string manipulation.
 * @namespace
 */
MM.queryUtils = {
	
	/**
	 * Gets full query as string with all special chars decoded.
	 * @return {String}	Query string without starting '?'.
	 */
	getQueryString : function(){
		return decodeURIComponent(location.search.substring(1));
	},
	
	/**
	 * Gets query as Object.
	 * @return {Object}	Object with all the query "params => values" pairs.
	 */
	getQueryObject : function(){
		var queryArr = this.getQueryString().split('&'), 
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
	 * @return {String}	Parameter value.
	 */
	getParamValue : function(param){
		return this.getQueryObject()[param];
	},
	
	/**
	 * Checks if query contains parameter.
	 * @param {String} param	Parameter name.
	 * @return {Boolean} If parameter exist.
	 */
	hasParam : function(param){
		return (this.getQueryString().indexOf(param+'=') >= 0);
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
			query.push(param +'='+ obj[param]);
		}
		return (query.length)? '?'+ query.join('&') : '';
	}
	
};
/*
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.4 (2010/04/25)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(){
	
	
	//== Private Vars ==//
	
	var	location = window.location,
		_oldHash, //{String} used to check if hash changed
		_checkInterval, //stores setInterval reference (used to check if hash changed)
		_frame, //iframe used for IE <= 7 
		_isLegacyIE = /msie (6|7)/.test(navigator.userAgent.toLowerCase()) && !+"\v1"; //feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html	
	
	
	//== Public API ==//
	
	/**
	 * Hasher
	 * @class
	 * @extends MM.EventDispatcher
	 * @borrows MM.queryUtils.getQueryString as getQueryString
	 * @borrows MM.queryUtils.getQueryObject as getQueryObject
	 * @borrows MM.queryUtils.getParamValue as getParamValue
	 * @borrows MM.queryUtils.hasParam as hasParam
	 * @borrows MM.queryUtils.toQueryString as toQueryString
	 */
	this.Hasher = new MM.EventDispatcher();
	
	/**
	 * Start listening/dispatching changes in the hash/history.
	 */
	Hasher.init = function(){
		var newHash = Hasher.getHash();
		//TODO: use 'window.onhashchange' listener if browser supports it.
		if(_isLegacyIE){ //IE6 & IE7 [HACK]
			if(!_frame){
				_createFrame();
				_updateFrame();
			}
			_checkInterval = setInterval(_checkHistoryLegacyIE, 25);
		}else{ //regular browsers
			_checkInterval = setInterval(_checkHash, 25);
		}
		this.dispatchEvent(new HasherEvent(HasherEvent.INIT, _oldHash, newHash));
		_oldHash = newHash; //avoid dispatching CHANGE event just after INIT event (since it didn't changed).
	};
	
	/**
	 * Stop listening/dispatching changes in the hash/history.
	 */
	Hasher.stop = function(){
		clearInterval(_checkInterval);
		_checkInterval = null;
		this.dispatchEvent(new HasherEvent(HasherEvent.STOP, _oldHash, _oldHash)); //since it didn't changed oldHash and newHash should be the same.
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
		return location.hash.substr(1);
	};
	
	/**
	 * Return hash value as Array.
	 * @param {String} [separator]	String used to divide hash (default = '/').	
	 * @return {Array}	Hash splitted into an Array.  
	 */
	Hasher.getHashAsArray = function(separator){
		separator = separator || '/';
		return Hasher.getHash().split(separator);
	};
	
	/**
	 * Set a new location or hash value without generating a history record for the current page. (user won't be able to return to current page)
	 * @param {String} value	New location (eg: '#newhash', 'newfile.html', 'http://example.com/')
	 */
	Hasher.replaceLocation = function(value){
		location.replace(value);
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
		return location.href.replace(/(\?.*)|(\#.+)/, '');
	};
	
	/**
	 * Host name of the URL.
	 * @return {String}	The Host Name.
	 */
	Hasher.getHostName = function(){
		return location.hostname;
	};
	
	/**
	 * Retrieves Path relative to HostName
	 * @return {String} Folder path relative to domain
	 */
	Hasher.getPathName = function(){
		return location.pathname;
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
	
	/**
	 * Retrieves number of items in the History list.
	 * @return {int} History list length. 
	 */
	Hasher.getHistoryLength = function(){
		return history.length;
	};
	
	//-- Query string helpers 
	
	Hasher.getQueryString = MM.queryUtils.getQueryString;
	
	Hasher.getQueryObject = MM.queryUtils.getQueryObject;
	
	Hasher.getParamValue = MM.queryUtils.getParamValue;
	
	Hasher.hasParam = MM.queryUtils.hasParam;
	
	Hasher.toQueryString = MM.queryUtils.toQueryString;
	
	
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
	 * Function that checks if hash has changed.
	 * - used since most browsers don't dispatch the `onhashchange` event.
	 * @private
	 */
	function _checkHash(){
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
			Hasher.setTitle(_frame.contentWindow.document.title);
			Hasher.setHash(frameHash);
			_dispatchChange(frameHash);
		}else if(windowHash != _oldHash){ //detect if hash changed (manually or using setHash)
			if(frameHash != windowHash){
				_updateFrame();
			}
			_dispatchChange(windowHash);
		}
	}
	
	/**
	 * Creates iframe used to record history state on IE <= 7. [HACK]
	 * @private
	 */
	function _createFrame(){
		_frame = document.createElement('iframe');
		_frame.src = 'javascript:false';
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
		frameDoc.write('<html><head><title>'+ Hasher.getTitle() +'</title><script type="text/javascript">var frameHash="'+ Hasher.getHash() +'";</script></head><body>&nbsp;</body></html>'); //stores current title and current hash inside iframe.
		frameDoc.close();
	}
	
})();
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
