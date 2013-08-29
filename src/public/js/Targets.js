var targets = []; 

var targetFuncs = []; 

function clearTargets() {
  for (var i = 0; i < targets.length; i++) {
    targets[i].parentNode.removeChild(targets[i]); 
  }
  targets = []; 
  targetFuncs = []; 
}

function drawTarget(top, left, symbol, options) {
  var div = document.createElement("div"); 
  div.innerHTML = getTargetHTML(symbol, options); 
  div.setAttribute("class", "target"); 
  div.style.top = top - 25; 
  div.style.left = left - 25; 
  div.id = targets.length; 
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

    console.log(tree); 

    if (pos == "center") {
      var offset = cumulativeXOffset(selection); 
      return (offset + offset + selection.offsetWidth) / 2;
    } else if (pos == "right") {
      var offset = cumulativeXOffset(selection); 
      return offset + selection.offsetWidth + 10; 
    }
  }
}

// BREAK THIS UP TO DETERMINE SYMBOL?? 
function drawDisOrFacTarget(tree) {
  var left = getX(tree, "center");
  var top = document.getElementById("mathDisplay").offsetTop;
  return drawTarget(top, left, "&#8595;", {tx:60, ty:54});
}

function drawDivideTarget(tree) {
  var left = getX(tree, "center");
  var container = document.getElementById("mathDisplay");
  var top = container.offsetTop + container.offsetHeight;
  return drawTarget(top, left, "&#247;", null);
}

function drawSubtractTarget(tree) {
  var left = getX(tree, "right"); 
  var container = document.getElementById("mathDisplay"); 
  var top = container.offsetTop + (container.offsetHeight / 2); 

  var symbol = null; 
  if (tree.val == "neg" &&
      tree.parent.val == "neg") {
    // THIS ISN'T WORKING RIGHT NOW!! 
    symbol = "+"; 
  } else {
    // THIS IS X
    // symbol = "&#215;"; 
    symbol = "&#8722;";
  }

  return drawTarget(top, left, symbol, null); 
}

function drawCommuteTarget(tree) {
  var left = getX(tree, "center"); 
  var top = document.getElementById("mathDisplay").offsetTop; 
  return drawTarget(top, left, "&#8596;", {tx:57, ty:50}); 
}



function getTargetHTML(text, o) {

  var white = "white";
  var black = "black";
  var blue = "#06c4f9";

  o    = o    || {}
  o.tx = o.tx || 50
  o.ty = o.ty || 54

  o.textColor = o.textColor || black;
  o.fillColor = o.fillColor || blue;
  o.strokeColor = o.strokeColor || blue;

  var targetID = targets.length; 

  var svgString = ""; 

  svgString += '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">';
  svgString += '<g transform="scale(0.5) ">';
  svgString += '  <circle id="circle' + targetID + '" fill="' + o.fillColor + '" stroke="' + o.strokeColor + '" stroke-opacity="0.7" fill-opacity="0.7" stroke-width="4" stroke-miterlimit="10" cx="50" cy="50" r="45"/>';
  svgString += '  <text x="' + o.tx + '" y="' + o.ty + '" fill="' + o.textColor + '" style="font-family: monospace; text-anchor: middle; dominant-baseline: central; font-weight:900;" font-size="64">'+text+'</text>';
  svgString += '</g>';
  svgString += '</svg>';

  return svgString; 
}

function recolorTarget(id, color) {
  var target = document.getElementById("circle" + id); 
  target.style.fill = color; 
  target.style.stroke = color;  
}