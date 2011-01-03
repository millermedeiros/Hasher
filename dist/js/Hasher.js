/*!!
 * Miller Medeiros JS Library
 * @author Miller Medeiros
 * @version 0.1.1 (2010/11/01)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(window, document){
/**
 * @namespace Miller Medeiros Namespace
 * @name millermedeiros
 */
var millermedeiros = window.millermedeiros = {};
(function(window, millermedeiros){
	
	var location = window.location; //local storage for better minification

	/**
	 * @namespace Utilities for query string manipulation.
	 * @author Miller Medeiros <http://www.millermedeiros.com/>
	 * @version 0.8.3 (2010/11/01)
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

}(window, millermedeiros));
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
}(window, window.document));
/*!!
 * JS Signals <https://github.com/millermedeiros/js-signals>
 * Released under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 * @author Miller Medeiros <http://millermedeiros.com>
 * @version 0.5
 * @build 100 12/03/2010 05:27 PM
 */
(function(){
	
	/**
	 * @namespace Signals Namespace - Custom event/messaging system based on AS3 Signals
	 * @name signals
	 */
	var signals = window.signals = {};
	
	/**
	 * Signals Version Number
	 * @type string
	 * @const
	 */
	signals.VERSION = '0.5';
	
	/**
	 * @param {*} param	Parameter to check.
	 * @return {boolean} `true` if parameter is different than `undefined`.
	 */
	signals.isDef = function(param){
		return typeof param !== 'undefined';
	};

	/**
	 * Signal - custom event broadcaster
	 * <br />- inspired by Robert Penner's AS3 Signals.
	 * @author Miller Medeiros
	 * @constructor
	 */
	signals.Signal = function(){
		/**
		 * @type Array.<signals.SignalBinding>
		 * @private
		 */
		this._bindings = [];
	};
	
	
	signals.Signal.prototype = {
		
		/**
		 * @type boolean
		 * @private
		 */
		_shouldPropagate : true,
		
		/**
		 * @type boolean
		 * @private
		 */
		_isEnabled : true,
		
		/**
		 * @param {Function} listener
		 * @param {boolean} isOnce
		 * @param {Object} [scope]
		 * @return {signals.SignalBinding}
		 * @private
		 */
		_registerListener : function(listener, isOnce, scope){
			
			if(!signals.isDef(listener)) throw new Error('listener is a required param of add() and addOnce().');
			
			var prevIndex = this._indexOfListener(listener),
				binding;
			
			if(prevIndex !== -1){ //avoid creating a new Binding for same listener if already added to list
				binding = this._bindings[prevIndex];
				if(binding.isOnce() !== isOnce){
					throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
				}
			} else {
				binding = new signals.SignalBinding(listener, isOnce, scope, this);
				this._addBinding(binding);
			}
			
			return binding;
		},
		
		/**
		 * @param {signals.SignalBinding} binding
		 * @private
		 */
		_addBinding : function(binding){
			this._bindings.push(binding);
		},
		
		/**
		 * @param {Function} listener
		 * @return {int}
		 * @private
		 */
		_indexOfListener : function(listener){
			var n = this._bindings.length;
			while(n--){
				if(this._bindings[n]._listener === listener) return n;
			}
			return -1;
		},
		
		/**
		 * Add a listener to the signal.
		 * @param {Function} listener	Signal handler function.
		 * @param {Object} [scope]	Context on which listener will be executed (object that should represent the `this` variable inside listener function).
		 * @return {signals.SignalBinding} An Object representing the binding between the Signal and listener.
		 */
		add : function(listener, scope){
			return this._registerListener(listener, false, scope);
		},
		
		/**
		 * Add listener to the signal that should be removed after first execution (will be executed only once).
		 * @param {Function} listener	Signal handler function.
		 * @param {Object} [scope]	Context on which listener will be executed (object that should represent the `this` variable inside listener function).
		 * @return {signals.SignalBinding} An Object representing the binding between the Signal and listener.
		 */
		addOnce : function(listener, scope){
			return this._registerListener(listener, true, scope);
		},
		
		/**
		 * @private
		 */
		_removeByIndex : function(i){
			this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
			this._bindings.splice(i, 1);
		},
		
		/**
		 * Remove a single listener from the dispatch queue.
		 * @param {Function} listener	Handler function that should be removed.
		 * @return {Function} Listener handler function.
		 */
		remove : function(listener){
			if(!signals.isDef(listener)) throw new Error('listener is a required param of remove().');
			
			var i = this._indexOfListener(listener);
			if(i !== -1) this._removeByIndex(i);
			return listener;
		},
		
		/**
		 * Remove all listeners from the Signal.
		 */
		removeAll : function(){
			var n = this._bindings.length;
			while(n--){
				this._removeByIndex(n);
			}
		},
		
		/**
		 * @return {uint} Number of listeners attached to the Signal.
		 */
		getNumListeners : function(){
			return this._bindings.length;
		},
		
		/**
		 * Disable Signal, will block dispatch to listeners until `enable()` is called.
		 * @see signals.Signal.prototype.enable
		 */
		disable : function(){
			this._isEnabled = false;
		},
		
		/**
		 * Enable broadcast to listeners.
		 * @see signals.Signal.prototype.disable
		 */
		enable : function(){
			this._isEnabled = true;
		}, 
		
		/**
		 * @return {boolean} If Signal is currently enabled and will broadcast message to listeners.
		 */
		isEnabled : function(){
			return this._isEnabled;
		},
		
		/**
		 * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
		 * - should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast. 
		 */
		halt : function(){
			this._shouldPropagate = false;
		},
		
		/**
		 * Dispatch/Broadcast Signal to all listeners added to the queue. 
		 * @param {...*} [params]	Parameters that should be passed to each handler.
		 */
		dispatch : function(params){
			if(! this._isEnabled) return;
			
			var paramsArr = Array.prototype.slice.call(arguments),
				bindings = this._bindings.slice(), //clone array in case add/remove items during dispatch
				i = 0,
				cur;
			
			this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.
						
			while(cur = bindings[i++]){
				if(cur.execute(paramsArr) === false || !this._shouldPropagate) break; //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
			}
		},
		
		/**
		 * Remove binding from signal and destroy any reference to external Objects (destroy Signal object).
		 * <br /> - calling methods on the signal instance after calling dispose will throw errors.
		 */
		dispose : function(){
			this.removeAll();
			delete this._bindings;
		},
		
		/**
		 * @return {string} String representation of the object.
		 */
		toString : function(){
			return '[Signal isEnabled: '+ this._isEnabled +' numListeners: '+ this.getNumListeners() +']';
		}
		
	};
	
	/**
	 * Object that represents a binding between a Signal and a listener function.
	 * <br />- <strong>Constructor shouldn't be called by regular user, used internally.</strong>
	 * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
	 * @author Miller Medeiros
	 * @constructor
	 * @param {Function} listener	Handler function bound to the signal.
	 * @param {boolean} isOnce	If binding should be executed just once.
	 * @param {?Object} listenerContext	Context on which listener will be executed (object that should represent the `this` variable inside listener function).
	 * @param {signals.Signal} signal	Reference to Signal object that listener is currently bound to.
	 */
	signals.SignalBinding = function(listener, isOnce, listenerContext, signal){
		
		/**
		 * Handler function bound to the signal.
		 * @type Function
		 * @private
		 */
		this._listener = listener;
		
		/**
		 * If binding should be executed just once.
		 * @type boolean
		 * @private
		 */
		this._isOnce = isOnce;
		
		/**
		 * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
		 * @type Object
		 */
		this.context = listenerContext;
		
		/**
		 * Reference to Signal object that listener is currently bound to.
		 * @type signals.Signal
		 * @private
		 */
		this._signal = signal;
	};
	
	
	signals.SignalBinding.prototype = {
		
		/**
		 * @type boolean
		 * @private
		 */
		_isEnabled : true,
		
		/**
		 * Call listener passing arbitrary parameters.
		 * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p> 
		 * @param {Array} [paramsArr]	Array of parameters that should be passed to the listener
		 * @return {*} Value returned by the listener.
		 */
		execute : function(paramsArr){
			var r;
			if(this._isEnabled){
				r = this._listener.apply(this.context, paramsArr);
				if(this._isOnce) this.detach();
			}
			return r; //avoid warnings on some editors
		},
		
		/**
		 * Detach binding from signal.
		 * - alias to: mySignal.remove(myBinding.getListener());
		 * @return {Function} Handler function bound to the signal.
		 */
		detach : function(){
			return this._signal.remove(this._listener);
		},
		
		/**
		 * @return {Function} Handler function bound to the signal.
		 */
		getListener : function(){
			return this._listener;
		},
		
		/**
		 * Remove binding from signal and destroy any reference to external Objects (destroy SignalBinding object).
		 * <br /> - calling methods on the binding instance after calling dispose will throw errors.
		 */
		dispose : function(){
			this.detach();
			this._destroy();
		},
		
		/**
		 * Delete all instance properties
		 * @private
		 */
		_destroy : function(){
			delete this._signal;
			delete this._isOnce;
			delete this._listener;
			delete this.context;
		},
		
		/**
		 * Disable SignalBinding, block listener execution. Listener will only be executed after calling `enable()`.  
		 * @see signals.SignalBinding.enable()
		 */
		disable : function(){
			this._isEnabled = false;
		},
		
		/**
		 * Enable SignalBinding. Enable listener execution.
		 * @see signals.SignalBinding.disable()
		 */
		enable : function(){
			this._isEnabled = true;
		},
		
		/**
		 * @return {boolean} If SignalBinding is currently paused and won't execute listener during dispatch.
		 */
		isEnabled : function(){
			return this._isEnabled;
		},
		
		/**
		 * @return {boolean} If SignalBinding will only be executed once.
		 */
		isOnce : function(){
			return this._isOnce;
		},
		
		/**
		 * @return {string} String representation of the object.
		 */
		toString : function(){
			return '[SignalBinding isOnce: '+ this._isOnce +', isEnabled: '+ this._isEnabled +']';
		}
		
	};
}());
/*!!
 * Hasher <http://github.com/millermedeiros/Hasher>
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.9.9 (2011/01/02 11:08 PM)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(window, document){
	
	//--------------------------------------------------------------------------------------
	// Private Vars
	//--------------------------------------------------------------------------------------
	
	var 
		
		//--- local storage for brevity, performance improvement and better compression ---//
		
		/** @private {Location} */
		location = window.location,
		
		/** @private {History} */
		history = window.history,
		
		/** @private {HasherEvent} */
		HasherEvent = window.HasherEvent,
		
		/** @private {millermedeiros} */
		millermedeiros = window.millermedeiros,
		
		/** @private */
		Hasher = {},
		
		/** @private {millermedeiros.queryUtils} Utilities for query string manipulation */
		_queryUtils = millermedeiros.queryUtils,
		
		/** @private {millermedeiros.event} Browser native events facade */
		_eventFacade = millermedeiros.event,
		
		/** @private {signals.Signal} */
		Signal = signals.Signal,
		
		//--- local vars ---//
		
		/** @private {string} previous/current hash value */
		_hash, 
		
		/** @private {number} stores setInterval reference (used to check if hash changed on non-standard browsers) */
		_checkInterval,
		
		/** @private {boolean} If Hasher is active and should listen to changes on the window location hash */
		_isActive,
		
		/** @private {Element} iframe used for IE <= 7 */
		_frame,
		
		
		//--- sniffing/feature detection ---//
		
		/** @private {string} User Agent */
		_UA = navigator.userAgent,
		
		/** @private {boolean} if is IE */
		_isIE = /MSIE/.test(_UA) && (!window.opera),
		
		/** @private {boolean} If browser supports the `hashchange` event - FF3.6+, IE8+, Chrome 5+, Safari 5+ */
		_isHashChangeSupported = ('onhashchange' in window),
		
		/** @private {boolean} if is IE <= 7 */
		_isLegacyIE = _isIE && !_isHashChangeSupported, //check if is IE6-7 since hash change is only supported on IE8+ and changing hash value on IE6-7 doesn't generate history record.
		
		/** @private {boolean} If it is a local file */
		_isLocal = (location.protocol === 'file:');
	
	
	//--------------------------------------------------------------------------------------
	// Private Methods
	//--------------------------------------------------------------------------------------
	
	/**
	 * Remove `Hasher.prependHash` and `Hasher.appendHash` from hashValue
	 * @param {string} [hash]	Hash value
	 * @return {string}
	 * @private
	 */
	function _trimHash(hash){
		hash = hash || '';
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
	 * Stores new hash value and dispatch change event if Hasher is "active".
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
			Hasher.changed.dispatch(_trimHash(newHash), _trimHash(oldHash));
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
	 * Checks if hash/history state has changed
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
			frameHash = _trimHash(_getFrameHash());
		if(frameHash != _hash && frameHash != windowHash){ //detect changes made pressing browser history buttons. Workaround since history.back() and history.forward() doesn't update hash value on IE6/7 but updates content of the iframe.
			Hasher.setHash(frameHash);
		}else if(windowHash != _hash){ //detect if hash changed (manually or using setHash)
			_registerChange(windowHash);
		}
	}
	
	
	//--------------------------------------------------------------------------------------
	// Public (API)
	//--------------------------------------------------------------------------------------
	
	/**
	 * Hasher
	 * @namespace History Manager for rich-media applications.
	 * @name Hasher
	 */
	window.Hasher = Hasher; //register Hasher to the global scope
	
	/**
	 * Hasher Version Number
	 * @type string
	 * @constant
	 */
	Hasher.VERSION = '0.9.9';
	
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
	 * Signal dispatched when hash value changes
	 * @type signals.Signal
	 */
	Hasher.changed = new Signal();
	
	/**
   * Signal dispatched when hasher is stopped
   * @type signals.Signal
   */
  Hasher.stopped = new Signal();
  
	/**
   * Signal dispatched when hasher is initialized
   * @type signals.Signal
   */
  Hasher.initialized = new Signal();

	/**
	 * Start listening/dispatching changes in the hash/history.
	 * - Hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons before calling this method.
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
		this.initialized.dispatch(_trimHash(_hash), _trimHash(oldHash));
	};
	
	/**
	 * Stop listening/dispatching changes in the hash/history.
	 * - Hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons after calling this method, unless you call Hasher.init() again.
	 * - Hasher will still dispatch changes made programatically by calling Hasher.setHash();
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
		this.stopped.dispatch(_trimHash(_hash), _trimHash(_hash)); //since it didn't changed oldHash and newHash should be the same. [?]
	};
	
	/**
	 * Retrieve if Hasher is listening to changes on the browser history and/or hash value.
	 * @return {boolean}	If Hasher is listening to changes on the browser history and/or hash value.
	 */
	Hasher.isActive = function(){
		return _isActive;
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
	 * Replaces spaces with hyphens, split camel case text, remove non-word chars and remove accents.
	 * - based on Miller Medeiros JS Library -> millermedeiros.stringUtils.hyphenate
	 * @example Hasher.hyphenate('Lorem Ipsum  ?#$%^&*  sp����lCh�rs') -> 'Lorem-Ipsum-special-chars'
	 * @param {string} str	String to be formated.
	 * @return {string}	Formated String
	 */
	Hasher.hyphenate = function(str){
		str = str || '';
		str = str
				.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '') //remove non-word chars
				.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') //add space between camelCase text
				.replace(/ +/g, '-'); //replace spaces with hyphen
		return this.removeAccents(str);
	};
	
	/**
	 * Replaces all accented chars with regular ones
	 * - copied from Miller Medeiros JS Library -> millermedeiros.stringUtils.replaceAccents
	 * @example Hasher.removeAccents('Lorem Ipsum  ?#$%^&*  sp����lCh�rs') -> 'Lorem Ipsum  ?#$%^&*  specialChars'
	 * @param {string} str	String to be formated.
	 * @return {string}	Formated String
	 */
	Hasher.removeAccents = function(str){
		str = str || '';
		// verifies if the String has accents and replace accents
		if(str.search(/[\xC0-\xFF]/g) > -1){
			str = str
					.replace(/[\xC0-\xC5]/g, "A")
					.replace(/[\xC6]/g, "AE")
					.replace(/[\xC7]/g, "C")
					.replace(/[\xC8-\xCB]/g, "E")
					.replace(/[\xCC-\xCF]/g, "I")
					.replace(/[\xD0]/g, "D")
					.replace(/[\xD1]/g, "N")
					.replace(/[\xD2-\xD6\xD8]/g, "O")
					.replace(/[\xD9-\xDC]/g, "U")
					.replace(/[\xDD]/g, "Y")
					.replace(/[\xDE]/g, "P")
					.replace(/[\xDF]/g, "B")
					.replace(/[\xE0-\xE5]/g, "a")
					.replace(/[\xE6]/g, "ae")
					.replace(/[\xE7]/g, "c")
					.replace(/[\xE8-\xEB]/g, "e")
					.replace(/[\xEC-\xEF]/g, "i")
					.replace(/[\xF0]/g, "D")
					.replace(/[\xF1]/g, "n")
					.replace(/[\xF2-\xF6\xF8]/g, "o")
					.replace(/[\xF9-\xFC]/g, "u")
					.replace(/[\xFE]/g, "p")
					.replace(/[\xFD\xFF]/g, "y");
		}
		return str;
	};
	
	/**
	 * Removes all event listeners, stops Hasher and destroy Hasher object.
	 * - IMPORTANT: Hasher won't work after calling this method, Hasher Object will be deleted.
	 */
	Hasher.dispose = function(){
		Hasher.initialized.removeAll();
		Hasher.stopped.removeAll();
		Hasher.changed.removeAll();
		Hasher.stop();
		_hash = _checkInterval = _isActive = _frame = _UA  = _isIE = _isLegacyIE = _isHashChangeSupported = _isLocal = _queryUtils = _eventFacade = Hasher = window.Hasher = null;
		//can't use `delete window.hasher;` because on IE it throws errors, `window` isn't actually an object, delete can only be used on Object properties.
	};
	
	/**
	 * Returns string representation of the Hasher object.
	 * @return {string} A string representation of the object.
	 */
	Hasher.toString = function(){
		return '[Hasher version="'+ this.VERSION +'" hash="'+ this.getHash() +'"]';
	};
	
}(window, window.document));
