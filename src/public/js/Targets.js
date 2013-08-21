function drawTarget(top, left) {
  var div = document.createElement("div"); 
  div.setAttribute("class", "target"); 
  div.style.top = top; 
  div.style.left = left; 
  console.log(div);
  document.getElementById("container").appendChild(div);
  return div;
}

function getCenterX(tree) {
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

    return firstElem.offsetLeft + (lastElem.offsetLeft + lastElem.offsetWidth - firstElem.offsetLeft)/2 + mathJax_xOffset - 5;

  } else {
    var selection = document.getElementById(tree.id);
    return selection.offsetLeft + selection.offsetWidth/2 + mathJax_xOffset - 5;
  }
}

function drawDisOrFacTarget(tree) {
  var left = getCenterX(tree);
  var top = document.getElementById("mathDisplay").offsetTop;
  drawTarget(top, left);
}

function drawDivideTarget(tree) {
  var left = getCenterX(tree);
  var container = document.getElementById("mathDisplay");
  var top = container.offsetTop + container.offsetHeight;
  return drawTarget(top, left);
}