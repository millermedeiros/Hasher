/*global signals:true, window:true*/

/*!!
 * Hasher <http://github.com/millermedeiros/hasher>
 * @author Miller Medeiros <http://millermedeiros.com>
 * @version 0.9.91 (2011/02/22 12:31 PM)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * Hasher
 * @namespace History Manager for rich-media applications.
 * @name hasher
 */
var hasher = (function(window, document){
	
	//--------------------------------------------------------------------------------------
	// Private Vars
	//--------------------------------------------------------------------------------------
	
	var 
		
		// local storage for brevity, performance improvement and better compression -------
		//==================================================================================
		
		/** @private */
		hasher,
		
		/** @private {Location} */
		location = window.location,
		
		/** @private {History} */
		history = window.history,
		
		/** @private {signals.Signal} */
		Signal = signals.Signal,
		
		
		// local vars ----------------------------------------------------------------------
		//==================================================================================
		
		/** @private {string} previous/current hash value */
		_hash, 
		
		/** @private {number} stores setInterval reference (used to check if hash changed on non-standard browsers) */
		_checkInterval,
		
		/** @private {boolean} If hasher is active and should listen to changes on the window location hash */
		_isActive,
		
		/** @private {Element} iframe used for IE <= 7 */
		_frame,
		
		
		// sniffing/feature detection -------------------------------------------------------
		//===================================================================================
		
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
	 * Remove `hasher.prependHash` and `hasher.appendHash` from hashValue
	 * @param {(string|null)} [hash]	Hash value
	 * @return {string}
	 * @private
	 */
	function _trimHash(hash){
		hash = hash || '';
		var regexp = new RegExp('^\\'+ hasher.prependHash +'|\\'+ hasher.appendHash +'$', 'g'); //match appendHash and prependHash
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
			frameDoc.write('<html><head><title>' + hasher.getTitle() + '</title><script type="text/javascript">var frameHash="' + hashValue + '";</script></head><body>&nbsp;</body></html>'); //stores current hash inside iframe.
			frameDoc.close();
		}
	}
	
	/**
	 * Stores new hash value and dispatch change event if hasher is "active".
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
			hasher.changed.dispatch(_trimHash(newHash), _trimHash(oldHash));
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
		var result = /#(.*)$/.exec( hasher.getURL() );
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
			hasher.setHash(frameHash);
		}else if(windowHash != _hash){ //detect if hash changed (manually or using setHash)
			_registerChange(windowHash);
		}
	}
	
	/**
	* Adds DOM Event Listener
	* @param {Element} elm Element.
	* @param {string} eType Event type.
	* @param {Function} fn Listener function.
	* @private
	*/
	function _addListener(elm, eType, fn){
		if(elm.addEventListener){
			elm.addEventListener(eType, fn, false);
		}else if(elm.attachEvent){
			elm.attachEvent('on' + eType, fn);
		}
	}
	
	/**
	* Removes DOM Event Listener
	* @param {Element} elm Element.
	* @param {string} eType Event type.
	* @param {Function} fn Listener function.
	* @private
	*/
	function _removeListener(elm, eType, fn){
		if(elm.removeEventListener){
			elm.removeEventListener(eType, fn, false);
		}else if(elm.detachEvent){
			elm.detachEvent('on' + eType, fn);
		}
	}
	
	//--------------------------------------------------------------------------------------
	// Public (API)
	//--------------------------------------------------------------------------------------
	
	hasher = /** @lends hasher */ {
	
		/**
		 * hasher Version Number
		 * @type string
		 * @constant
		 */
		VERSION : '0.9.91',
		
		/**
		 * String that should always be added to the end of Hash value.
		 * <ul>
		 * <li>default value: '/';</li>
		 * <li>will be automatically removed from `hasher.getHash()`</li>
		 * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
		 * </ul>
		 * @type string
		 */
		appendHash : '/',
		
		/**
		 * String that should always be added to the beginning of Hash value.
		 * <ul>
		 * <li>default value: '/';</li>
		 * <li>will be automatically removed from `hasher.getHash()`</li>
		 * <li>avoid conflicts with elements that contain ID equal to hash value;</li>
		 * </ul>
		 * @type string
		 */
		prependHash : '/',
		
		/**
		 * String used to split hash paths; used by `hasher.getHashAsArray()` to split paths.
		 * <ul>
		 * <li>default value: '/';</li>
		 * </ul>
		 * @type string
		 */
		separator : '/',
		
		/**
		 * Signal dispatched when hash value changes
		 * @type signals.Signal
		 */
		changed : new Signal(),
		
		/**
		 * Signal dispatched when hasher is stopped
		 * @type signals.Signal
		 */
		stopped : new Signal(),
	  
		/**
		 * Signal dispatched when hasher is initialized
		 * @type signals.Signal
		 */
		initialized : new Signal(),
	
		/**
		 * Start listening/dispatching changes in the hash/history.
		 * - hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons before calling this method.
		 */
		init : function(){
			if(_isActive){
				return;
			}
			
			var oldHash = _hash;
			_hash = _getWindowHash();
			
			//thought about branching/overloading hasher.init() to avoid checking multiple times but don't think worth doing it since it probably won't be called multiple times. [?] 
			if(_isHashChangeSupported){
				_addListener(window, 'hashchange', _checkHistory);
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
		},
		
		/**
		 * Stop listening/dispatching changes in the hash/history.
		 * - hasher won't dispatch CHANGE events by manually typing a new value or pressing the back/forward buttons after calling this method, unless you call hasher.init() again.
		 * - hasher will still dispatch changes made programatically by calling hasher.setHash();
		 */
		stop : function(){
			if(!_isActive){
				return;
			}
			
			if(_isHashChangeSupported){
				_removeListener(window, 'hashchange', _checkHistory);
			}else{
				clearInterval(_checkInterval);
				_checkInterval = null;
			}
			
			_isActive = false;
			this.stopped.dispatch(_trimHash(_hash), _trimHash(_hash)); //since it didn't changed oldHash and newHash should be the same. [?]
		},
		
		/**
		 * Retrieve if hasher is listening to changes on the browser history and/or hash value.
		 * @return {boolean}	If hasher is listening to changes on the browser history and/or hash value.
		 */
		isActive : function(){
			return _isActive;
		},
		
		/**
		 * Retrieve full URL.
		 * @return {string}	Full URL.
		 */
		getURL : function(){
			return location.href;
		},
		
		/**
		 * Retrieve URL without query string and hash.
		 * @return {string}	Base URL.
		 */
		getBaseURL : function(){
			return this.getURL().replace(/(\?.*)|(\#.*)/, ''); //removes everything after '?' and/or '#'
		},
		
		/**
		 * Set Hash value.
		 * @param {string} value	Hash value without '#'.
		 */
		setHash : function(value){
			value = (value)? this.prependHash + value.replace(/^\#/, '') + this.appendHash : value; //removes '#' from the beginning of string and append/prepend default values.
			if(value != _hash){
				_registerChange(value); //avoid breaking the application if for some reason `location.hash` don't change
				if(_isIE && _isLocal){
					value = value.replace(/\?/, '%3F'); //fix IE8 local file bug [issue #6]
				}
				location.hash = '#'+ encodeURI(value); //used encodeURI instead of encodeURIComponent to preserve '?', '/', '#'. Fixes Safari bug [issue #8]
			}
		},
		
		/**
		 * Return hash value as String.
		 * @return {string}	Hash value without '#'.
		 */
		getHash : function(){
			//didn't used actual value of the `location.hash` to avoid breaking the application in case `location.hash` isn't available and also because value should always be synched.
			return _trimHash(_hash);
		},
		
		/**
		 * Return hash value as Array.	
		 * @return {Array.<string>}	Hash splitted into an Array.  
		 */
		getHashAsArray : function(){
			return this.getHash().split(this.separator);
		},
		
		/**
		 * Set page title
		 * @param {string} value	Page Title
		 */
		setTitle : function(value){
			document.title = value;
		},
		
		/**
		 * Get page title
		 * @return {string} Page Title
		 */
		getTitle : function(){
			return document.title;
		},
		
		/**
		 * Navigate to previous page in history
		 */
		back : function(){
			history.back();
		},
		
		/**
		 * Navigate to next page in history
		 */
		forward : function(){
			history.forward();
		},
		
		/**
		 * Loads a page from the session history, identified by its relative location to the current page.
		 * - for example `-1` loads previous page, `1` loads next page.
		 * @param {Number} delta	Relative location to the current page.
		 */
		go : function(delta){
			history.go(delta);
		},
		
		/**
		 * Removes all event listeners, stops hasher and destroy hasher object.
		 * - IMPORTANT: hasher won't work after calling this method, hasher Object will be deleted.
		 */
		dispose : function(){
			hasher.initialized.removeAll();
			hasher.stopped.removeAll();
			hasher.changed.removeAll();
			hasher.stop();
			_frame = hasher = window.hasher = null;
			//can't use `delete window.hasher;` because on IE it throws errors, `window` isn't actually an object, delete can only be used on Object properties.
		},
		
		/**
		 * Returns string representation of the hasher object.
		 * @return {string} A string representation of the object.
		 */
		toString : function(){
			return '[hasher version="'+ this.VERSION +'" hash="'+ this.getHash() +'"]';
		}
	
	};
	
	return hasher;
	
}(window, window.document));