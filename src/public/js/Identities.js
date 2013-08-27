var addTemplates = {
  /*
  cases:
  x + x
  ax + x
  ax + bx
  -x + x
  -ax + bx
  -ax + -bx
  //*/
  "xPlusx": {
    template: function() { return new Oper("add", [new Meta("x"), new Meta("x")]);},
    rewrite: function(symbolTable) {

    }
  },

  "axPlusx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("mult", [new Meta("a"), new Meta("x")]);
      children[1] = new Meta("x");
      return new Oper("add", children);
    },
    rewrite: function(symbolTable) {

    }
  },

  "axPlusbx": {
    template: function() {
      var children = new Array(2);
      children[0] = new Oper("mult", [new Meta("a"), new Meta("x")]);
      children[1] = new Oper("mult", [new Meta("b"), new Meta("x")]);
      return new Oper("add", children);
    },
    rewrite(symbolTable) {

    }
  },
  "NegxPlusx": {

  },
  "NegaxPlusNegbx": {

  },
  "NegaxPlusbx": {

  }
  //FRACTIONS


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
  //simple cancellation
  //fractions over fractions
}

var Identities = {
  "logProductRule": {
    template: function() {
      var base = new Meta("b");
      var term = new Oper("mult", [new Meta("a"), new Meta("c")]);
      return new Func("log", [base, term]);
    },
    rewrite: function(symbolTable) {
      if (symbolTable && symbolTable["a"] && symbolTable["b"] && symbolTable["c"]) {
        var children = new Array(2);
        children[0] = new Func("log", [symbolTable["b"], symbolTable["a"]]);
        children[1] = new Func("log", [symbolTable["b"], symbolTable["c"]]);
        return new Oper("add", children);
      } else
        throw "Rewrite function for the Log Product Rule requires a symbol table with values for the a, b and c symbols corresponding to the Log Product Rule template."
    }
  },
  "logQuotientRule": {
    template: function() {
      var base = new Meta("b");
      var term = new Oper("frac", [new Meta("a"), new Meta("c")]);
      return new Func("log", [base, term]);
    },
    rewrite: function(symbolTable) {
      if (symbolTable && symbolTable["a"] && symbolTable["b"] && symbolTable["c"]) {
        var children = new Array(2);
        children[0] = new Func("log", [symbolTable["b"], symbolTable["a"]]);
        children[1] = new Oper("neg", [new Func("log", [symbolTable["b"], symbolTable["c"]])]);
        return new Oper("add", children);
      } else
        throw "Rewrite function for the Log Quotient Rule requires a symbol table with values for the a, b and c symbols corresponding to the Log Quotient Rule template."
    }
  },
  "logPowerRule": {
    template: function() {
      var base = new Meta("b");
      var term = new Func("pow", [new Meta("a"), new Meta("c")]);
      return new Func("log", [base, term]);
    },
    rewrite: function(symbolTable) {
      if (symbolTable && symbolTable["a"] && symbolTable["b"] && symbolTable["c"]) {
        var children = new Array(2);
        children[0] = symbolTable["c"];
        children[1] = new Func("log", [symbolTable["b"], symbolTable["a"]]);
        return new Oper("mult", children);
      } else
        throw "Rewrite function for the Log Power Rule requires a symbol table with values for the a, b and c symbols corresponding to the Log Power Rule template."
    }
  }
}