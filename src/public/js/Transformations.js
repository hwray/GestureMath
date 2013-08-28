var currentExp = null; 

var texStr = ""; 

var texMap = { }; 

var historyCounter = 0; 
var history = []; 

var sharedParent = null;  

var currentFactor = null;

function render(tree) {

  Mutations.flattenTree(tree); 

  currentExp = tree; 

  texMap = { }; 
  var texObj = Parser.TreeToTex(tree); 
  texMap = texObj.texMap; 

  texStr = texObj.texString; 
  document.getElementById("mathDisplay").innerHTML = texStr; 

  sharedParent = null; 

  clearTargets(); 

  if (currentFactor) {
    clearFactors(); 
  }

  historyCounter++; 

  var lastCount = Math.max(0, historyCounter - 3); 
  var divCount = 1; 

  for (var i = historyCounter - 1; i >= lastCount; i--) {
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

    // toSide is 63
    // toSubtract is the neg
    
    var subtract = function(exp) {
      var negChildren = new Array();
      negChildren.push(toSubtract);
      var neg = new Oper("neg", negChildren); 
      var children = new Array(exp, neg); 
      return new Oper("add", children); 
    }

    Mutations.swapInExp(toSide, subtract); 
    var toSimplify = Mutations.swapInExp(term, subtract);
    
    var simplified = toSimplify.simplify();
    toSimplify.children.splice(1, 1);
    simplified = Mutations.replaceExp(toSimplify.children[0], simplified);

    simplified = simplified.getTopMostParent(); 
    Mutations.flattenTree(simplified);
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

    
    var simplified = toSimplify.simplify();
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
      mult = mult.simplify();
      mult.parent = target; 
      target.children[i] = mult;
    }

    if (select.val == "add") {
      var newChildren = []; 
      for (var i = 0; i < target.children.length; i++) {
        var children = target.children[i].children[0].children; 
        for (var j = 0; j < children.length; j++) {
          var first = children[j]; 
          var second = target.children[i].children[1]; 
          var mult = new Oper("mult", [first.clone(), second.clone()]); 
          newChildren.push(mult);  
        }
      }
      target.children = newChildren; 
    }

    var parent = select.parent; 
    var parentChildren = parent.children; 
    parentChildren.splice(parentChildren.indexOf(select), 1); 

    select = select.getTopMostParent(); 
    Mutations.flattenTree(select); 

    render(select); 
  }, 

  // NEED TO CALL SIMPLIY IN HERE? 
  factorNum: function(select, factor) {
    var parent = select.parent; 
    var index = parent.children.indexOf(select); 
    parent.children[index] = factor; 
    factor.parent = parent; 

    parent = parent.getTopMostParent(); 
    Mutations.flattenTree(parent); 
    render(parent); 
  }, 

  // NEED TO CALL SIMPLIFY IN HERE? 
  factorPoly: function(poly, factor) {

    var coefficient = 1; 
    var variables = {}; 

    if (factor.type == "NUM") {
      coefficient = factor.val; 
      variables = null; 
    } else {
      for (var i = 0; i < factor.children.length; i++) {
        if (factor.children[i].type == "NUM") {
          coefficient = factor.children[i].val; 
        } else if (factor.children[i].type == "VAR") {
          var variable = factor.children[i].val; 
          variables[variable] = 1; 
        } else if (factor.children[i].val == "pow") {
          var base = factor.children[i].children[0].val; 
          var exp = factor.children[i].children[1].val; 
          variables[base] = exp; 
        }
      }
    }

    for (var i = 0; i < poly.children.length; i++) {
      if (poly.children[i].type == "NUM") {
        poly.children[i].val = (poly.children[i].val / coefficient); 
      } else if (poly.children[i].type == "VAR") {
        var variable = poly.children[i].val; 
        if (variables[variable]) {
          poly.children.splice(i, 1); 
          i--; 
        }
      } else if (poly.children[i].val == "pow") {
        var base = poly.children[i].children[0]; 
        if (variables[base] &&
            poly.children[i].children[1].type == "NUM") {
          poly.children[i].children[1].val -= variables[base]; 
        }
      } else if (poly.children[i].val == "mult") {
        var children = poly.children[i].children; 
        for (var j = 0; j < children.length; j++) {
          if (children[j].type == "NUM") {
            children[j].val = (children[j].val / coefficient); 
          } else if (children[j].type == "VAR") {
            var variable = children[j].val; 
            if (variables[variable]) {
              children.splice(j, 1); 
              j--; 
            }
          } else if (children[j].val == "pow") {
            var base = children[j].children[0].val; 
            if (variables[base] &&
              children[j].children[1].type == "NUM") {
              children[j].children[1].val -= variables[base]; 
            }
          }
        }
      }
    }

    var mult = new Oper("mult", [factor.clone(false), poly.clone(false)]); 
    var index = poly.parent.children.indexOf(poly); 

    poly.parent.children[index] = mult; 
    mult.parent = poly.parent; 

    mult = mult.getTopMostParent(); 
    render(mult); 
  }
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

      var sibling = null; 
      shared.parent.children[0] === shared? sibling = shared.parent.children[1] : sibling = shared.parent.children[0];

      var transform = function(event) {
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
        Transforms.subtractOverEquals(sibling, shared);        
      };
      targetFuncs.push(transform); 

      var subTarget = drawSubtractTarget(sibling); 
      subTarget.addEventListener("click", transform); 
    }

    if (shared.parent &&
        shared.parent.val == "add" &&
        shared.parent.parent &&
        shared.parent.parent.type == "EQUAL") {

      var sibling = null; 
      shared.parent.parent.children[0] === shared.parent? sibling = shared.parent.parent.children[1] : sibling = shared.parent.parent.children[0];

      var transform = function(event) {
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
        Transforms.subtractOverEquals(sibling, shared); 
      };
      targetFuncs.push(transform); 

      var subTarget = drawSubtractTarget(sibling); 
      subTarget.addEventListener("click", transform); 
    }
  }, 

  canDivideOverEquals: function(shared) {
    if (shared.parent &&
        shared.parent.type == "EQUAL") {
      var sibling = null; 
      shared.parent.children[0] === shared? sibling = shared.parent.children[1] : sibling = shared.parent.children[0];

      var transform = function(event) {
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
        Transforms.divideOverEquals(sibling, shared);  
      }; 
      targetFuncs.push(transform); 

      var divTarget = drawDivideTarget(sibling);
      divTarget.addEventListener("click", transform);      
    }
    if (shared.parent &&
        shared.parent.val == "mult" && 
        shared.parent.parent &&
        shared.parent.parent.type == "EQUAL") {

      var sibling = null; 
      shared.parent.parent.children[0] === shared.parent? sibling = shared.parent.parent.children[1] : sibling = shared.parent.parent.children[0];
      
      var transform = function(event) {
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
        Transforms.divideOverEquals(sibling, shared);
      }; 
      targetFuncs.push(transform); 

      var divTarget = drawDivideTarget(sibling);
      divTarget.addEventListener("click", transform);  
    }
  }, 

  canMultiplyOverEquals: function(shared) {
    if (shared.parent && 
        shared.parent.val === "frac" &&
        shared.parent.children.indexOf(shared) === 1 && 
        shared.parent.parent &&
        shared.parent.parent.type === "EQUAL"
        ) {
      var parent = shared.parent;
      var grandParent = shared.parent.parent;
      grandParent.children[0] === shared.parent ? sibling = grandParent.children[1] : sibling = grandParent.children[0];
      
      var transform = function(event) {
        var toStore = currentExp.clone(false); 
        history.push(toStore); 
        Transforms.multiplyOverEquals(shared, sibling);
      }; 
      targetFuncs.push(transform); 

      var multTarget = drawDisOrFacTarget(sibling);
      multTarget.addEventListener("click", transform);

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

          var transform = function(event) {
            var toStore = currentExp.clone(false); 
            history.push(toStore); 
            Transforms.distribute(shared, distributeOver); 
          }; 
          targetFuncs.push(transform); 

          var disTarget = drawDisOrFacTarget(distributeOver);

          disTarget.addEventListener("click", transform); 
        }
      }
    }
  }
};

function canFactor(shared) {
  if (shared.type == "NUM") {
    var factors = pairFactorNum(shared); 
    var treePairs = []; 
    for (var i = 0; i < factors.length; i++) {
      var num1 = new Num(factors[i][0]); 
      var num2 = new Num(factors[i][1]); 
      var factorPair = new Oper("mult", [num1, num2]); 
      treePairs.push(factorPair); 
    }

    var initValue = treePairs.length / 2; 

    currentFactor = treePairs[initValue]; 

    var factorDiv = document.getElementById("factorDisplay"); 
    factorDiv.innerHTML = Parser.TreeToTex(currentFactor).texString; 
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

    $(function() {
      $( "#factorSlider" ).slider({
        animate: true,
        min: 0, 
        max: treePairs.length - 1, 
        value: initValue, 
        slide: function(event, ui) {
          $( "factorSlider" ).val( "$" + ui.value ); 
          currentFactor = treePairs[ui.value]; 
          factorDiv.textContent = Parser.TreeToTex(currentFactor).texString;
          MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        }
      });
    });


    var transform = function(event) {
      var toStore = currentExp.clone(false); 
      history.push(toStore); 
      Transforms.factorNum(shared, currentFactor); 
    }; 
    targetFuncs.push(transform); 

    var facTarget = drawDisOrFacTarget(shared); 
    facTarget.addEventListener("click", transform); 

  } else if (shared.val == "add") {
    var terms = shared.children; 
    var gcf = greatestCommonFactor(terms); 

    currentFactor = gcf; 

    var factorDiv = document.getElementById("factors"); 
    factorDiv.innerHTML = Parser.TreeToTex(currentFactor).texString; 
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

    var transform = function(event) {
      var toStore = currentExp.clone(false); 
      history.push(toStore); 
      Transforms.factorPoly(shared, currentFactor); 
    }; 
    targetFuncs.push(transform); 

    var facTarget = drawDisOrFacTarget(shared); 
    facTarget.addEventListener("click", transform); 
  }
  // validate children/parents?? 
}


function pairFactorNum(exp) {
  var num = exp.val; 
  var factors = []; 
  for (var i = 1; i <= num; i++) {
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

  var gcfNums = greatestCommonFactorNums(nums); 
  // var gcfConsts = greatestCommonFactorConsts(consts); 
  var gcfVars = greatestCommonFactorVars(vars); 


  var termParts = []; 

  termParts.push(new Num(gcfNums)); 

  for (var key in gcfVars) {
    if (gcfVars[key] == 1) {
      termParts.push(new Var(key)); 
    } else {
      termParts.push(new Func("pow", [new Var(key), new Num(gcfVars[key])])); 
    }
  }
  
  var result = null; 
  if (termParts.length >= 2) {
    result = new Oper("mult", termParts);
  } else {
    result = termParts[0]; 
  }

  return result; 
}