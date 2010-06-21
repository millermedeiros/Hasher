/*
 * MM.EventDispatcher
 * - Class used to allow Custom Objects to dispatch events.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.7.2 (2010/06/21)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace
 * @ignore
 */
var MM = MM || {};

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
			e.target = e.target || this; //ensure Event.target exists (default to Object that extends EventDispatcher)
			for(i=0; i<n; i++){
				curHandler = typeHandlers[i];
				curHandler(e);
			}	
		}
	}
	
};