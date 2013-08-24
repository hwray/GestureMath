var currentExp = null; 

var texStr = ""; 

var texMap = { }; 

var historyCounter = 0; 
var history = []; 

var sharedParent = null;  

function render(tree) {

  flattenTree(tree);
  currentExp = tree; 

  var texObj = Parser.TreeToTex(tree); 

  texStr = texObj.texString; 

  texMap = texObj.texMap; 

  document.getElementById("mathDisplay").innerHTML = texStr; 

  sharedParent = null; 

  clearTargets(); 

  historyCounter++; 

  var initCount = Math.max(0, historyCounter - 3); 
  var divCount = 1; 

  for (var i = initCount; i < historyCounter; i++) {
    var divStr = "history" + divCount; 
    var historyDiv = document.getElementById(divStr); 
    historyDiv.innerHTML = Parser.TreeToTex(history[i]).texString;
    divCount++; 
  }

  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}

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
    var toSimplify = Mutations.swapInExp(term, subtract);
    var simplified = toSimplify.simplify({childIndex: 0});

    simplified = simplified.getTopMostParent(); 
    render(simplified);
  }, 

  divideOverEquals: function(numer, denom) {
    var dividedBy = denom.clone(false);
    var divide = function (exp) {
      var children = new Array(exp, dividedBy);
      return new Oper("frac", children);
    }
    Mutations.swapInExp(numer, divide);
    var toSimplify = Mutations.swapInExp(denom, divide);
    var simplified = toSimplify.simplify();

    simplified = simplified.getTopMostParent(); 

    render(simplified.getTopMostParent()); 
  },

  multiplyOverEquals: function(selected, target) {
    var multBy = selected.clone(false);
    var muliply = function(exp) {
      var children = new Array(exp, multBy);
      return new Oper("mult", children);
    }
    var toSimplify = Mutations.swapInExp(selected.parent, muliply);
    var toDistribute = Mutations.swapInExp(target, muliply);

    
    var simplified = toSimplify.simplify({childIndex: 0});
    var toSimp = simplified.simplify();
    toSimp = toSimp.getTopMostParent(); 
    //console.log(toSimp);

    //Transforms.distribute()
    render(toSimp);

  },

  // CALL toSimplify in here? 
  distribute: function(select, target) {
    //the problem is that the select parent isn't a mult with the target
    //one thing is to edit the select appropriately 
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

    select = select.getTopMostParent(); 
    flattenTree(select); 

    render(select); 
  }, 

  factor: function() {

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
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
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
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
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
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
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
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
        Transforms.divideOverEquals(sibling, shared);
      });  
    }
  }, 

  canMultiplyOverEquals: function(shared) {
    if (shared.parent && 
        shared.parent.val === "frac" && 
        shared.parent.parent &&
        shared.parent.parent.type === "EQUAL"
        ) {
      var parent = shared.parent;
      var grandParent = shared.parent.parent;
      grandParent.children[0] === shared.parent ? sibling = grandParent.children[1] : sibling = grandParent.children[0];
      var multTarget = drawDisOrFacTarget(sibling);
      multTarget.addEventListener("click", function(e) {
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
        Transforms.multiplyOverEquals(shared, sibling);
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
            var toStore = currentExp.clone(false); 
            history.push(toStore); 
            Transforms.distribute(shared, distributeOver); 
          }); 
        }
      }
    }
  }, 

  canFactor: function(shared) {
    if (shared.type == "NUM") {
      return true; 
    } else if (shared.val == "add") {
      var terms = shared.children; 
      var gcf = greatestCommonFactor(terms); 
    }
    // check children
  }
};

// propagate 0s in mult ops? 
function flattenTree(tree) {
  if (tree.children) {
    for (var i = 0; i < tree.children.length; i++) {
      flattenTree(tree.children[i]); 
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

  // Eliminate "add" or "mult" ops with a single child
  if ((tree.val == "add" ||
      tree.val == "mult") &&
      tree.children.length == 1) {
    var parent = tree.parent; 
    var index = parent.children.indexOf(tree); 
    var child = tree.children[0]; 

    parent.children[index] = child; 
    child.parent = parent; 
  }

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

function factorNum(num) {
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

function pairFactorPowVar(powVar) {
  var exponent = powVar.children[1]; 
  var factors = []; 
  for (var i = 1; i < (exponent / 2); i++) {
    factors.push([i, exponent - i]); 
  }
  return factors; 
}


function greatestCommonFactorNums(nums) {
  var factors = factorNum(nums[0]); 
  for (var i = factors.length - 1; i >= 0; i--) {
    var common = true; 
    for (var j = 1; j < nums.length; j++) {
      if (nums[j] < factors[i] ||
          nums[j] % factors[i] != 0) {
        common = false; 
      }
    }
    if (common == true) 
      return factors[i]; 
  }
  return 1; 
}

function greatestCommonFactorConsts(consts) {

}

function greatestCommonFactorVars(vars) {
  var varArr = { };  
  if (vars[0] == null) {
    return null; 
  }
  for (var i = 0; i < vars[0].length; i++) {
    var base = vars[0][i].base; 
    varArr[base] = vars[0][i].exp; 
  }
  for (var i = 1; i < vars.length; i++) {
    if (vars[i] == null) {
      return null; 
    }
    var checkArr = {}; 
    for (var key in varArr) {
      checkArr[key] = false; 
    }

    for (var j = 0; j < vars[i].length; j++) {
      var base = vars[i][j].base; 
      var exp = vars[i][j].exp; 
      if (varArr[base]) {
        checkArr[base] = true; 
        if (varArr[base] > exp) {
          varArr[base] = exp; 
        }
      }
    }
    for (var key in checkArr) {
      if (checkArr[key] == false) {
        delete varArr[key]; 
      }
    }
  }

  console.log(varArr); 
  return varArr; 
}

// CONSTS??? 
function greatestCommonFactor(expArr) {  

  function Term(neg, coefficient, consts, vars) {
    this.coefficient = coefficient; 
    this.consts = consts; 
    this.vars = vars; 
    return this; 
  }

  function Variable(base, exp) {
    this.base = base; 
    this.exp = exp; 
  }

  var terms = new Array(); 
  for (var i = 0; i < expArr.length; i++) {
    var neg = false; 
    if (expArr[i].val == "neg") {
      neg = true; 
      expArr[i] = expArr[i].children[0]; 
    }
    if (expArr[i].type == "NUM") {
      var term = new Term(neg, expArr[i].val, null, null); 
      terms.push(term); 
    } else if (expArr[i].type == "VAR") {
      var variable = new Variable(expArr[i].val, 1); 
      var term = new Term(neg, 1, null, [variable]); 
      terms.push(term); 
    } else if (expArr[i].type == "CONST") {
      var term = new Term(neg, 1, [expArr[i].val], null); 
      terms.push(term); 
    } else if (expArr[i].val == "pow") {

      // NUM POWS?? 
      // POWS WITH COMPLICATED EXPONENTS? 
      // CONST POWS? 
      if (expArr[i].children[0].type == "VAR" &&
          expArr[i].children[1].type == "NUM") {
        var variable = new Variable(expArr[i].children[0].val, expArr[i].children[1].val); 
        var term = new Term(neg, 1, null, [variable]); 
        terms.push(term); 
      }
    } else if (expArr[i].val == "mult") {
      var children = expArr[i].children; 
      var nums = new Array();  
      var consts = new Array(); 
      var vars = new Array(); 
      for (var j = 0; j < children.length; j++) {
        if (children[j].type == "NUM") {
          nums.push(children[j].val); 
        } else if (children[j].type == "VAR") {
          var variable = new Variable(children[j].val, 1); 
          vars.push(variable); 
        } else if (children[j].type == "CONST") {
          consts.push(children[j].val); 
        } else if (children[j].val == "pow") {
          if (children[j].children[0].type == "VAR" &&
              children[j].children[1].type == "NUM") {
            var variable = new Variable(children[j].children[0].val, children[j].children[1].val); 

            vars.push(variable); 
          }
        }
      }
      var coefficient = 1; 
      for (var j = 0; j < nums.length; j++) {
        coefficient *= nums[j]; 
      }

      if (consts.length == 0) 
        consts = null; 

      if (vars.length == 0)
        vars = null; 

      var term = new Term(neg, coefficient, consts, vars); 
      terms.push(term); 
    }
  }

  var nums = []; 
  var consts = []; 
  var vars = []; 
  for (var i = 0; i < terms.length; i++) {
    nums.push(terms[i].coefficient); 
    consts.push(terms[i].consts); 
    vars.push(terms[i].vars); 
  }

  console.log(nums); 
  var gcfNums = greatestCommonFactorNums(nums); 
  // var gcfConsts = greatestCommonFactorConsts(consts); 
  var gcfVars = greatestCommonFactorVars(vars); 



  var numDiv = document.getElementById("numFactors"); 
  var varDiv = document.getElementById("varFactors"); 
  numDiv.innerHTML = gcfNums; 
  varDiv.innerHTML = JSON.stringify(gcfVars); 
}