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
  var poly = "( = y ( + (* 40 (pow x 2) ) ( - (* 12 (pow x 3) ) ) 20 ) )"; 

  var factor = "( = y ( + (* 40 (pow x 2) (pow y 3) (pow n 6)) ( - (* 12 (pow x 3) (pow y 2) (pow n 5)) ) (* 20 x (pow y 2) (pow n 5)) ) )"; 

  var distribute = "( = y ( + (- 50) ( * 10 ( + (* 9 (pow x 2) ) (* 7 x) 4))))"; 
  var distribute2 = "( = y  ( * (+ 10 x) ( + (* 9 (pow x 2) ) (* 7 x) 4)))";
  var test1 = "(= (/ (+ 100 (- (* 4 x))) 3) (+ (/ (+ (* 5 x) 6) 4) 6))";
  var test2 = "(= (+ (/ 6 x) (- (/ 2 (+ x 3)))) (/ (* 3 (+ x 5)) (+ (pow x 2) (* 3 x))))";
  var test3 = "(= (log 3 4) (/ 2 5))";
  var test4 = "(= (+ (* 2 (tan x)) (- 1)) 0)";
  var test5 = "(= (+ (pow (sec x) 4) (- (* 3 (pow (sec x) 2))) (- 4)) 0)";
  var test6 = "(= (abs (+ (pow (sec x) 4) (- (* 3 (pow (sec x) 2))) (- 4))) 0)";


  var parsed1 = Parser.StringToTree(test1);
  var parsed2 = Parser.StringToTree(test2);
  var parsed3 = Parser.StringToTree(test3);

  var test1Parsed = Parser.StringToTree(test);



  var mathDiv = document.getElementById("mathDisplay"); 

  currentExp = Parser.StringToTree(factor);

  var texObj = Parser.TreeToTex(currentExp, true);

  texStr = texObj.texString; 

  texMap = texObj.texMap; 

  mathDiv.innerHTML += texStr; 

  mathDiv.ontouch = mathDiv.onclick = function (event) {
    if (!event) { event = window.event }
    var selected = event.toElement || event.target;
    while (selected && !selected.id) { 
      selected = selected.parentNode;  
    }

    console.log("Found CSS ID: ");
    console.log(selected);  

    while (selected.id && !texMap[selected.id]) { 
      selected = selected.parentNode; 
    }

    console.log("Found texMap: "); 
    console.log(texMap[selected.id]); 

    console.log("Before shared parent: ")
    console.log(sharedParent); 
    if (texMap[selected.id]) {
      if (sharedParent == null) {
        sharedParent = texMap[selected.id]; 
      } else {
        sharedParent = findSharedParent(sharedParent, texMap[selected.id]); 
      }

      console.log("After shared parent: "); 
      console.log(sharedParent); 

      // Pow selection
      if (sharedParent.parent &&
          sharedParent.parent.val == "pow") {
        sharedParent = sharedParent.parent; 
      }

      // Neg selection
      if (sharedParent.parent &&
          sharedParent.parent.val == "neg") {
        sharedParent = sharedParent.parent; 
      }

      colorTreeTex(sharedParent, "red"); 
      clearTargets(); 
      for (var func in testTransforms) {
        testTransforms[func](sharedParent); 
      }
    }
  }; 

/*
  var hammertime = Hammer(mathDiv).on("pinchin", function(event) {
    if (!event) { event = window.event }
    var selected = event.toElement || event.target;
    while (selected && !selected.id) { 
      selected = selected.parentNode;  
    }

    while (selected.id && !texMap[selected.id]) { 
      selected = selected.parentNode; 
    }


    if (texMap[selected.id]) {
      selections[selected.id] = texMap[selected.id]; 
      selections[selected.id].selected = true; 
      if (sharedParent == null) {
        sharedParent = selections[selected.id]; 
      } else {
        sharedParent = findSharedParent(sharedParent, selections[selected.id]); 
      }

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

    var pinchDiv = document.getElementById("pinched"); 
    pinchDiv.innerHTML = sharedParent.val; 
  }); 
*/

  var dragDiv = null; 

  var hammertime = Hammer(mathDiv).on("dragstart", function(event) {

    event.gesture.preventDefault(); 

    colorTreeTex(sharedParent, "white"); 

    dragDiv = document.createElement("div");
    dragDiv.id = "dragDiv"; 
    dragDiv.innerHTML = Parser.TreeToTex(sharedParent).texString;  
    dragDiv.style.position = "absolute"; 
    dragDiv.style.top = event.gesture.center.pageY - (dragDiv.offsetHeight / 2); 
    dragDiv.style.left = event.gesture.center.pageX - (dragDiv.offsetWidth / 2); 
    dragDiv.style.color = "red"; 

    var body = document.getElementsByTagName("body")[0]; 
    body.appendChild(dragDiv); 

    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

  }); 

  hammertime.on("drag", function(event) {
    dragDiv.style.top = event.gesture.center.pageY - (dragDiv.offsetHeight / 2);  
    dragDiv.style.left = event.gesture.center.pageX - (dragDiv.offsetWidth / 2); 
  }); 


  hammertime.on("dragend", function(event) {
    dragDiv.parentNode.removeChild(dragDiv); 
    
    if (targets.length == 0) {
      colorTreeTex(sharedParent, "red"); 
      // MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
      return; 
    }

    var container = document.getElementById("container"); 

    var eventX = event.gesture.center.pageX - container.offsetLeft; 
    var eventY = event.gesture.center.pageY - container.offsetTop; 

    var minDist = null; 
    var closestTarget = null; 

    for (var i = 0; i < targets.length; i++) {

      var diffX = 0; 
      var diffY = 0; 

      if (eventX > targets[i].offsetLeft) {
        diffX = eventX - targets[i].offsetLeft;
      } else {
        diffX = targets[i].offsetLeft - eventX;
      }
      if (eventY > targets[i].offsetTop) {
        diffY = eventY - targets[i].offsetTop; 
      } else {
        diffY = targets[i].offsetTop - eventY; 
      }

      var dist = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)); 
      console.log(dist); 
      if (minDist == null ||
          dist < minDist) {
        minDist = dist; 
        closestTarget = targets[i]; 
      }
    }

    var index = targets.indexOf(closestTarget); 
    var func = targetFuncs[index]; 
    func(event); 
  });


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



  var historyDiv1 = document.getElementById("history1"); 
  historyDiv1.ontouch = 
  historyDiv1.onclick = function(event) {
    var toStore = currentExp.clone(false); 
    history.push(toStore); 
    var histIndex = Math.max(0, history.length - 4); 
    render(history[histIndex]); 
  }

  var historyDiv2 = document.getElementById("history2"); 
  historyDiv2.ontouch = 
  historyDiv2.onclick = function(event) {
    var toStore = currentExp.clone(false); 
    history.push(toStore); 
    var histIndex = Math.max(0, history.length - 3); 
    render(history[histIndex]); 
  }

  var historyDiv3 = document.getElementById("history3"); 
  historyDiv3.ontouch = 
  historyDiv3.onclick = function(event) {
    var toStore = currentExp.clone(false); 
    history.push(toStore); 
    var histIndex = Math.max(0, history.length - 2); 
    render(history[histIndex]); 
  }



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