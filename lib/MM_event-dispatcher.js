/**
 * MM.EventDispatcher
 * - Class used to allow Custom Objects to dispatch events.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.2 (2010/04/16)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function(){
	
	this.MM = this.MM || {};
	
	/**
	 * Constructor 
	 * - Creates a new EventDispatcher Object
	 */
	MM.EventDispatcher = function(){
		this._handlers = {};
	};
	
	var UNDEF = 'undefined',
		prot = MM.EventDispatcher.prototype; //local storage for performance
	
	/**
	 * Add Event Listener
	 * @param {String} eType	Event Type.
	 * @param {Function} fn	Event Handler.
	 */
	prot.addListener = function(eType, fn){
		if(typeof this._handlers[eType] == UNDEF){
			this._handlers[eType] = [];
		}
		this._handlers[eType].push(fn);
	};
	
	/**
	 * Remove Event Listener
	 * @param {String} eType	Event Type.
	 * @param {Function} fn	Event Handler.
	 */
	prot.removeListener = function(eType, fn){
		if(! this.hasListener(eType)){
			return;
		}
		
		var	typeHandlers = this._handlers[eType], //stored for performance
			n = typeHandlers.length;
			
		if(n == 1){
			this._handlers[eType] = null; //avoid loop if not necessary
		}else{
			while(n--){ //faster than for
				if(typeHandlers[n] == fn){
					typeHandlers.splice(n, 1);
					break;
				}
			}
		}
	};
	
	/**
	 * Removes all Listeners from the EventDispatcher object.
	 */
	prot.removeAllListeners = function(){
		this._handlers = {};
	};
	
	/**
	 * Checks if the EventDispatcher has any listeners registered for a specific type of event. 
	 * @param {String} eType	Event Type.
	 * @return {Boolean}
	 */
	prot.hasListener = function(eType){
		return (typeof this._handlers[eType] != UNDEF);
	};
	
	/**
	 * Dispatch Event
	 * - Call all Handlers Listening to the Event.
	 * @param {Event|String} e	Custom Event Object (property `type` is required) or String with Event type.
	 */
	prot.dispatch = function(e){
		e = (typeof e == 'string')? {type: e} : e;
		if(this.hasListener(e.type)){
			var typeHandlers = this._handlers[e.type], //stored for performance
				curHandler;
			for(var i=0, n = typeHandlers.length; i<n; i++){
				curHandler = typeHandlers[i];
				curHandler(e);
			}	
		}
	};
	
})();
