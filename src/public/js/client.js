// Adapted from SpatioTemporal Narrative code. 
// This entrypoint provides only one functionality: **Asynchronous Module Loading**. This is a poor man's Require.js. 
// This script loader is built for easy debugging - it doesn't provide any real modules, it just loads the defined set of scripts.
// Currently it enforces an order on scripts - it completely loads one script before the next one is started, again making development easier.

// Cache buster appends a random string to each script request, which makes sure
// scripts doesn't get cached. This is useful for development and killer for production!
// We create an immediately evaluated anonymous function to wrap the local state.
var cacheBustify = (function(defaultVal) {
  var today = new Date();
  var cachebuster = Math.round(Math.random()*10000000000000000);
  
  return function(src, overrideDefault) {
    if (   (overrideDefault !== undefined && overrideDefault == true)
        || (defaultVal && overrideDefault == undefined)) {
        return src + ("?cb=" + cachebuster);
    } else {
      return src;
    }
  }
  
})(true);

//The queue stores all elements to load.
var queue = [];


//requireScript creates a script tag with the given source, and adds it to the queue of scripts waiting to be loaded.
var requireScript = function(src, bustCache) {
  src = cacheBustify(src,bustCache);
  var jsElement=document.createElement('script')
  jsElement.setAttribute('type','text/javascript');
  jsElement.setAttribute('charset','utf-8');  
  jsElement.setAttribute('src', src);
  queue.push({type:'js', elem:jsElement});
}

//Here we asynchronously load every script one after another.
//We register listener for a script to complete loading, which triggers the next script's load.
var loadAll = function() {

  function loadNext() {
    if (queue.length > 0) {

      //Get an element from the queue of scripts waiting to be loaded
      var q = queue.shift();
      var elem = q.elem;
      var isCSS = q.type == 'css';
      var isLess = q.type == 'less';
  
      console.log("Loading", elem.getAttribute('src'));

      //Register this function to run when the script is done, and add it to the document. The appendChild has the effect of starting the script load.
      elem.onload = loadNext;          
      document.getElementsByTagName("head")[0].appendChild(elem);   
  
    }
  }
  loadNext();
  
}

// ### Order Matters
// It is up to you to linearize your dependencies (or handle them in a fancy way), 
// we load scripts in the order defined here:

// ### Libaries

//jQuery simplifies working with the DOM
requireScript("/public/jslibs/jquery-2.0.2.min.js",   false);

requireScript("/public/jslibs/jquery-ui.min.js",      false);

requireScript("/public/jslibs/jquery.ui.touch-punch.min.js",      false);


//Underscore provides functional programming for javascript
requireScript('/public/jslibs/underscore-min.js',     false);

//Backbone provides a simple router, event, model and view system
requireScript('/public/jslibs/backbone-min.js',       false);

//Async provides functional programming abstractions to work with asynchronous calls
requireScript('/public/jslibs/async.js',              false);

//Base64 provides methods useful for doing data-uri encoding.
requireScript('/public/jslibs/Base64.js',             false);

//HammerJS provides multi-touch gesture recognition functionality. 
requireScript('/public/jslibs/hammer-min.js',         false);


//requireScript('http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML',       false);

// ### App modules
requireScript('/public/js/Expressions.js');
requireScript('/public/js/Parsers.js');
requireScript('/public/js/Mutations.js');
requireScript('/public/js/Transformations.js');
requireScript('/public/js/Interactions.js');
requireScript('/public/js/Targets.js');
requireScript('/public/js/IdentityRewrites.js');
requireScript('/public/js/OperationRewrites.js');

requireScript('/public/js/test.js');

//Kick off loading the scripts one by one.
loadAll();