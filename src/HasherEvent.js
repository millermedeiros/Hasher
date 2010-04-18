/**
 * Hasher Event
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.1 (2010/04/16)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * Constructor
 * - Creates a new HasherEvent Object.
 * - According to the HTML5 spec `hashchange` event should have `oldURL` and `newURL` properties. ( http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#event-hashchange )
 * @param {String} eType	Hasher Event type.
 * @param {String} oldURL	Previous URL.
 * @param {String} newURL	Current URL.
 */
var HasherEvent = function(eType, oldURL, newURL){
	this.type = eType;
	this.oldURL = oldURL;
	this.newURL = newURL;
}

/**
 * Returns string representation of the HasherEvent
 * @return {String} A string representation of the object.
 */
HasherEvent.prototype.toString = function(){
	return '[HasherEvent type="'+ this.type +'" oldURL="'+ this.oldURL +'" newURL="'+ this.newURL +'"]';
};

//-- Constants --//

/**
 * @var	{String} Defines the value of the type property of an change event object.
 * @static
 */
HasherEvent.CHANGE = 'change';

/**
 * @var	{String} Defines the value of the type property of an init event object.
 * @static
 */
HasherEvent.INIT = 'init';

/**
 * @var	{String} Defines the value of the type property of an stop event object.
 * @static
 */
HasherEvent.STOP = 'stop';
