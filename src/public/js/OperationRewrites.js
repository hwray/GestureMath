function additionRewrite(a, b, x) {
  var coef = null;
  if ((a.isNum() || (a.val === "neg" && a.children[0].isNum()) ) 
    && (b.isNum() ||(b.val === "neg" && b.children[0].isNum()))) {

    var sum = 0;
    a.val === "neg" ? sum += (-1 * a.children[0].val) : sum += a.val;
    b.val === "neg" ? sum += (-1 * b.children[0].val) : sum += b.val;
    var numExp = new Num(Math.abs(sum));
    if (sum === 0) return numExp;
    sum < 0 ? coef = new Oper("neg", [numExp]) : coef = numExp;
    console.log(coef);
  } else 
    coef = new Oper("add", [a, b]);

  return new Oper("mult", [coef, x]);
}

//x + y

var addTemplates = {
  "xPlusx": {
    template: function() { return new Oper("add", [new Meta("x"), new Meta("x")]);},
    rewrite: function(symbolTable) { return new Oper("mult", [new Num(2), symbolTable["x"]]);}
  },

  "axPlusx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("mult", [new Meta("a"), new Meta("x")]);
      children[1] = new Meta("x");
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      return additionRewrite(symbolTable["a"], new Num(1), symbolTable["x"])
    }
  },

  "axPlusbx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("mult", [new Meta("a"), new Meta("x")]);
      children[1] = new Oper("mult", [new Meta("b"), new Meta("x")]);
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      return additionRewrite(symbolTable["a"], symbolTable["b"], symbolTable["x"]);
    }
  },

  "NegxPlusx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("neg", [new Meta("x")]);
      children[1] = new Meta("x");
      return new Oper("add", children)
    },
    rewrite: function(symbolTable) {
      return new Num(0);
    }
  },

  "NegaxPlusNegbx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("neg", [new Oper("mult", [new Meta("a"), new Meta("x")])]);
      children[1] = new Oper("neg", [new Oper("mult", [new Meta("b"), new Meta("x")])]);
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      var negA = new Oper("neg", [symbolTable["a"]]);
      var negB = new Oper("neg", [symbolTable["b"]]);
      return additionRewrite(negA, negB, symbolTable["x"]);
    }
  },
  "NegaxPlusbx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("neg", [new Oper("mult", [new Meta("a"), new Meta("x")])]);
      children[1] = new Oper("mult", [new Meta("b"), new Meta("x")]);
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      var negA = new Oper("neg", [symbolTable["a"]]);
      return additionRewrite(negA, symbolTable["b"], symbolTable["x"]);
    }
  },
  "NegaxPlusx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("neg", [new Oper("mult", [new Meta("a"), new Meta("x")])]);
      children[1] = new Meta("x");
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      var negA = new Oper("neg", [symbolTable["a"]]);
      return additionRewrite(negA, new Num(1), symbolTable["x"]);
    }
  },
  "NegaxPlusNegx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("neg", [new Oper("mult", [new Meta("a"), new Meta("x")])]);
      children[1] = new Oper("neg", [new Meta("x")]);
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      var negA = new Oper("neg", [symbolTable["a"]]);
      return additionRewrite(negA, new Oper("neg", [Num(1)]), symbolTable["x"]);
    }
  },
  "axPlusNegx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("mult", [new Meta("a"), new Meta("x")]);
      children[1] = new Oper("neg", [new Meta("x")]);
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      return additionRewrite(symbolTable["a"], new Oper("neg", [new Num(1)]), symbolTable["x"]);
    }
  },
  "fracAdd": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("frac", [new Meta("a"), new Meta("b")]);
      children[1] = new Oper("frac", [new Meta("c"), new Meta("b")]);
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {
      var numerator = new Oper("add", [symbolTable["a"], symbolTable["c"]]); 
      var denominator = symbolTable["b"];
      return new Oper("frac", [numerator, denominator]);
    }
  },
  "xPlusy": {
    template: function() {
      return new Oper("add", [new Meta("a"), new Meta("b")]);
    },
    rewrite: function(symbolTable) {
      return additionRewrite(symbolTable["a"], symbolTable["b"], new Num(1));
    }
  }
}

var multTemplates = {
  /*
  pow x * pow x
  pow x * x
  x * x
  frac(a/b) * c
  frac(a/b) * frac(c/d)
  negx * x


  //*/
}

var fracTemplate = {
  //simple cancellation (x/x)
  //(ax/x)
  //x/(ax)
  //pow(x a)/pow(x b)
  //x/pow(x a)
  //pow(x a)/ x
  //fractions over fractions
}