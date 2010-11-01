/**
 * EventDispatcher Object, used to allow Custom Objects to dispatch events.
 * @constructor
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.8.2 (2010/08/26)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
millermedeiros.EventDispatcher = function(){
	/** 
	 * Event Handlers
	 * @type Object.<string, Array.<Function>>
	 */
	this._handlers = {};
	
	/**
	 * Disabled Event Types (events types that shouldn't be dispatched)
	 * @type Array.<string>
	 */
	this._disabled = [];
};

millermedeiros.EventDispatcher.prototype = {
	
	/**
	 * Add Event Listener
	 * @param {string} eType	Event Type.
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
	 * @param {string} eType	Event Type.
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
	 * @param {(string|boolean)} eType	Event type or `true` if want to remove listeners of all event types.
	 */
	removeAllEventListeners : function(eType){
		if(typeof eType === 'string' && this.hasEventListener(eType)){
			delete this._handlers[eType];
		}else if(eType){
			this._handlers = {};
		}
	},
	
	/**
	 * Checks if the EventDispatcher has any listeners registered for a specific type of event. 
	 * @param {string} eType	Event Type.
	 * @return {boolean}
	 */
	hasEventListener : function(eType){
		return (typeof this._handlers[eType] != 'undefined');
	},

	/**
	 * Dispatch Event
	 * - Call all Handlers Listening to the Event.
	 * @param {(Object|string)} evt	Custom Event Object (property `type` is required) or String with Event type.
	 * @return {boolean} If Event was successfully dispatched.
	 */
	dispatchEvent : function(evt){
		evt = (typeof evt == 'string')? {type: evt} : evt; //create Object if not an Object to always call handlers with same type of argument.
		if(this.hasEventListener(evt.type)){
			var typeHandlers = this._handlers[evt.type], //stored for performance
				curHandler,
				i,
				n = typeHandlers.length;
			evt.target = evt.target || this; //ensure Event.target exists
			for(i=0; i<n; i++){
				curHandler = typeHandlers[i];
				curHandler(evt);
			}
			return true;
		}
		return false;
	},
	
	/**
	 * Check if Event will be dispatched (i.e. If event type is enabled)
	 * @param {string} evtType	Event type.	
	 * @return {boolean} If Event will be dispatched.
	 */
	willDispatch : function(evtType){
		var n = this._disabled.length;
		while(n--){
			if(this._disabled[n] === evtType){
				return false;
			}
		}
		return true;
	},
	
	/**
	 * Disable Event dispatching by type
	 * @param {...string} evtTypes	Event types that should be disabled (events types that shouldn't be dispatched)
	 */
	disableEvent : function(evtTypes){
		var types = Array.prototype.slice.call(arguments, 0),
			n = types.length,
			curType;
		while(n--){
			curType = types[n];
			if(this.willDispatch(curType)){ //avoid adding multiple times
				this._disabled.push(curType);
			}
		}
	},
	
	/**
	 * Enable Event dispatching by type
	 * @param {...string} evtTypes	Event types that should be enabled (events types that should be dispatched)
	 */
	enableEvent : function(evtTypes){
		var types = Array.prototype.slice.call(arguments, 0),
			n = types.length,
			m,
			curType;
		while(n--){
			curType = types[n];
			m = this._disabled.length;
			while(m--){
				if(this._disabled[m] === curType){
					this._disabled.splice(m, 1);
				}
			}
		}
	}
	
};