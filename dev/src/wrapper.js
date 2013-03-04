//::LICENSE:://
(function (define) {
    define(['signals'], function(signals){

//::HASHER:://

        return hasher;
    });
}(typeof define === 'function' && define.amd ? define : function (id, deps, factory) {
    window[id] = factory(window[deps[0]]);
}));
