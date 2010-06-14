/*
 * MM.queryUtils
 * - utilities for query string manipulation
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.4 (2010/06/14)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

/**
 * @namespace
 * @ignore
 */
this.MM = this.MM || {};

/**
 * Utilities for query string manipulation.
 * @namespace
 */
MM.queryUtils = {
	
	/**
	 * Gets full query as string with all special chars decoded.
	 * @param {String} [url]	 URL to be parsed, defaults to `location.href`
	 * @return {String}	Query string
	 */
	getQueryString : function(url){
		url = url || location.href; //used to avoid bug on IE6 and query string inside location.hash
		var queryString = /\?[a-zA-Z0-9\=\&\%\$\-\_\.\+\!\*\'\(\)\,]+/.exec(url); //valid chars according to: http://www.ietf.org/rfc/rfc1738.txt
		return (queryString)? decodeURIComponent(queryString[0]) : '';
	},
	
	/**
	 * Gets query as Object.
	 * - Alias for `MM.queryUtils.toQueryObject( MM.queryUtils.getQueryString() )`
	 * @return {Object}	Object with all the query "params => values" pairs.
	 */
	getQueryObject : function(){
		return this.toQueryObject(this.getQueryString());
	},
	
	/**
	 * Convert Query String into an Object
	 * @param {String} queryString	 Query String to be parsed
	 * @return {Object}	Object with all the query "params => values" pairs.
	 */
	toQueryObject : function(queryString){
		var queryArr = queryString.replace('?', '').split('&'), 
			n = queryArr.length,
			queryObj = {};
		while (n--) {
			queryArr[n] = queryArr[n].split('=');
			queryObj[queryArr[n][0]] = queryArr[n][1];
		}
		return queryObj;
	},
	
	/**
	 * Get query parameter value.
	 * @param {String} param	Parameter name.
	 * @param {String} [url]	URL to be parsed, default to location.href
	 * @return {String}	Parameter value.
	 */
	getParamValue : function(param, url){
		var queryObj = (url)? this.toQueryObject(url) : this.getQueryObject();
		return queryObj[param];
	},
	
	/**
	 * Checks if query contains parameter.
	 * @param {String} param	Parameter name.
	 * @param {String} [url]	URL to be parsed, default to location.href
	 * @return {Boolean} If parameter exist.
	 */
	hasParam : function(param, url){
		return (this.getQueryString(url).indexOf(param+'=') >= 0);
	},
	
	/**
	 * Converts object into query string.
	 * @param {Object} obj	Object with "params => values" pairs.
	 * @return {String}	Formated query string starting with '?'.
	 */
	toQueryString : function(obj){
		var query = [],
			param;
		for(param in obj){
			query.push(param +'='+ obj[param]);
		}
		return (query.length)? '?'+ query.join('&') : '';
	}
	
};