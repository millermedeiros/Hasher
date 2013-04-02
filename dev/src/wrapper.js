//::LICENSE:://
;(function () {
var factory = function(signals){

//::HASHER:://

    return hasher;
};

if (typeof define === 'function' && define.amd) {
    define(['signals'], factory);
} else if (typeof exports === 'object') {
    module.exports = factory(require('signals'));
} else {
    /*jshint sub:true */
    window['hasher'] = factory(window['signals']);
}

}());
