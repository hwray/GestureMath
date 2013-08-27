var selections = {}; 

function findSharedParent(exp1, exp2) {
  var exp1_depth = 0;
  var exp2_depth = 0;
  var exp1_pointer = exp1;
  var exp2_pointer = exp2;

  while (exp1_pointer.parent || exp2_pointer.parent) {
    if (exp1_pointer.parent) {
      exp1_pointer = exp1_pointer.parent;
      exp1_depth++;
    }
    if (exp2_pointer.parent) {
      exp2_pointer = exp2_pointer.parent;
      exp2_depth++;
    }  
  }

  var deeper = null;
  var shallower = null;
  var depthDiff = Math.abs(exp1_depth - exp2_depth);

  if (exp1_depth > exp2_depth) {
    deeper = exp1;
    shallower = exp2;
  } else {
    deeper = exp2;
    shallower = exp1;
  }

  for (var i = 0; i < depthDiff; i++) {
    deeper = deeper.parent;
  }

  while (deeper !== shallower) {
    deeper = deeper.parent; 
    shallower = shallower.parent; 
  }
  return deeper; 
} 

function colorTreeTex(tree, color) {
  var idArr = new Array(); 
  if (tree.idArr) {
    idArr = tree.idArr; 
  } else {
    idArr.push(tree.id);
  }

  for (var i = 0; i < idArr.length; i++) {
    var div = document.getElementById(idArr[i]); 
    if (div != null) {
      div.style.color = color;  
    }
  }

  if (tree.children) {
    for (var i = 0; i < tree.children.length; i++) {
      colorTreeTex(tree.children[i], color); 
    }
  }
}




var mathDiv = document.getElementById("mathDisplay"); 

var hammertime = Hammer(mathDiv); 

hammertime.on("tap", function(event) {

  if (!event) { event = window.event }
  var selected = event.toElement || event.target;
  while (selected && !selected.id) { 
    selected = selected.parentNode;  
  }

  while (selected.id && !texMap[selected.id]) { 
    selected = selected.parentNode; 
  }

  if (texMap[selected.id]) {

    if (texMap[selected.id].type == "OPER") {


      var node = texMap[selected.id]; 
      var idArr = node.idArr; 
      var index = idArr.indexOf(selected.id) * 2; 

      var toStore = currentExp.clone(false); 
      history.push(toStore); 

      for (var id in Identities) {
        var rewrites = Identities[id].getPossibleRewrites(node);
        if (rewrites) {
          if (rewrites.length === 1) {
            Mutations.replaceExp(node, rewrites[0]);
          }
        }
      }

      node = node.validOpers[node.val].simpOp(node, { childIndex: index }); 
      node = node.getTopMostParent(); 

      render(node); 

      return; 
    }

    if (sharedParent == null) {
      sharedParent = texMap[selected.id]; 
    } else {
      sharedParent = findSharedParent(sharedParent, texMap[selected.id]); 
    }

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
}); 


var dragDiv = null; 

hammertime.on("dragstart", function(event) {

  event.gesture.preventDefault(); 

  colorTreeTex(sharedParent, "white"); 

  dragDiv = document.createElement("div");
  dragDiv.id = "dragDiv"; 
  dragDiv.innerHTML = Parser.TreeToTex(sharedParent.clone(false)).texString;  
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
    if (minDist == null ||
        dist < minDist) {
      minDist = dist; 
      closestTarget = targets[i]; 
    }
  }

  if (minDist < 200) {
    var index = targets.indexOf(closestTarget); 
    var func = targetFuncs[index]; 
    func(event); 
  } else {
    colorTreeTex(sharedParent, "red"); 
  }
});


// Double-tap to show, drag to target to do? 
// Pinch-out to show, drag to do target to do? 
hammertime.on("doubletap", function(event) {
  // THIS RAISES CONSOLE ERRORS (STOPS GESTURE DETECTION)
  // BUT WE NEED IT FOR NOW
  event.gesture.stopDetect(); 
  clearTargets(); 
  canFactor(sharedParent); 
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
  if (history.length < 1) {
    clearSelections(); 
    return; 
  }
  var toStore = currentExp.clone(false); 
  history.push(toStore); 
  var histIndex = Math.max(0, history.length - 4); 
  render(history[histIndex]); 
}

var historyDiv2 = document.getElementById("history2"); 
historyDiv2.ontouch = 
historyDiv2.onclick = function(event) {
  if (history.length < 2) {
    clearSelections(); 
    return; 
  }
  var toStore = currentExp.clone(false); 
  history.push(toStore); 
  var histIndex = Math.max(0, history.length - 3); 
  render(history[histIndex]); 
}

var historyDiv3 = document.getElementById("history3"); 
historyDiv3.ontouch = 
historyDiv3.onclick = function(event) {
  if (history.length < 3) {
    clearSelections(); 
    return; 
  }
  var toStore = currentExp.clone(false); 
  history.push(toStore); 
  var histIndex = Math.max(0, history.length - 2); 
  render(history[histIndex]); 
}


function clearSelections() {
  clearTargets(); 
  colorTreeTex(sharedParent, "black"); 
  sharedParent = null; 
}