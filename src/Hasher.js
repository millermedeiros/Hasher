/**
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.2 (2010/04/24)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(){
	
	
	//== Private Vars ==//
	
	
	var	location = window.location,
		_oldHash, //{String} used to check if hash changed
		_checkInterval, //stores setInterval reference (used to check if hash changed)
		_frame, //iframe used for IE <= 7 
		_isLegacyIE = /msie (6|7)/.test(navigator.userAgent.toLowerCase()) && !+"\v1", //feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
		Hasher = new MM.EventDispatcher(); //inherit from MM.EventDispatcher
	
	
	//== Public API ==//
	
	
	/**
	 * Start listening/dispatching changes in the hash/history.
	 */
	Hasher.init = function(){
		var newHash = Hasher.getHash();
		this.dispatchEvent(new HasherEvent(HasherEvent.INIT, _oldHash, newHash));
		_oldHash = newHash; //avoid dispatching CHANGE event just after INIT event (since it didn't changed).
		if(_isLegacyIE){ //IE6 & IE7 [HACK]
			if(!_frame){
				_createFrame();
				_updateFrame();
			}
			_checkInterval = setInterval(_checkHistoryLegacyIE, 50);
		}else{ //regular browsers
			_checkInterval = setInterval(_checkHash, 50);
		}
		//TODO: use 'window.onhashchange' listener if browser supports it.
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
	 * Retrieve full URL.
	 * @return {String}	Full URL.
	 */
	Hasher.getURL = function(){
		return location.href;
	};
	
	/**
	 * Set page title
	 * @param {String} title
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
	
	/**
	 * @see MM.queryUtils.getQueryString
	 */
	Hasher.getQueryString = MM.queryUtils.getQueryString;
	
	/**
	 * @see MM.queryUtils.getQueryObject
	 */
	Hasher.getQueryObject = MM.queryUtils.getQueryObject;
	
	/**
	 * @see MM.queryUtils.getParamValue
	 */
	Hasher.getParamValue = MM.queryUtils.getParamValue;
	
	/**
	 * @see MM.queryUtils.hasParam
	 */
	Hasher.hasParam = MM.queryUtils.hasParam;
	
	/**
	 * @see MM.queryUtils.toQueryString
	 */
	Hasher.toQueryString = MM.queryUtils.toQueryString;
	
	
	//== Private methods ==//
	
	
	/**
	 * Function that checks if hash has changed.
	 * - used since most browsers don't dispatch the `onhashchange` event.
	 * @private
	 */
	function _checkHash(){
		var curHash = Hasher.getHash();
		if(curHash == _oldHash){
			return;
		}else{
			Hasher.dispatchEvent(new HasherEvent(HasherEvent.CHANGE, _oldHash, curHash));
			_oldHash = curHash;
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
		//check if browser history state changed.
		if(frameHash != windowHash && frameHash != _oldHash){ //detect changes made pressing browser history buttons. Workaround since history.back() and history.forward() doesn't update hash value on IE6/7 but updates content of the iframe.
			Hasher.setTitle(_frame.contentWindow.document.title);
			Hasher.setHash(frameHash);
			Hasher.dispatchEvent(new HasherEvent(HasherEvent.CHANGE, _oldHash, frameHash));
			_oldHash = frameHash;
		}else if(windowHash != _oldHash){ //detect if hash changed
			if(frameHash != windowHash){
				_updateFrame();
			}
			Hasher.dispatchEvent(new HasherEvent(HasherEvent.CHANGE, _oldHash, windowHash));
			_oldHash = windowHash;
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
	 * - based on Really Simple History, SWFAddress and YUI.history.
	 * @private
	 */
	function _updateFrame(){
		var frameDoc = _frame.contentWindow.document;
		frameDoc.open();
		frameDoc.write('<html><head><title>'+ Hasher.getTitle() +'</title><script type="text/javascript">var frameHash="'+ Hasher.getHash() +'";</script></head><body>&nbsp;</body></html>'); //stores current title and current hash inside iframe.
		frameDoc.close();
	}
	
	
	//== Init ==//	
	
	
	//Add Hasher to the global scope
	this.Hasher = Hasher;
	
})();