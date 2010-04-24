/**
 * Hasher Event
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.2 (2010/04/18)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * Constructor
 * - Creates a new HasherEvent Object.
 * - According to the HTML5 spec `hashchange` event should have `oldURL` and `newURL` properties, since the only portion of the URL that changes is the hash I decided to use `oldHash` and `newHash` instead. ( http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#event-hashchange )
 * @param {String} eType	Hasher Event type.
 * @param {String} oldHash	Previous Hash.
 * @param {String} newHash	Current Hash.
 */
var HasherEvent = function(eType, oldHash, newHash){
	this.type = eType;
	this.oldHash = oldHash;
	this.newHash = newHash;
};

/**
 * Returns string representation of the HasherEvent
 * @return {String} A string representation of the object.
 */
HasherEvent.prototype.toString = function(){
	return '[HasherEvent type="'+ this.type +'" oldHash="'+ this.oldHash +'" newHash="'+ this.newHash +'"]';
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
