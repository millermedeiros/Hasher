/*
 * Hasher Event
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.2 (2010/04/18)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * HasherEvent Object.
 * <p>According to the HTML5 spec `hashchange` event should have `oldURL` and `newURL` properties, since the only portion of the URL that changes is the hash I decided to use `oldHash` and `newHash` instead. (http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#event-hashchange)</p>
 * @param {string} eType	Hasher Event type.
 * @param {(string|null)} oldHash	Previous Hash.
 * @param {(string|null)} newHash	Current Hash.
 * @constructor
 */
var HasherEvent = function(eType, oldHash, newHash){
	/**
	 * Event Type
	 * @type string
	 */
	this.type = eType;
	/**
	 * Previous Hash value
	 * @type (string|null)
	 */
	this.oldHash = oldHash;
	/**
	 * Current Hash value
	 * @type (string|null)
	 */
	this.newHash = newHash;
};

/**
 * Returns string representation of the HasherEvent
 * @return {string} A string representation of the object.
 */
HasherEvent.prototype.toString = function(){
	return '[HasherEvent type="'+ this.type +'" oldHash="'+ this.oldHash +'" newHash="'+ this.newHash +'"]';
};

//-- Constants --//

/**
 * Defines the value of the type property of an change event object.
 * @type string
 * @constant
 */
HasherEvent.CHANGE = 'change';

 /**
 * Defines the value of the type property of an init event object.
 * @type string
 * @constant
 */
HasherEvent.INIT = 'init';

/**
 * Defines the value of the type property of an stop event object.
 * @type string
 * @constant
 */
HasherEvent.STOP = 'stop';