/*
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.5 (2010/05/11)
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
		var hash = Hasher.getHash(),
			regexp = new RegExp('^\\'+ separator +'|\\'+ separator +'$', 'g'); //match string starting and/or ending with separator
		hash = hash.replace(regexp, '');
		return hash.split(separator);
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