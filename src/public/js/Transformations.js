var Transforms = {
  commute: function() {

  }, 

  subtractOverEquals: function(toSide, term) {
    var toSubtract = term.clone(false); 
    
    var subtract = function(exp) {
      var negChildren = new Array();
      negChildren.push(toSubtract);
      var neg = new Oper("neg", negChildren); 
      var children = new Array(exp, neg); 
      return new Oper("add", children); 
    }

    Mutations.swapInExp(toSide, subtract); 
    var simp = Mutations.swapInExp(term, subtract);
    flattenTree(simp); 
    console.log(simp);
    var simplified = simp.simplify({childIndex: 0});

    while (simplified.parent != null) {
      simplified = simplified.parent; 
    }
    flattenTree(simplified); 

    this.rerender(simplified);
  }, 

  divideOverEquals: function(numer, denom) {
    var dividedBy = denom.clone(false);
    var divide = function (exp) {
      var children = new Array(exp, dividedBy);
      return new Oper("frac", children);
    }
    Mutations.swapInExp(numer, divide);
    var toSimplify = Mutations.swapInExp(denom, divide);
    
    //toSimplify.simplify();
    var simplified = toSimplify.simplify();
    console.log(simplified.getTopMostParent());

    flattenTree(simplified); 

    this.rerender(simplified.getTopMostParent()); 
  }, 

  // CALL toSimplify in here? 
  distribute: function(select, target) {
    for (var i = 0; i < target.children.length; i++) {
      var mult = new Oper("mult", [select.clone(), target.children[i].clone()]); 
      mult.parent = target; 
      target.children[i] = mult; 
    }

    var parent = select.parent; 
    var parentChildren = parent.children; 
    parentChildren.splice(parentChildren.indexOf(select), 1); 

    if (parentChildren.length < 2) {
      var grandParent = parent.parent; 
      var grandParentChildren = grandParent.children; 
      var swapIndex = grandParentChildren.indexOf(parent);  
      grandParentChildren[swapIndex] = target; 
      target.parent = grandParent; 
    }

    while (select.parent != null) {
      select = select.parent; 
    }
    flattenTree(select); 
    console.log(Parser.TreeToString(select)); 

    this.rerender(select); 
  }, 

  factor: function() {

  }, 

  rerender: function(tree) {
    while (tree.parent != null) {
      tree = tree.parent; 
    }

    var texObj = Parser.TreeToTex(tree); 

    var texStr = texObj.texString; 

    texMap = texObj.texMap; 

    document.getElementById("mathDisplay").innerHTML = texStr; 

    clearTargets(); 

    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  }
};

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

      var sibling = null; 
      shared.parent.children[0] === shared? sibling = shared.parent.children[1] : sibling = shared.parent.children[0];

      var subTarget = drawSubtractTarget(sibling); 
      subTarget.addEventListener("click", function(event) {
        Transforms.subtractOverEquals(sibling, shared); 
      }); 
    }

    if (shared.parent &&
        shared.parent.val == "add" &&
        shared.parent.parent &&
        shared.parent.parent.type == "EQUAL") {

      var sibling = null; 
      shared.parent.parent.children[0] === shared.parent? sibling = shared.parent.parent.children[1] : sibling = shared.parent.parent.children[0];

      var subTarget = drawSubtractTarget(sibling); 
      subTarget.addEventListener("click", function(event) {
        Transforms.subtractOverEquals(sibling, shared); 
      }); 
    }
  }, 

  canDivideOverEquals: function(shared) {
    if (shared.parent &&
        shared.parent.type == "EQUAL") {
      var sibling = null; 
      shared.parent.children[0] === shared? sibling = shared.parent.children[1] : sibling = shared.parent.children[0];

      var divTarget = drawDivideTarget(sibling);
      divTarget.addEventListener("click", function(event) {
        Transforms.divideOverEquals(sibling, shared);
      });      
    }
    if (shared.parent &&
        shared.parent.val == "mult" && 
        shared.parent.parent &&
        shared.parent.parent.type == "EQUAL") {

      var sibling = null; 
      shared.parent.parent.children[0] === shared.parent? sibling = shared.parent.parent.children[1] : sibling = shared.parent.parent.children[0];
      var divTarget = drawDivideTarget(sibling);
      divTarget.addEventListener("click", function(event) {
        Transforms.divideOverEquals(sibling, shared);
      });  
    }
  }, 

  canDistribute: function(shared) {
    // Distributing a single coefficient/var of a term? 
    // Distributing over multiple sums? x(1 + 2)(x + 4)??? 
    if (shared.parent &&
        shared.parent.val == "mult") {
      var parent = shared.parent; 
      for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].val == "add" &&
            parent.children[i] != shared) {

          var distributeOver = parent.children[i]; 

          var disTarget = drawDisOrFacTarget(distributeOver);

          disTarget.addEventListener("click", function(event) {
            Transforms.distribute(shared, distributeOver); 
          }); 
        }
      }
    }
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

// propagate 0s in mult ops? 
function flattenTree(tree) {
  // Eliminate double-nested "add" and "mult" ops
  if (tree.val == "add" ||
      tree.val == "mult") {
    for (var i = 0; i < tree.children.length; i++) {
      if (tree.val == tree.children[i].val) {
        var grandChildren = tree.children[i].children; 
        tree.children.splice(i, 1, grandChildren); 
        tree.children = _.flatten(tree.children); 
        for (var j = 0; j < grandChildren.length; j++) {
          grandChildren[j].parent = tree; 
        }
      }
    }
  }

  // Eliminate "0" children from add ops
  if (tree.val == "add") {
    for (var i = 0; i < tree.children.length; i++) {
      if (tree.children[i].val === 0) {
        tree.children.splice(i, 1); 
      }
    }
  }

  // Eliminate "1" children from mult ops
  if (tree.val == "mult") {
    for (var i = 0; i < tree.children.length; i++) {
      if (tree.children[i].val === 1) {
        tree.children.splice(i, 1); 
      }
    }
  }

  // Eliminate double-nested "neg" ops, 
  if (tree.val == "neg" &&
      tree.children[0].val == "neg") {
    var parent = tree.parent; 
    var grandChild = tree.children[0].children[0]; 

    var index = parent.children.indexOf(tree);
    parent.children[index] = grandChild; 
    grandChild.parent = parent; 
  }

  // Distribute "neg" ops over "add" ops
  if (tree.val == "neg" && 
      tree.children[0].val == "add") {
    
    var add = tree.children[0]; 
    for (var i = 0; i < add.children.length; i++) {
      var child = add.children[i]; 
      var neg = new Oper("neg", [child]); 
      add.children[i] = neg; 
      child.parent = neg; 
      neg.parent = add; 
    }

    var parent = tree.parent; 
    var index = parent.children.indexOf(tree); 
    parent.children[index] = add; 
    add.parent = parent; 
  }

  if (tree.children) {
    for (var i = 0; i < tree.children.length; i++) {
      flattenTree(tree.children[i]); 
    }
  }
}


function pairFactorNum(exp) {
  var num = exp.val; 
  var factors = []; 
  for (var i = 1; i <= Math.floor(Math.sqrt(num)); i++) {
    if (num % i === 0) {
      var quotient = num / i; 
      if (quotient !== i) {
        factors.push([i, quotient]); 
      }
    }
  }
  factors.sort(function(a, b) { return a[0] - b[0]; }); 
  return factors; 
}

function factorNum(exp) {
  var num = exp.val; 
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

function greatestCommonFactorNums(nums) {
  var factors = factorNum(nums[0]); 
  for (var i = factors.length - 1; i >= 0; i--) {
    var common = true; 
    for (var j = 1; j < nums.length; j++) {
      if (nums[j].val < factors[i] ||
          nums[j].val % factors[i] != 0) {
        common = false; 
      }
    }
    if (common == true) 
      return factors[i]; 
  }
  return 1; 
}

function pairFactorPowVar(powVar) {
  var exponent = powVar.children[1]; 
  var factors = []; 
  for (var i = 1; i < (exponent / 2); i++) {
    factors.push([i, exponent - i]); 
  }
  return factors; 
}

function greatestCommonFactorVars(vars) {
  var varArr = []; 
  for (var i = 0; i < vars.length; i++) {
    if (vars[i].type == "VAR" && 
        varArr.indexOf(vars[i].val) == -1) {
      varArr.push([vars[i], 1]); 
    } else if (vars[i].val == "pow") {
      varArr.push([vars[i].children[0], vars[i].children[1]]); 
    }
  }

  var maxExp = {}; 
  for (var i = 0; i < varArr.length; i++) {
    if ((!maxExp[varArr[i][0]]) ||
        (maxExp[varArr[i][0]] &&
         maxExp[varArr[i][0]] < varArr[i][1])) {
      maxExp[varArr[i]] = varArr[i][1]; 
    }
  }
  
  return maxExp; 
}

function greatestCommonFactor(exp) {


}