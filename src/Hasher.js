/**
 * Hasher
 * - History Manager for rich-media applications.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.0 (2010/04/17)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(){
	
	//TODO: add support for IE <= 7.
	//TODO: use 'window.onhashchange' listener if browser supports it.
	
	var	location = window.location,
		_oldHash,
		_checkInterval,
		_frame, //used for IE <= 7 
		Hasher = new MM.EventDispatcher(); //inherit from MM.EventDispatcher
	
	/**
	 * Start listening/dispatching changes in the hash.
	 */
	Hasher.init = function(){
		var newHash = Hasher.getHash();
		this.dispatchEvent(new HasherEvent(HasherEvent.INIT, _oldHash, newHash));
		_oldHash = newHash; //avoid dispatching CHANGE event just after INIT event (since it didn't changed).
		_checkInterval = setInterval(_check, 100);
	};
	
	/**
	 * Stop listening/dispatching changes in the hash.
	 */
	Hasher.stop = function(){
		clearInterval(_checkInterval);
		_checkInterval = null;
		this.dispatchEvent(new HasherEvent(HasherEvent.STOP, _oldHash, _oldHash)); //since it didn't changed oldURL and newHash should be the same.
	};
	
	/**
	 * Set Hash value.
	 * @param {String} value	Hash value without '#'.
	 */
	Hasher.setHash = function(value){
		location.hash = '#'+ value;
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
	
	/**
	 * Function that checks if hash has changed.
	 * - used since some browsers don't dispatchEvent the `onhashchange` event.
	 * @private
	 */
	function _check(){
		var newHash = Hasher.getHash();
		if(newHash == _oldHash){
			return;
		} else {
			Hasher.dispatchEvent(new HasherEvent(HasherEvent.CHANGE, _oldHash, newHash));
			_oldHash = newHash;
		}
	}
	
	/**
	 * Creates iframe. (Hack for IE <= 7) 
	 * @private
	 */
	function _createFrame(){
		_frame = document.createElement('iframe');
		_frame.src = 'javascript:false';
		_frame.style.display = 'none';
		document.body.appendChild(_frame);
	}
	
	/**
	 * Update iframe content, generating a history record. (Hack for IE <= 7)
	 * @private
	 */
	function _updateFrame(){
		var frameDoc = _frame.contentDocument || _frame.contentWindow.document;
		frameDoc.open();
		frameDoc.write('&nbsp;');
		frameDoc.close();
	}
	
	//Add Hasher to the global scope
	this.Hasher = Hasher;
	
})();