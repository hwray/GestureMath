var Templates = {
  "logProductRule": function() {
    var children = new Array(2);
    children[0] = new Meta("b");
    children[1] = new Oper("mult", [new Meta("a"), new Meta("c")]);
    return new Func("log", children);
  },
  "logProductRuleR": function() {
    var children = new Array(2);
    children[0] = new Func("log", [new Meta("b"), new Meta("a")]);
    children[1] = new Func("log", [new Meta("b"), new Meta("c")]);
    return new Oper("add", children);
  },
  "logQuotientRule": function() {
    var base = new Meta("b");
    var term = new Oper("frac", [new Meta("a"), new Meta("c")]);
    return new Func("log", [base, term]);
  },
  "logQuotientRuleR": function() {
    var children = new Array(2);
    children[0] = new Func("log", [new Meta("b"), new Meta("a")]);
    children[1] = new Oper("neg", [new Func("log", [new Meta("b"), new Meta("c")])]);
    return new Oper("add", children);
  },
  "logPowerRule": function() {
    var base = new Meta("b");
    var term = new Func("pow", [new Meta("a"), new Meta("c")]);
    return new Func("log", [base, term]);
  },
  "logPowerRuleR": function() {
    var children = new Array(2);
    children[0] = new Meta("c");
    children[1] = new Func("log", [new Meta("b"), new Meta("a")]);
    return new Oper("mult", children);
  },
  "lnProductRule": function() {
    var children = new Array(1);
    children[0] = new Oper("mult", [new Meta("a"), new Meta("c")]);
    return new Func("ln", children);
  },
  "lnProductRuleR": function() {
    var children = new Array(2);
    children[0] = new Func("ln", [new Meta("a")]);
    children[1] = new Func("ln", [new Meta("c")]);
    return new Oper("add", children);
  },
  "lnQuotientRule": function() {
    var term = new Oper("frac", [new Meta("a"), new Meta("c")]);
    return new Func("ln", [term]);
  },
  "lnQuotientRuleR": function() {
    var children = new Array(2);
    children[0] = new Func("ln", [new Meta("a")]);
    children[1] = new Oper("neg", [new Func("ln", [new Meta("c")])]);
    return new Oper("add", children);
  },
  "lnPowerRule": function() {
    var term = new Func("pow", [new Meta("a"), new Meta("c")]);
    return new Func("ln", [term]);
  },
  "lnPowerRuleR": function() {
    var children = new Array(2);
    children[0] = new Meta("c");
    children[1] = new Func("ln", [new Meta("a")]);
    return new Oper("mult", children);
  },
  "expMult": function() {
    var children = new Array(2);
    children[0] = new Func("exp", [new Meta("a")]);
    children[1] = new Func("exp", [new Meta("b")]);
    return new Oper("mult", children);
  },
  "expMultR": function() {
    var sum = new Oper("add", [new Meta("a"), new Meta("b")]);
    return new Func("exp", [sum]);
  },
  "expDiv": function() {
    var children = new Array(2);
    children[0] = new Func("exp", [new Meta("a")]);
    children[1] = new Func("exp", [new Meta("b")]);
    return new Oper("frac", children);
  },
  "expDivR": function() {
    var neg = new Oper("neg", [new Meta("b")]);
    var sum = new Oper("add", [new Meta("a"), neg]);
    return new Func("exp", [sum]);
  },
  "expPow": function() {
    var children = new Array(2);
    children[0] = new Func("exp", [new Meta("a")]);
    children[1] = new Meta("c");
    return new Func("pow", children);
  },
  "expPowR": function() {
    var product = new Oper("mult", [new Meta("a"), new Meta("c")]);
    return new Func("exp", [product]);
  },
  "tan": function() {
    return new Func("tan", [new Meta("x")]);
  },
  "oneOverTan": function() {
    return new Oper("frac", [new Num(1), this["tan"]()]);
  },
  "cot": function() {
    return new Func("cot", [new Meta("x")]);
  },
  "oneOverCot": function() {
    return new Oper("frac", [new Num(1), this["cot"]()]);
  },
  "sin": function() {
    return new Func("sin", [new Meta("x")]);
  },
  "oneOverSin": function() {
    return new Oper("frac", [new Num(1), this["sin"]()]);
  },
  "csc": function() {
    return new Func("csc", [new Meta("x")]);
  },
  "oneOverCsc": function() {
    return new Oper("frac", [new Num(1), this["csc"]()]);
  },
  "cos": function() {
    return new Func("cos", [new Meta("x")]);
  },
  "oneOverCos": function() {
    return new Oper("frac", [new Num(1), this["cos"]()]);
  },
  "sec": function() {
    return new Func("sec", [new Meta("x")]);
  },
  "oneOverSec": function() {
    return new Oper("frac", [new Num(1), this["sec"]()]);
  },
  "sinOverCos": function() {
    return new Oper("frac", [this["sin"](),this["cos"]()]);
  },
  "sinOverTan": function() {
    return new Oper("frac", [this["sin"](),this["tan"]()]);
  },
  "cosTimesTan": function() {
    return new Oper("mult", [this["cos"](), this["tan"]()]);
  },
  "cosOverSin": function() {
    return new Oper("frac", [this["cos"](),this["sin"]()]);
  },
  "pythagoreanIdent1": function() {
    var children = new Array(2);
    children[0] = new Func("pow", [this["sin"](), 2]);
    children[1] = new Func("pow", [this["cos"](), 2]);
    return new Oper("add", children);
  }
}

function RewriteGroup(rewrites){
  if (rewrites && rewrites.length > 1) {
    this.rewrites = rewrites;
    this.symTable = {};
  } else 
  throw "RewriteGroup Object requires an array of at least two equivalent patterns."
}

_.extend(RewriteGroup.prototype, {
  getPossibleRewrites: function(exp) {
    for (var i = 0; i < this.rewrites.length; i++) {
      currRewrite = this.rewrites[i];
      if (exp.equals(currRewrite, this.symTable)) {

        var rewritten = rewrite(this.rewrites, i, this.symTable);
        this.symTable = {}
        return rewritten;
      
      } else 
        this.symTable = {}
    }
    return null;
  }
});

function rewrite(possibleRewrites, exclude, symTable) {
  var rewritten = new Array();
  for (var i = 0; i < possibleRewrites.length; i++) {
    if (i != exclude) {
      var currClone = possibleRewrites[i].clone(false);
      for (var symbol in symTable) {
        Mutations.substituteTree(currClone, new Meta(symbol), symTable[symbol]);
      }
      rewritten.push(currClone)
    }
  }
  return rewritten;
}

var Identities = {
  "logProduct":  new RewriteGroup([Templates["logProductRule"](), Templates["logProductRuleR"]()]),
  "logQuotient": new RewriteGroup([Templates["logProductRuleR"](), Templates["logProductRule"]()]),
  "logPower":    new RewriteGroup([Templates["logPowerRule"](), Templates["logPowerRuleR"]()]),
  "lnPower":     new RewriteGroup([Templates["lnPowerRule"](), Templates["lnPowerRuleR"]]),
  "lnProduct":   new RewriteGroup([Templates["lnProductRule"](), Templates["lnProductRuleR"]()]),
  "lnQuotient":  new RewriteGroup([Templates["lnQuotientRule"](), Templates["lnQuotientRuleR"]()]),
  "expPow":      new RewriteGroup([Templates["expPow"](), Templates["expPowR"]()]),
  "expMult":     new RewriteGroup([Templates["expMult"](), Templates["expMultR"]()]),
  "expDiv":      new RewriteGroup([Templates["expDiv"](), Templates["expDivR"]()]),
  "tan":         new RewriteGroup([Templates["tan"](), Templates["sinOverCos"](), Templates["oneOverCot"]()]),
  "cot":         new RewriteGroup([Templates["cot"](), Templates["cosOverSin"](), Templates["oneOverTan"]()]),
  "sin":         new RewriteGroup([Templates["sin"](), Templates["cosTimesTan"](), Templates["oneOverCsc"]()]),
  "csc":         new RewriteGroup([Templates["csc"](), Templates["oneOverSin"]()]),
  "cos":         new RewriteGroup([Templates["cos"](), Templates["sinOverTan"](), Templates["oneOverSec"]()]),
  "sec":         new RewriteGroup([Templates["sec"](), Templates["oneOverCos"]()]),
  "one":         new RewriteGroup([Templates["pythagoreanIdent1"](), new Num(1)])
}