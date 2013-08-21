var Transforms = {
  commute: function() {

  }, 

  subtractOverEquals: function() {

  }, 

  divideOverEquals: function(numer, denom) {
    var dividedBy = denom.clone(false);
    var divide = function (exp) {
      var children = new Array(exp, dividedBy);
      return new Oper("frac", children);
    }
    Mutations.swapInExp(numer, divide);
    var toSimplify = Mutations.swapInExp(denom, divide);
    toSimplify.simplify();
  }, 

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

          var distributeOver = parent.children[i]; 

          var divTarget = drawDisOrFacTarget(distributeOver);

          divTarget.addEventListener("click", function(event) {
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