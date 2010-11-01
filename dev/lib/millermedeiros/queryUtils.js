/**
 * @namespace Utilities for query string manipulation.
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.8.2 (2010/08/12)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
millermedeiros.queryUtils = {
	
	/**
	 * Gets full query as string with all special chars decoded.
	 * @param {string} [url]	 URL to be parsed, defaults to `location.href`
	 * @return {string}	Query string
	 */
	getQueryString : function(url){
		url = url || location.href; //used location.href to avoid bug on IE6 and pseudo query string inside location.hash
		url = url.replace(/#[\w\W]*/, ''); //removes hash (to avoid getting hash query)
		var queryString = /\?[a-zA-Z0-9\=\&\%\$\-\_\.\+\!\*\'\(\)\,]+/.exec(url); //valid chars according to: http://www.ietf.org/rfc/rfc1738.txt
		return (queryString)? decodeURIComponent(queryString[0]) : '';
	},
	
	/**
	 * Gets query as Object.
	 * - Alias for `millermedeiros.queryUtils.toQueryObject( millermedeiros.queryUtils.getQueryString(url) )`
	 * @param {string} [url]	URL to be parsed, default to location.href.
	 * @return {Object.<string, (string|number)>}	Object with all the query "params => values" pairs.
	 */
	getQueryObject : function(url){
		return this.toQueryObject(this.getQueryString(url));
	},
	
	/**
	 * Convert Query String into an Object
	 * @param {string} queryString	 Query String to be parsed
	 * @return {Object.<string, (string|number)>}	Object with all the query "params => values" pairs.
	 */
	toQueryObject : function(queryString){
		var queryArr = queryString.replace('?', '').split('&'), 
			n = queryArr.length,
			queryObj = {},
			value;
		while (n--) {
			queryArr[n] = queryArr[n].split('=');
			value = queryArr[n][1];
			queryObj[queryArr[n][0]] = isNaN(value)? value : parseFloat(value);
		}
		return queryObj;
	},
	
	/**
	 * Get query parameter value.
	 * @param {string} param	Parameter name.
	 * @param {string} [url]	URL to be parsed, default to location.href
	 * @return {(string|number)}	Parameter value.
	 */
	getParamValue : function(param, url){
		url = url || location.href;
		var regexp = new RegExp('(\\?|&)'+ param + '=([^&]*)'), //matches `?param=value` or `&param=value`, value = $2
			result = regexp.exec(url),
			value = (result && result[2])? result[2] : null;
		return isNaN(value)? value : parseFloat(value);
	},
	
	/**
	 * Checks if query contains parameter.
	 * @param {string} param	Parameter name.
	 * @param {string} [url]	URL to be parsed, default to location.href
	 * @return {boolean} If parameter exist.
	 */
	hasParam : function(param, url){
		var regexp = new RegExp('(\\?|&)'+ param +'=', 'g'); //matches `?param=` or `&param=`
		return regexp.test(this.getQueryString(url));
	},
	
	/**
	 * Converts object into query string.
	 * @param {Object} obj	Object with "params => values" pairs.
	 * @return {string}	Formated query string starting with '?'.
	 */
	toQueryString : function(obj){
		var query = [],
			param;
		for(param in obj){
			if(obj.hasOwnProperty(param)){ //avoid copying properties from the prototype
				query.push(param +'='+ obj[param]);
			}
		}
		return (query.length)? '?'+ query.join('&') : '';
	}
	
};