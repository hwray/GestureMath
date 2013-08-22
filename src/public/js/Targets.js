var targets = []; 

function clearTargets() {
  for (var i = 0; i < targets.length; i++) {
    targets[i].parentNode.removeChild(targets[i]); 
  }
  targets = []; 
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
  var mathJax_xOffset = document.getElementById("mathDisplay").firstChild.nextSibling.firstChild.offsetLeft;

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
      return firstElem.offsetLeft + (lastElem.offsetLeft + lastElem.offsetWidth - firstElem.offsetLeft)/2 + mathJax_xOffset - 5;
    } else if (pos == "right") {
      return lastElem.offsetLeft + lastElem.offsetWidth + mathJax_xOffset + 5; 
    }


  } else {
    var selection = document.getElementById(tree.id);

    if (pos == "center") {
      return selection.offsetLeft + selection.offsetWidth/2 + mathJax_xOffset - 5;
    } else if (pos == "right") {
      return selection.offsetLeft + selection.offsetWidth + mathJax_xOffset + 5; 
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