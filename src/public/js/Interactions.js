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