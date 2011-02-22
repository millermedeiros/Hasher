/*global hasher:true*/

/*!!
 * Hasher string utilities plugin
 * @author Miller Medeiros
 * @version 0.1 (2011/02/22)
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
 
/**
 * Replaces spaces with hyphens, split camel case text, remove non-word chars and remove accents.
 * - based on Miller Medeiros JS Library -> millermedeiros.stringUtils.hyphenate
 * @example hasher.hyphenate('Lorem Ipsum  ?#$%^&*  spéçïãlChârs') -> 'Lorem-Ipsum-special-chars'
 * @param {string} str	String to be formated.
 * @return {string}	Formated String
 */
hasher.hyphenate = function(str){
	str = str || '';
	str = str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '') //remove non-word chars
			.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') //add space between camelCase text
			.replace(/ +/g, '-'); //replace spaces with hyphen
	return this.removeAccents(str);
};
		
/**
 * Replaces all accented chars with regular ones
 * - based on Miller Medeiros JS Library -> millermedeiros.stringUtils.replaceAccents
 * @example hasher.removeAccents('Lorem Ipsum  ?#$%^&*  spéçïãlChârs') -> 'Lorem Ipsum  ?#$%^&*  specialChars'
 * @param {string} str	String to be formated.
 * @return {string}	Formated String
 */
hasher.removeAccents = function(str){
	str = str || '';
	// verifies if the String has accents and replace accents
	if(str.search(/[\xC0-\xFF]/g) > -1){
		str = str.replace(/[\xC0-\xC5]/g, "A")
				.replace(/[\xC6]/g, "AE")
				.replace(/[\xC7]/g, "C")
				.replace(/[\xC8-\xCB]/g, "E")
				.replace(/[\xCC-\xCF]/g, "I")
				.replace(/[\xD0]/g, "D")
				.replace(/[\xD1]/g, "N")
				.replace(/[\xD2-\xD6\xD8]/g, "O")
				.replace(/[\xD9-\xDC]/g, "U")
				.replace(/[\xDD]/g, "Y")
				.replace(/[\xDE]/g, "P")
				.replace(/[\xDF]/g, "B")
				.replace(/[\xE0-\xE5]/g, "a")
				.replace(/[\xE6]/g, "ae")
				.replace(/[\xE7]/g, "c")
				.replace(/[\xE8-\xEB]/g, "e")
				.replace(/[\xEC-\xEF]/g, "i")
				.replace(/[\xF0]/g, "D")
				.replace(/[\xF1]/g, "n")
				.replace(/[\xF2-\xF6\xF8]/g, "o")
				.replace(/[\xF9-\xFC]/g, "u")
				.replace(/[\xFE]/g, "p")
				.replace(/[\xFD\xFF]/g, "y");
	}
	return str;
};