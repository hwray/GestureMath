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
  var poly = "( = y ( + (* 4 (pow x 2) ) (* 9 (pow x 3) ) 14 ) )"; 
  var distribute = "( = y ( + 50 ( * 10 ( + (* 9 (pow x 2) ) (* 7 x) 4))))"; 


  var parsed = Parser.StringToTree(distribute);



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
      delete selections[selected.id]; 
    } else {
      selections[selected.id] = texMap[selected.id]; 
      selections[selected.id].selected = true; 
      if (sharedParent == null) {
        sharedParent = selections[selected.id]; 
      } else {
        sharedParent = findSharedParent(sharedParent, selections[selected.id]); 
      }
    }

    colorTreeTex(sharedParent, "red"); 

    clearTargets(); 

    for (var func in testTransforms) {
      testTransforms[func](sharedParent); 
    }

    console.log(sharedParent); 
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