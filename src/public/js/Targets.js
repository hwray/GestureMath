var targets = []; 

var targetFuncs = []; 

function clearTargets() {
  for (var i = 0; i < targets.length; i++) {
    targets[i].parentNode.removeChild(targets[i]); 
  }
  targets = []; 
  targetFuncs = []; 
}

function drawTarget(top, left) {
  var div = document.createElement("div"); 
  div.setAttribute("class", "target"); 
  div.style.top = top; 
  div.style.left = left; 
  document.getElementById("container").appendChild(div);
  targets.push(div); 
  return div;
}

// Use TexMap for this, instead of document.getElementById? 
function getX(tree, pos) {

  var cumulativeXOffset = function(elem) {
    var left = 0; 
    while (elem && 
           elem.id != "mathDisplay") {
      left += elem.offsetLeft || 0;
      elem = elem.offsetParent;
    }
    return left; 
  };

  if (tree.children) {
    var startNode = tree;
    var endNode = tree;
    while (startNode.children || endNode.children) {
      if (startNode.children)
        startNode = startNode.children[0];
      if (endNode.children)
        endNode = endNode.children[endNode.children.length - 1];
    }
    var firstElem = document.getElementById(startNode.id);
    var lastElem = document.getElementById(endNode.id);


    if (pos == "center") {
      var firstOffset = cumulativeXOffset(firstElem); 
      var lastOffset = cumulativeXOffset(lastElem); 
      return (firstOffset + lastOffset + lastElem.offsetWidth) / 2;
    } else if (pos == "right") {
      var lastOffset = cumulativeXOffset(lastElem); 
      return lastOffset + lastElem.offsetWidth + 10; 
    }


  } else {
    var selection = document.getElementById(tree.id);

    if (pos == "center") {
      var offset = cumulativeXOffset(selection); 
      return (offset + offset + selection.offsetWidth) / 2;
    } else if (pos == "right") {
      var offset = cumulativeXOffset(selection); 
      return offset + selection.offsetWidth + 10; 
    }
  }
}

function drawDisOrFacTarget(tree) {
  var left = getX(tree, "center");
  var top = document.getElementById("mathDisplay").offsetTop;
  return drawTarget(top, left);
}

function drawDivideTarget(tree) {
  var left = getX(tree, "center");
  var container = document.getElementById("mathDisplay");
  var top = container.offsetTop + container.offsetHeight;
  return drawTarget(top, left);
}

function drawSubtractTarget(tree) {
  var left = getX(tree, "right"); 
  var container = document.getElementById("mathDisplay"); 
  var top = container.offsetTop + (container.offsetHeight / 2); 
  return drawTarget(top, left); 
}