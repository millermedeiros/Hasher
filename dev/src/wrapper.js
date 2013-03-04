//::LICENSE:://
(function (define) {
    define(['signals'], function(signals){

//::HASHER:://

        return hasher;
    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    window.hasher = factory(window[deps[0]]);
}));
