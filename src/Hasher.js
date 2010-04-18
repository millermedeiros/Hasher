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
		_oldURL,
		_checkInterval,
		Hasher = new MM.EventDispatcher(); //inherit from MM.EventDispatcher
	
	/**
	 * Start listening/dispatching changes in the hash.
	 */
	Hasher.init = function(){
		this.dispatch(new HasherEvent(HasherEvent.INIT), _oldURL, Hasher.getURL());
		_checkInterval = setInterval(_checkHash, 100);
	};
	
	/**
	 * Stop listening/dispatching changes in the hash.
	 */
	Hasher.stop = function(){
		clearInterval(_checkInterval);
		_checkInterval = null;
		this.dispatch(new HasherEvent(HasherEvent.STOP), _oldURL, Hasher.getURL());
	};
	
	/**
	 * Set Hash value.
	 * @param {String} value	Full hash value.
	 */
	Hasher.setHash = function(value){
		location.hash = '#'+ value;
	};
	
	/**
	 * Return full hash as String.
	 * @return {String}	Full hash value.
	 */
	Hasher.getHash = function(){
		return location.hash.substr(1);
	};
	
	/**
	 * Return hash as Array
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
	 * - used since some browsers don't dispatch the `onhashchange` event.
	 * @private
	 */
	function _checkHash(){
		var newURL = Hasher.getURL();
		if(newURL == _oldURL){
			return;
		} else {
			Hasher.dispatch(new HasherEvent(HasherEvent.CHANGE, _oldURL, newURL));
			_oldURL = newURL; 
		}
	}
	
	//Add Hasher to the global scope
	this.Hasher = Hasher;
	
})();