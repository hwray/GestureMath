var selections = {}; 

var dragDiv = null; 


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


var eventTargets = [
  "mathDisplay", 
  "factors", 
  "history1", 
  "history2", 
  "history3"
]; 

function getEventTarget(elem) {
  var target = {
    elem: null, 
    texTarget: null
  }; 

  while (elem) { 
    if (elem.id &&
        eventTargets.indexOf(elem.id) != -1) {
      break; 
    }
    if (elem.id &&
        target.texTarget == null &&
        texMap[elem.id]) {
      target.texTarget = elem.id; 
    }
    elem = elem.parentNode; 
  }

  target.elem = elem; 

  return target; 
}


var hammertime = Hammer(document.body); 

hammertime.on("tap", function(event) {

  if (!event) { event = window.event }

  var target = event.toElement || event.target;

  var targetInfo = getEventTarget(target); 

  target = targetInfo.elem; 


  var texTarget = targetInfo.texTarget;  

  if (target &&
      target.id) {
    if (target.id == "mathDisplay") {
      if (texTarget &&
          texMap[texTarget]) {
        var node = texMap[texTarget]; 
        if (node.type == "OPER") {
          var index = null;
          if (node.val === "neg" && node.parent.val === "add" && node.parent.children.indexOf(node) > 0) {
            var parent = node.parent;
            index = parent.children.indexOf(node) - 1;
            node = parent;
          } else if (node.idArr) {
            var idArr = node.idArr; 
            var index = idArr.indexOf(texTarget) || 0;
          }
          if (index < 0) index = 0;
          if (index >= 0 && node.children[index]) {
            tapEvalOp(node, index); 
          }
        } else {
          tapMakeSelection(node); 
        }
      } else {
        clearSelections(); 
      }
    } else if (target.id == "factors") {
      clearSelections(); 
    } else if (target.id == "history1") {
      restoreHistory(1); 
    } else if (target.id == "history2") {
      restoreHistory(2); 
    } else if (target.id == "history3") {
      restoreHistory(3); 
    }
  } else {
    clearSelections(); 
  }
}); 



hammertime.on("dragstart", function(event) {
  event.gesture.preventDefault(); 

  var target = event.toElement || event.target;

  var targetInfo = getEventTarget(target); 

  target = targetInfo.elem; 

  var texTarget = targetInfo.texTarget; 

  if (target &&
      target.id) {
    if (target.id == "mathDisplay") {

      // How to check whether dragging current selection or other?? 

      tapMakeSelection(texMap[texTarget]);

      // Default scope for drag-selection is term-level
      /*
      if (sharedParent && 
          sharedParent.parent &&
          sharedParent.parent.val == "mult") {
        sharedParent = sharedParent.parent; 
      }
      */

      dragStart(sharedParent); 

    } else if (target.id == "factors") {
      dragStart(currentFactor); 
    }
  }
}); 



hammertime.on("drag", function(event) {
  if (dragDiv) {
    dragDiv.style.top = event.gesture.center.pageY - (dragDiv.offsetHeight / 2);  
    dragDiv.style.left = event.gesture.center.pageX - (dragDiv.offsetWidth / 2); 
  }
}); 


hammertime.on("dragend", function(event) {
  if (dragDiv) {
    dragDiv.parentNode.removeChild(dragDiv); 
    dragDiv = null; 
  }
  
  if (targets.length == 0) {
    if (sharedParent) {
      colorTreeTex(sharedParent, "#06c4f9"); 
    }
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
    colorTreeTex(sharedParent, "#06c4f9"); 
  }
});


// Double-tap to show, drag to target to do? 
// Pinch-out to show, drag to do target to do? 
hammertime.on("doubletap", function(event) {
  // THIS RAISES CONSOLE ERRORS (STOPS GESTURE DETECTION)
  // BUT WE NEED IT FOR NOW
  event.gesture.stopDetect(); 
  clearTargets(); 
  if (sharedParent.val === "frac") {
    history.push(sharedParent.getTopMostParent().clone(true));
    sharedParent = sharedParent.simplify();
    var node = sharedParent.getTopMostParent();
    render(node);
  } else {
    canFactor(sharedParent); 
  }
}); 



function tapEvalOp(node, index) {

  var toStore = currentExp.clone(true); 
  history.push(toStore); 

  var selection = node;
  if ((node.val === "add" || node.val === "mult") && node.children.length > 2) {
    var cloneChildren = new Array(2);
    cloneChildren[0] = node.children[index].clone(false);
    cloneChildren[1] = node.children[index + 1].clone(false);
    selection = new Oper(node.val, cloneChildren);
  }

  var identity = false;

  for (var id in Identities) {
    var rewrites = Identities[id].getPossibleRewrites(selection);
    if (rewrites) {
      if (rewrites.length === 1) {
        selection = Mutations.replaceExp(selection, rewrites[0]);
      }
      identity = true;
      break;
    }
  }
  if (!identity) {
    selection = selection.simplify();
  }

  if (selection !== node) {
    node.children.splice(index + 1, 1);
    selection = Mutations.replaceExp(node.children[index], selection);
  }
  node = selection.getTopMostParent(); 

  render(node); 
}


function tapMakeSelection(node) {
  if (sharedParent == null) {
    sharedParent = node;  
  } else {
    sharedParent = findSharedParent(sharedParent, node); 
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

  colorTreeTex(sharedParent, "#06c4f9"); 
  clearTargets(); 

  for (var func in testTransforms) {
    testTransforms[func](sharedParent); 
  }
}

function dragStart(exp) {
  colorTreeTex(exp, "black"); 

  dragDiv = document.createElement("div");
  dragDiv.id = "dragDiv"; 
  dragDiv.innerHTML = Parser.TreeToTex(exp.clone(false)).texString;  
  dragDiv.style.top = event.gesture.center.pageY - (dragDiv.offsetHeight / 2); 
  dragDiv.style.left = event.gesture.center.pageX - (dragDiv.offsetWidth / 2); 

  dragDiv.style.color = "#06c4f9";

  var body = document.getElementsByTagName("body")[0]; 
  body.appendChild(dragDiv); 

  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}


function restoreHistory(index) {
  if (history.length < index) {
    clearSelections(); 
    return; 
  }
  var toStore = currentExp.clone(false); 
  history.push(toStore); 
  var histIndex = Math.max(0, history.length - (5 - index)); 
  render(history[histIndex]); 
}


function clearSelections() {
  clearTargets(); 
  if (currentFactor) {
    clearFactors(); 
  }
  colorTreeTex(sharedParent, "white"); 
  sharedParent = null; 
}

function clearFactors() {
  currentFactor = null; 
  document.getElementById("factors").innerHTML = ""; 
  $( "#factorSlider" ).slider("destroy"); 
}