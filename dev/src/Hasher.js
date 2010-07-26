/*
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.9.3 (2010/07/26)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(window, document, location, history, undef){
	
	
	//== Private Vars ==//
	
		/** @private {String} previous/current hash value */
	var _hash, 
		
		/** @private {Number} stores setInterval reference (used to check if hash changed on non-standard browsers) */
		_checkInterval,
		
		/** @private {Boolean} If Hasher is active and should listen/dispatch changes on the hash */
		_isActive,
		
		/** @private {iframe} iframe used for IE <= 7 */
		_frame,
		
		/** @private {Boolean} if is IE <= 7 */
		_isLegacyIE = /MSIE (6|7)/.test(navigator.userAgent) && (!+"\v1"), //feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
		
		/** @private {Boolean} If browser supports the `hashchange` event - FF3.6+, IE8+, Chrome 5+, Safari 5+ */
		_isHashChangeSupported = ('onhashchange' in window),
		
		//-- local storage for performance improvement and better compression --//
		
		/** @private {Object} @extends MM.EventDispatcher */
		Hasher = new MM.EventDispatcher(),
		
		/** @private {MM.queryUtils} Utilities for query string manipulation */
		_queryUtils = MM.queryUtils,
		
		/** @private {MM.event} Browser native events adapter */
		_eventAdapter = MM.event;
		
	
	//== Private methods ==//
	
	/**
	 * Dispatch `HasherEvent.CHANGE` and stores hash value.
	 * @param {String} newHash	New Hash Value.
	 * @private
	 */
	function _registerChange(newHash){
		if(_hash != newHash){
			var tmpHash = _hash;
			_hash = newHash; //should come before event dispatch to make sure user can get proper value inside event handler
			if(_isActive){
				Hasher.dispatchEvent(new HasherEvent(HasherEvent.CHANGE, tmpHash, newHash));
			}
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
	 * Update iframe content, generating a history record and saving current hash/title on IE <= 7. [HACK]
	 * - based on Really Simple History, SWFAddress and YUI.history solutions.
	 * @param {string} hashValue	Hash value without '#'.
	 * @private
	 */
	function _updateFrame(hashValue){
		var frameDoc = _frame.contentWindow.document;
		frameDoc.open();
		frameDoc.write('<html><head><title>'+ Hasher.getTitle() +'</title><script type="text/javascript">var frameHash="'+ hashValue +'";</script></head><body>&nbsp;</body></html>'); //stores current hash inside iframe.
		frameDoc.close();
	}
	
	/**
	 * Get hash value from current URL
	 * @return {String}	Hash value without '#'.
	 * @private
	 */
	function _getWindowHash(){
		//parsed full URL instead of getting location.hash because Firefox decode hash value (and all the other browsers don't)
		//also because IE8 has some issues setting a hash value that contains "?" while offline (it also adds it before the hash but without setting the location.search)
		var result = /#(.*)$/.exec( Hasher.getURL() );
		return (result && result[1])? decodeURIComponent( result[1] ) : '';
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
			frameHash = _frame.contentWindow.frameHash;
		if(frameHash != windowHash && frameHash != _hash){ //detect changes made pressing browser history buttons. Workaround since history.back() and history.forward() doesn't update hash value on IE6/7 but updates content of the iframe.
			Hasher.setHash(frameHash);
			_registerChange(frameHash);
		}else if(windowHash != _hash){ //detect if hash changed (manually or using setHash)
			if(frameHash != windowHash){
				_updateFrame(windowHash);
			}
			_registerChange(windowHash);
		}
	}
	
	
	//== Public (API) ==//
	
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
		if(_isActive){
			return;
		}
		
		var tmpHash = _hash;
		_hash = _getWindowHash();
		
		//thought about branching/overloading Hasher.init() to avoid checking multiple times but don't think worth doing it since it probably won't be called multiple times. [?] 
		if(_isHashChangeSupported){
			MM.event.addListener(window, 'hashchange', _checkHistory);
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
		this.dispatchEvent(new HasherEvent(HasherEvent.INIT, tmpHash, _hash));
	};
	
	/**
	 * Stop listening/dispatching changes in the hash/history.
	 */
	Hasher.stop = function(){
		if(!_isActive){
			return;
		}
		
		if(_isHashChangeSupported){
			MM.event.removeListener(window, 'hashchange', _checkHistory);
		}else{
			clearInterval(_checkInterval);
			_checkInterval = null;
		}
		
		_isActive = false;
		this.dispatchEvent(new HasherEvent(HasherEvent.STOP, _hash, _hash)); //since it didn't changed oldHash and newHash should be the same. [?]
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
		return location.href.replace(/(\?.*)|(\#.*)/, ''); //removes everything after '?' and/or '#'
	};
	
	/**
	 * Set Hash value.
	 * @param {String} value	Hash value without '#'.
	 */
	Hasher.setHash = function(value){
		value = (value)? value.replace(/^\#/, '') : value; //removes '#' from the beginning of string.
		if(value != _hash){
			location.hash = value;
			_registerChange(value); //avoid breaking the application if for some reason `location.hash` don't change (not sure if really needed but it's safer to keep it).
		}
	};
	
	/**
	 * Return hash value as String.
	 * @return {String}	Hash value without '#'.
	 */
	Hasher.getHash = function(){
		//didn't used actual value of the `location.hash` to avoid breaking the application in case `location.hash` isn't available. 
		return _hash;
	};
	
	/**
	 * Return hash value as Array.
	 * @param {String} [separator]	String used to divide hash (default = '/').	
	 * @return {Array}	Hash splitted into an Array.  
	 */
	Hasher.getHashAsArray = function(separator){
		separator = separator || '/';
		var hash = this.getHash(),
			regexp = new RegExp('^\\'+ separator +'|\\'+ separator +'$', 'g'); //match separator at the end or begin of string
		hash = hash.replace(regexp, '');
		return hash.split(separator);
	};
	
	/**
	 * Get Query portion of the Hash as a String
	 * - alias to: `MM.queryUtils.getQueryString( Hasher.getHash() ).substr(1);`
	 * @return {String}	Hash Query without '?'
	 */
	Hasher.getHashQuery = function(){
		return _queryUtils.getQueryString( this.getHash() ).substr(1);
	};
	
	/**
	 * Get Query portion of the Hash as an Object
	 * - alias to: `MM.queryUtils.toQueryObject( Hasher.getHashQueryString() );`
	 * @return {Object} Hash Query
	 */
	Hasher.getHashQueryAsObject = function(){
		return _queryUtils.toQueryObject( this.getHashQuery() );
	};
	
	/**
	 * Get parameter value from the query portion of the Hash
	 * - alias to: `MM.queryUtils.getParamValue(paramName, Hasher.getHash() );`
	 * @param {String} paramName	Parameter Name.
	 * @return {String}	Parameter value.
	 */
	Hasher.getHashQueryParam = function(paramName){
		return _queryUtils.getParamValue(paramName, this.getHash() );
	};
	
	/**
	 * Set page title
	 * @param {String} value	Page Title
	 */
	Hasher.setTitle = function(value){
		document.title = value;
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
	
}(window, document, location, history));