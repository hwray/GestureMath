var selections = {}; 

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

var testTransforms = {

  // Matching wrinkles: 
  // Negs? 
     // But remember, we'll force people to select the neg anyways... 
     // Impacts factoring: have to check not just NUM/VAR/CONST, but NEG --> any of those
  // Functions? 

  canCommute: function(shared) {

  }, 

  canSubtractOverEquals: function(shared) {
    if (shared.parent &&
        shared.parent.type == "EQUAL") {

      return true; 
    }
    if (shared.parent &&
        shared.parent.val == "add" &&
        shared.parent.parent &&
        shared.parent.parent.type == "EQUAL") {
      return true; 
    }
    return false; 
  }, 

  canDivideOverEquals: function(shared) {
    console.log("Parent before:");
    console.log(shared.parent);
    if (shared.parent &&
        shared.parent.type == "EQUAL") {
      var sibling = null; 
      shared.parent.children[0] === shared? sibling = shared.parent.children[1] : sibling = shared.parent.children[0];
      var divTarget = drawDivideTarget(sibling);
      divTarget.addEventListener("click", function() {
        Transforms.divideOverEquals(sibling, shared);
        console.log("After");
        console.log(shared.parent);
      });
      
      return true; 
    }
    if (shared.parent &&
        shared.parent.val == "mult" && 
        shared.parent.parent &&
        shared.parent.parent.type == "EQUAL") {

      var sibling = null; 
      shared.parent.parent.children[0] === shared.parent? sibling = shared.parent.parent.children[1] : sibling = shared.parent.parent.children[0];
      drawDivideTarget(sibling);
      return true; 
    }
    return false; 
  }, 

  canDistribute: function(shared) {
    // Distributing a single coefficient/var of a term? 
    // Mult operator with multiple sums as children? x(1 + 2)(x + 4)??? 
    if (shared.parent &&
        shared.parent.val == "mult") {
      var parent = shared.parent; 
      for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].val == "add" &&
            parent.children[i] != shared) {
          drawDisOrFacTarget(parent.children[i]);
          return parent.children[i]; 
        }
      }
    }
    return null;  
  }, 

  canFactor: function(shared) {
    // CHANGE FOR NEW STYLE OF FACTORING POLYNOMIALS
    if (shared.type == "NUM") {
      return false; 
      // return true; 
    } else if (shared.val == "pow") {
      return false; 
      // return true; 
    }
    var coefficients = false; 
    var variables = false; 
    var constants = false; 
    for (var node in selections) {
      if (selections[node].type == "NUM") {
        coefficients = true; 
      } else if (selections[node].type == "VAR") {
        variables = true; 
      } else if (selections[node].type == "CONST") {
        constants = true; 
      }
    }
    // TODO: FINISH
    // CHECK FACTORS, etc. 
    return false; 
  }

};

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


// SET .selected HERE ACCORDING TO COLOR
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


function Factor(num) {
  var factors = []; 

  for (var i = 1; i <= Math.floor(Math.sqrt(num)); i++) {
    if (num % i === 0) {
      factors.push(i);
      var quotient = num / i; 
      if (quotient !== i) {
        factors.push(quotient); 
      }
    }
  }
  factors.sort(function(a, b) { return a - b; }); 
  return factors; 
}

function GreatestCommonFactor(nums) {
  var factors = Factor(nums[0]); 
  for (var i = factors.length - 1; i >= 0; i--) {
    for (var j = 1; j < nums.length; j++) {
      if (nums[j] % factors[i] === 0) {
        return factors[i]; 
      }
    }
  }
  return 1; 
}