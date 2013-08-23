$(document).ready(function(event) {

  function configMathJax() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src  = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";

    var config =  'MathJax.Hub.Config({' +
                  'tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]},' +
                  '"HTML-CSS": { scale: 300 }' +
                  '});' +
                  'MathJax.Hub.Startup.onload();';

    if (window.opera) { script.innerHTML = config; }
     else { script.text = config }

    document.getElementsByTagName("head")[0].appendChild(script);
  }

  configMathJax(); 


  var test = "( = y ( / ( exp ( / ( - ( pow ( + x ( - \\mu ) ) 2 ) ) ( * 2 ( pow \\sigma 2 ) ) ) ) ( * \\sigma ( pow ( * 2 \\pi ) ( / 1 2 ) ) ) ) )"; 
  var poly = "( = y ( + (* 4 (pow x 2) ) ( - (* 9 (pow x 3) ) ) 14 ) )"; 

  var distribute = "( = y ( + (- 50) ( * 10 ( + (* 9 (pow x 2) ) (* 7 x) 4))))"; 
  var distribute2 = "( = y  ( * (+ 10 x) ( + (* 9 (pow x 2) ) (* 7 x) 4)))";
  var test1 = "(= (/ (+ 100 (- (* 4 x))) 3) (+ (/ (+ (* 5 x) 6) 4) 6))";
  var test2 = "(= (+ (/ 6 x) (- (/ 2 (+ x 3)))) (/ (* 3 (+ x 5)) (+ (pow x 2) (* 3 x))))";
  var test3 = "(= (log 3 4) (/ 2 5))";
  var test4 = "(= (+ (* 2 (tan x)) (- 1)) 0)";
  var test5 = "(= (+ (pow (sec x) 4) (- (* 3 (pow (sec x) 2))) (- 4)) 0)";
  var test6 = "(= (abs (+ (pow (sec x) 4) (- (* 3 (pow (sec x) 2))) (- 4))) 0)";


  var parsed = Parser.StringToTree(poly);

  var mathDiv = document.getElementById("mathDisplay"); 

  var test1Parsed = Parser.StringToTree(test);

  var texObj = Parser.TreeToTex(parsed, true); 

  mathDiv.innerHTML = texObj.texString; 

  var texMap = texObj.texMap; 

  var sharedParent = null; 


  mathDiv.ontouch = mathDiv.onclick = function (event) {
    if (!event) { event = window.event }
    var selected = event.toElement || event.target;
    while (selected && !selected.id) { 
      console.log("No id: "); 
      console.log(selected); 
      selected = selected.parentNode;  
    }

    while (selected.id && !texMap[selected.id]) { 
      console.log("No TeX map: "); 
      console.log(selected); 
      selected = selected.parentNode; 
    }

    console.log("Found TeX map: "); 
    console.log(texMap[selected.id]); 

    if (texMap[selected.id]) {
      selections[selected.id] = texMap[selected.id]; 
      selections[selected.id].selected = true; 
      if (sharedParent == null) {
        console.log("NULL PARENT RESET"); 
        sharedParent = selections[selected.id]; 
      } else {
        console.log("NEW SHARED PARENT"); 
        sharedParent = findSharedParent(sharedParent, selections[selected.id]); 
      }

      console.log("Shared parent:"); 
      console.log(sharedParent); 

      // Pow selection
      if (sharedParent.parent.val == "pow") {
        sharedParent = sharedParent.parent; 
      }

      // Neg selection
      if (sharedParent.parent.val == "neg") {
        sharedParent = sharedParent.parent; 
      }

      colorTreeTex(sharedParent, "red"); 
      clearTargets(); 
      for (var func in testTransforms) {
        testTransforms[func](sharedParent); 
      }
    }
  }; 


    var clearButton = document.getElementById("clear"); 
    clearButton.onclick = 
    clearButton.ontouch = function(event) {
      colorTreeTex(sharedParent, "black"); 
      for (var id in selections) {
        selections[id].selected = false; 
      }
      selections = {}; 

      clearTargets(); 

      sharedParent = null; 
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