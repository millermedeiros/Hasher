/*
 * MM.event - DOM Event Listener Facade
 * - Cross-browser DOM Event Listener attachment/detachment.
 * - Based on Peter-Paul Koch addEventSimple <http://www.quirksmode.org/js/eventSimple.html>
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.3 (2010/06/23)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace Miller Medeiros Namespace
 */
var MM = MM || {};

/**
 * @namespace Utilities for Browser Native Events
 */
MM.event = MM.event || {};

/**
* Adds DOM Event Listener
* @param {Element} elm Element.
* @param {String} eType Event type.
* @param {Function} fn Listener function.
*/
MM.event.addListener = function(elm, eType, fn){
	if(elm.addEventListener){
		elm.addEventListener(eType, fn, false);
	}else if(elm.attachEvent){
		elm.attachEvent('on' + eType, fn);
	}else{
		elm['on' + eType] = fn;
	}
};

/**
* Removes DOM Event Listener
* @param {Element} elm Element.
* @param {String} eType Event type.
* @param {Function} fn Listener function.
*/
MM.event.removeListener = function(elm, eType, fn){
	if(elm.removeEventListener){
		elm.removeEventListener(eType, fn, false);
	}else if(elm.detachEvent){
		elm.detachEvent('on' + eType, fn);
	}else{
		elm['on' + eType] = null;
	}
};