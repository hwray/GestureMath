$(document).ready(function(event) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src  = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";

    var config = 'MathJax.Hub.Config({' +
                 'tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]},' +
                 '"HTML-CSS": { scale: 300 }' +
               '});' +
               'MathJax.Hub.Startup.onload();';

  if (window.opera) {script.innerHTML = config}
               else {script.text = config}

  document.getElementsByTagName("head")[0].appendChild(script);

    var test = "( = y ( / ( exp ( / ( - ( pow ( + x ( - \\mu ) ) 2 ) ) ( * 2 ( pow \\sigma 2 ) ) ) ) ( * \\sigma ( pow ( * 2 \\pi ) ( / 1 2 ) ) ) ) )"; 

    var poly = "( = y ( + (* 4 (pow x 2) ) (* 9 (pow x 3) ) 14 ) )"; 

    var distribute = "( = y ( + 50 ( * 10 ( + (* 9 (pow x 2) ) (* 7 x) 4))))"; 

    var test2 = "( * 2 4)";

    //var tokens = Parser.tokenize("( = z ( / y ( + x 2 ) ) )"); 
    var parsed = Parser.StringToTree(distribute);


/*
    function testAssert(value, message) {
      console.log(message, value ? "PASSED" : "FAILED");
    }
    function testAssertFalse(value, message) {
      console.log(message, value ? "FAILED" : "PASSED");
    }

    var eqTest1 = Parser.StringToTree("( = 90 ( / y ( + ( * 10 x 14 ) 2 \\pi ) )"); 
    var eqTest2 = Parser.StringToTree("( = ( / ( + \\pi 2 ( * x 14 10 ) ) y ) 90 "); 
    testAssertFalse(eqTest1.equals(eqTest2), "Equality (frac NOT commutative)" ); 

    eqTest1 = Parser.StringToTree("( = 90 ( * y ( + ( * 10 x 14 ) 2 \\pi ) )"); 
    eqTest2 = Parser.StringToTree("( = ( * ( + \\pi 2 ( * x 14 10 ) ) y ) 90 "); 

    testAssert(eqTest1.equals(eqTest2), "Equality (mult commutativity)" ); 
    */

    var mathDiv = document.getElementById("mathDisplay"); 
     
    var test1Parsed = Parser.StringToTree(test);

    var texObj = Parser.TreeToTex(parsed, true); 

    mathDiv.innerHTML = texObj.texString; 

    var texMap = texObj.texMap; 

    var sharedParent = null; 


    // Add selected field to expression tree nodes upon being clicked? 
    mathDiv.ontouch = mathDiv.onclick = function (event) {
      if (!event) { event = window.event }
      var selected = event.toElement || event.target;
      while (selected && !selected.id) { selected = selected.parentNode }

      if (selections[selected.id]) {
        selected.style.color = "white"; 
        delete selections[selected.id]; 
      } else {
        selected.style.color = "red"; 
        selections[selected.id] = texMap[selected.id]; 
        selections[selected.id].selected = true; 
        if (sharedParent == null) {
          sharedParent = selections[selected.id]; 
        } else {
          sharedParent = findSharedParent(sharedParent, selections[selected.id]); 
        }
      }

      colorTreeTex(sharedParent, "red"); 

      for (var func in testTransforms) {
        if (testTransforms[func](sharedParent)) {
          var button = document.getElementById(func); 
          button.disabled = false; 
        } 
      }

      console.log(sharedParent); 
    }; 


    var clearButton = document.getElementById("clear"); 
    clearButton.onclick = 
    clearButton.ontouch = function(event) {
      colorTreeTex(sharedParent, "#000"); 
      for (var id in selections) {
        selections[id].selected = false; 
      }
      selections = {}; 
      sharedParent = null; 
    }; 

    var commuteButton = document.getElementById("canCommute"); 
    commuteButton.onclick = 
    commuteButton.ontouch = function(event) {

    }; 

    var subtractOverButton = document.getElementById("canSubtractOverEquals"); 
    subtractOverButton.onclick = 
    subtractOverButton.ontouch = function(event) {

    }; 

    var divideOverButton = document.getElementById("canDivideOverEquals"); 
    divideOverButton.onclick = 
    divideOverButton.ontouch = function(event) {

    }; 

    var distributeButton = document.getElementById("canDistribute"); 
    distributeButton.onclick = 
    distributeButton.ontouch = function(event) {
      Transforms.distribute(); 
    }; 

    var factorButton = document.getElementById("canFactor"); 
    factorButton.onclick = 
    factorButton.ontouch = function(event) {

    }; 






    var x = new Var("x");
    var xInstances = test1Parsed.searchForTreeMatches(x);
    
    var createNeg = function(child) {
      var neg = new Oper("neg", [child]);
      return neg;
    }
    for (var i = 0; i < xInstances.length; i++) {
      Mutations.swapInExp(xInstances[i], createNeg);  
    }
   


}); 