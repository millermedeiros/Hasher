/**
 * MM.queryUtils
 * - utilities for query string manipulation
 * @author Miller Medeiros <http://www.millermedeiros.com/>
 * @version 0.2 (2010/04/24)
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
	 * @return {String}	Query string without starting '?'.
	 */
	getQueryString : function(){
		return decodeURIComponent(location.search.substring(1));
	},
	
	/**
	 * Gets query as Object.
	 * @return {Object}	Object with all the query "params => values" pairs.
	 */
	getQueryObject : function(){
		var queryArr = this.getQueryString().split('&'), 
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
	 * @return {String}	Parameter value.
	 */
	getParamValue : function(param){
		return this.getQueryObject()[param];
	},
	
	/**
	 * Checks if query contains parameter.
	 * @param {String} param	Parameter name.
	 * @return {Boolean} If parameter exist.
	 */
	hasParam : function(param){
		return (this.getQueryString().indexOf(param+'=') >= 0);
	},
	
	/**
	 * Converts object into query string.
	 * @param {Object} obj	Object with "params => values" pairs.
	 * @return {String}	Formated query string starting with '?'.
	 */
	toQueryString : function(obj){
		var query = [];
		for(var param in obj){
			query.push(param +'='+ obj[param]);
		}
		return (query.length)? '?'+ query.join('&') : '';
	}
	
};