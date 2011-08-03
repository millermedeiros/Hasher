/*jshint white:false, onevar:false, boss:true, noarg:false */
/*global test:false, stop:false, ok:false, hasher:false, module:false, equals:false, expect:false, start:false, same:false, console:false */

/*
 * 
 *      Hasher JS Unit test
 *      
 *      
 *      -----------------------------------------------------------------------
 * 
 *      WARNING: 
 *          - poor code ahead!
 *          - don't use as reference!
 * 
 *      ----------------------------------------------------------------------- 
 * 
 *      IMPORTANT: 
 *          - unit test doesn't work properly on Chrome <= 6 because of browser bug:
 *            http://code.google.com/p/chromium/issues/detail?id=45419
 * 
 *      -----------------------------------------------------------------------
 * 
 */

var DELAY_BACK_FORWARD = 50;
var TIMEOUT_BACK_FORWARD = 200;

location.hash = ''; //resets location.hash


/* ==== init hasher test ==== */

test("init hasher", function(){
    stop(2000);
    expect(4);
    
    ok(! hasher.initialized.getNumListeners(), "No INIT Listener");
    
    hasher.initialized.add(function(){              
        ok(true, "INIT dispatched");
        
        hasher.initialized.remove(arguments.callee);
        ok(! hasher.initialized.getNumListeners(), "Removed INIT Listener");
        
        start();
    });
    
    ok(hasher.initialized.getNumListeners(), "Added INIT Listener");
    
    hasher.init();
});

/* == */

/* ==== prep code ==== */

var testsHashs = [
    'foo',
    'dolor',
    'sit-amet/ipsum/?dolor=ipsum&maecennas=ullamcor',
    'Spëçíãl Çhàrs FTW',
    '/asd', 
    '/asd/qwerty/',
    '/asd/qwerty/?foo=bar',
    'lorem-ipsum'
];


/* ==== set/get hash value ==== */

module('set/get hash value');


function doChangeTest(i){
    
    var testName = '#'+ (i + 1);
    
    var hash = testsHashs[i];
    var oldHash = (i > 0)? testsHashs[i - 1] : '';
    
    test(testName, function(){
        stop(2000);
        expect(9);
        
        hasher.initialized.removeAll();
        hasher.stopped.removeAll();
        hasher.changed.removeAll();
        
        ok(! hasher.changed.getNumListeners(), "No CHANGED Listener");
        
        hasher.changed.add(function($newHash, $oldHash){
            ok(true, "CHANGED dispatched");

            ok(($oldHash !== hasher.getHash()), "Hash value really changed.");
            
            hasher.changed.removeAll();
            ok( ! hasher.changed.getNumListeners(), "Removed CHANGED Listener");
            
            equals($oldHash, oldHash, "oldHash");
            equals(hasher.getHash(), $newHash, "newHash == hasher.getHash()");
            
            start();
        });
        
        ok(hasher.changed.getNumListeners(), "Attached CHANGED Listener");
        
        hasher.setHash(hash);
        equals(hasher.getHash(), hash, "hasher.setHash() & hasher.getHash()");
        
        var hashArray = hash.split('/');
        
        same(hasher.getHashAsArray(), hashArray, "hasher.getHashAsArray()");
        
    });
    
}

for(var i=0, t=testsHashs.length; i<t; i++){
    doChangeTest(i);
}

/* == */

/* ==== back ==== */

module('back');


function doBackTest(n){
    
    var testName = '#'+(n+1);
    
    var hash = testsHashs[n];
    
    var testFn = function(){
        stop((n+1) * TIMEOUT_BACK_FORWARD);
        expect(7);
        
        hasher.initialized.removeAll();
        hasher.stopped.removeAll();
        hasher.changed.removeAll();
        
        ok(!hasher.changed.getNumListeners(), "No CHANGED Listener");
        
        hasher.changed.add(function($newHash, $oldHash){
        
            ok(true, "CHANGED dispatched");
            
            hasher.changed.remove(arguments.callee);
            ok(!hasher.changed.getNumListeners(), "Removed CHANGED Listener");

            equals(hasher.getHash(), $newHash, "newHash == hasher.getHash()");
            equals(hasher.getHash(), hash, "hasher.getHash()");
            
            var hashArray = hash.split('/');
            
            same(hasher.getHashAsArray(), hashArray, "hasher.getHashAsArray()");
            
            start();
            
        });
        
        ok(hasher.changed.getNumListeners(), "Attached CHANGED Listener");
        
        setTimeout(function(){
            window.history.back();
        }, n * DELAY_BACK_FORWARD);
    };
    
    test(testName, testFn);
}

var n = testsHashs.length - 1;

while(n--){
    doBackTest(n);
}

/* == */


/* ==== forward ==== */

module('forward');


function doForwardTest(n){
    
    var testName = '#'+(n+1);
    
    var hash = testsHashs[n];
    
    var testFn = function(){
        stop((n+1) * TIMEOUT_BACK_FORWARD);
        expect(7);
        
        hasher.initialized.removeAll();
        hasher.stopped.removeAll();
        hasher.changed.removeAll();
        
        ok(!hasher.changed.getNumListeners(), "No CHANGED Listener");
        
        hasher.changed.add(function($newHash, $oldHash){
        
            ok(true, "CHANGED dispatched");
            
            hasher.changed.remove(arguments.callee);
            ok(!hasher.changed.getNumListeners(), "Removed CHANGED Listener");
            
            equals(hasher.getHash(), $newHash, "newHash == hasher.getHash()");
            equals(hasher.getHash(), hash, "hasher.getHash()");
            
            var hashArray = hash.split('/');
            
            same(hasher.getHashAsArray(), hashArray, "hasher.getHashAsArray()");
            
            start();
            
        });
        
        ok(hasher.changed.getNumListeners(), "Attached CHANGED Listener");
        
        setTimeout(function(){
            window.history.forward();
        }, n * DELAY_BACK_FORWARD);
    };
    
    test(testName, testFn);
}

for(i=1; i < testsHashs.length; i++){
    doForwardTest(i);
}

/* == */

/* ==== init and stop ==== */
			
module('init and stop');

var stopTest = function(){
    stop(2000);
    expect(5);
   
    hasher.init(); // should be active to be able to stop

    ok(hasher.isActive(), "Is active");
    ok(! hasher.stopped.getNumListeners(), "No STOP Listener");
    
    hasher.stopped.add(function(evt){
        
        ok(true, "STOP dispatched");
        
        hasher.stopped.remove(arguments.callee);
        
        ok(! hasher.stopped.getNumListeners(), "Removed STOP Listener");
        
        start();
    });
    
    ok(hasher.stopped.getNumListeners(), "Attached STOP Listener");
    hasher.stop();
};

var stopFailTest = function(){
    stop(2000);
    expect(5);

    hasher.stop(); //shouldn't be active
    
    ok(! hasher.isActive(), "Is not active");
    ok(! hasher.stopped.getNumListeners(), "No STOP Listener");
    
    var handler = function(evt){
        ok(false, "STOP dispatched"); //shouldn't happen
        hasher.stopped.removeAll();
        start();
    };
    hasher.stopped.add(handler);
    
    ok(hasher.stopped.getNumListeners(), "Attached STOP Listener");
    hasher.stop();
    hasher.stop();
    
    var delayedStart = function(){
        ok(true, 'Didn\'t dispatched STOP event.');
        hasher.stopped.removeAll();
        ok(! hasher.stopped.getNumListeners(), "Removed STOP Listener");
        start();
    };
    
    setTimeout(delayedStart, 100);
};

var initTest = function(){
    stop(2000);
    expect(6);
    
    hasher.stop(); //shouldn't be active

    ok(! hasher.isActive(), "Is not active");
    ok(! hasher.initialized.getNumListeners(), "No INIT Listener");
    
    hasher.initialized.add(function(evt){
        ok(hasher.isActive(), "Is active");
        ok(true, "INIT dispatched");
        
        hasher.initialized.remove(arguments.callee);
        
        ok(! hasher.initialized.getNumListeners(), "Removed INIT Listener");
        
        start();
    });
    
    ok(hasher.initialized.getNumListeners(), "Attached INIT Listener");
    hasher.init();
};

var initFailTest = function(){
    stop(2000);
    expect(6);
    
    hasher.init(); //should be active

    ok(hasher.isActive(), "Is active");
    ok(! hasher.initialized.getNumListeners(), "No INIT Listener");
    
    var handler = function(evt){
        ok(false, "INIT dispatched"); //shouldn't happen
        hasher.initialized.removeAll();
        start();
    };
    hasher.initialized.add(handler);
    
    ok(hasher.initialized.getNumListeners(), "Attached INIT Listener");
    hasher.init();
    hasher.init();
    
    var delayedStart = function(){
        ok(true, 'Didn\'t dispatched INIT event.');
        ok(hasher.isActive(), "Is active");
        hasher.initialized.removeAll();
        ok(! hasher.initialized.getNumListeners(), "Removed INIT Listener");
        start();
    };
    
    setTimeout(delayedStart, 100);
};

test('stop #1', stopTest);
test('stop fail #1', stopFailTest);
test('stop fail #2', stopFailTest);
test('init #1', initTest);
test('init fail #1', initFailTest);
test('init fail #2', initFailTest);
test('stop #2', stopTest);
test('init #2', initTest);
test('stop #3', stopTest);

/* == */


/* ==== multiple listeners & changes ==== */


test('multiple listeners & changes', function (){
    
    stop(2000);
    expect(25);
    
    function handler1(evt){
        ok(true, 'Called Handler #1');
    }
    
    function handler2(evt){
        ok(true, 'Called Handler #2');
    }
    
    function handler3(evt){
        ok(true, 'Called Handler #3');
    }
    
    hasher.initialized.removeAll();
    hasher.stopped.removeAll();
    hasher.changed.removeAll();
    
    ok(!hasher.changed.getNumListeners(), "No CHANGED Listener");
    
    hasher.changed.add(handler1);
    hasher.changed.add(handler2);
    hasher.changed.add(handler3);
    
    ok(hasher.changed.getNumListeners(), "Has CHANGED Listener");
    
    hasher.setHash('Lorem');
    equals(hasher.getHash(), 'Lorem');
    
    hasher.setHash('Lorem/Ipsum');
    equals(hasher.getHash(), 'Lorem/Ipsum');
    
    hasher.setHash('Lorem/Dolor&Amet/?foo=bar&ipsum=dolor&n=123&nan=abc123');
    equals(hasher.getHash(), 'Lorem/Dolor&Amet/?foo=bar&ipsum=dolor&n=123&nan=abc123');
    
    
    hasher.setHash('?foo=bar&ipsum=dolor');
    equals(hasher.getHash(), '?foo=bar&ipsum=dolor');

    
    ok(! hasher.initialized.getNumListeners(), "No INIT Listener");
    hasher.initialized.add(function(e){
        ok(false, "INIT event dispatched by accident"); //shouldn't run
    });
    ok(hasher.initialized.getNumListeners(), "Has INIT Listener");
    
    
    ok(! hasher.stopped.getNumListeners(), "No STOP Listener");
    hasher.stopped.add(function(e){
        ok(false, "STOP event dispatched by accident"); //shouldn't run
    });
    ok(hasher.stopped.getNumListeners(), "Has STOP Listener");
    
    
    hasher.initialized.removeAll();
    ok(! hasher.initialized.getNumListeners(), "No INIT Listener");

    hasher.changed.removeAll();
    ok(! hasher.changed.getNumListeners(), "No CHANGED Listener");

    hasher.stopped.removeAll();
    ok(! hasher.stopped.getNumListeners(), "No STOP Listener");
    
    hasher.setHash(''); //resets hash value
    
    start();
    
});

/* == */
