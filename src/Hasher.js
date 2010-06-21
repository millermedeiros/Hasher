/*
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.7 (2010/06/21)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(window, document, undefined){
	
	
	//== Private Vars ==//
	
	var	_oldHash, //{String} used to check if hash changed
		_checkInterval, //stores setInterval reference (used to check if hash changed)
		_frame, //iframe used for IE <= 7 
		_isLegacyIE = /msie (6|7)/.test(navigator.userAgent.toLowerCase()) && !+"\v1"; //feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html	
	
	
	//== Public API ==//
	
	/**
	 * Hasher
	 * @namespace
	 * @extends MM.EventDispatcher
	 */
	this.Hasher = new MM.EventDispatcher();
	
	/**
	 * Start listening/dispatching changes in the hash/history.
	 */
	Hasher.init = function(){
		var newHash = this.getHash();
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
		var hash = this.getHash(),
			regexp = new RegExp('^\\'+ separator +'|\\'+ separator +'$', 'g'); //match string starting and/or ending with separator
		hash = hash.replace(regexp, '');
		return hash.split(separator);
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
	 * Get Query portion of the Hash as a String
	 * - alias to: `MM.queryUtils.getQueryString( Hasher.getHash() );`
	 * @return {String}	Hash Query
	 */
	Hasher.getHashQuery = function(){
		return MM.queryUtils.getQueryString( this.getHash() );
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
	 * Function that checks if hash has changed. [HACK]
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
		frameDoc.write('<html><head><title>'+ Hasher.getTitle() +'</title><script type="text/javascript">var frameHash="'+ Hasher.getHash() +'";</script></head><body>&nbsp;</body></html>'); //stores current hash inside iframe.
		frameDoc.close();
	}
	
})(window, document);