//var Expressions = require('./Expressions.js');

var SymToOper = function(symbol) {
  switch(symbol) {
    case "+": 
      return "add"; 
      break; 
    case "-":
      return "neg"; 
      break; 
    case "*": 
      return "mult"; 
      break; 
    case "/": 
      return "frac"; 
      break;
    default:  
      return null;
  }
}
  

var funcStrings = ["log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "pow", "exp", "abs"];


var OperToSym =function(val) {
  switch(val)
  {
    case "add": 
      return "+"; 
      break; 
    case "neg":
      return "-"; 
      break; 
    case "mult": 
      return "*"; 
      break; 
    case "frac": 
      return "/"; 
      break; 
    default:
      return null; 
  }
}



Parser = {

  lexer: function(exprString) {
    var tokens = new Array();
    var tokenStr = "";
    for (var i = 0; i < exprString.length; i++ ) {
      var currentChar = exprString[i];

      if (currentChar == ')' || currentChar =='(' || currentChar == ' ') {
        if (tokenStr.length > 0) {
          tokens.push(tokenStr);
          tokenStr = "";
        }
        if (currentChar != ' ')
          tokens.push(currentChar);
      } else {

        tokenStr += currentChar;
      }
      

    }
    return tokens;
  },

  StringToTree: function(exprStr) {

    var exprArr = this.lexer(exprStr); 

    var parseTokens = function(tokens) {

      if (tokens[0] == "(") {

        tokens.shift();
        var expressionType = "";

        if (tokens[0] == "=") {
          expressionType = "equal"
        } else {
          var val = SymToOper(tokens[0]);
          if (val) {
            expressionType = "oper";

          } else if (funcStrings.indexOf(tokens[0]) != -1) {
            val = tokens[0];
            expressionType = "func";

          } else {
            throw "First term in the expression string must either be an operator, function, or equality.";
          }

        }

        tokens.shift();
        var children = [];

        while (tokens.length > 0) {
          var child = {};

          if (!isNaN(parseFloat(tokens[0])) && isFinite(tokens[0])) {

            child = new Num(tokens[0]);

          } else if (tokens[0] == "pi" || tokens[0] == "e") {
            child = new Const(tokens[0]);

          } else if (/^[a-zA-Z\\]*$/.test(tokens[0])) {
            child = new Var(tokens[0]);

          } else if (tokens[0] == "(") {
            child = parseTokens(tokens);

          } else if (tokens[0] == ")") {
            break;

          } else {
            var error = "The term " + tokens[0] + " does not correspond to the syntax of any valid expression types";
            throw error;
          }

          children.push(child)
          tokens.shift();

        }

        var expression = {};
        if (expressionType == "equal") {
          expression = new Equal(val, children);
        } else if (expressionType == "oper") 
          expression = new Oper(val, children);
        else
          expression = new Func(val, children);

        return expression;

      } else {
        throw "Expected '(' at the beginning of expression string.";
      }

    }

    var tree = parseTokens(exprArr);
    tree.parent = null;  
    return tree; 


  },



  TreeToString: function(expTree) {
    var expString = ""; 
    if (expTree.isNum() || 
      expTree.isVar() || 
      expTree.isConst()) {
        expString += expTree.val + " "; 
        return expString; 
    } 
    expString += "( "; 
    if (expTree.type == "EQUAL") {
      expString += "= "; 
    } else if (expTree.type == "OPER") {
      expString += OperToSym(expTree.val) + " "; 
    } else if (expTree.type == "FUNC") {
      expString += expTree.val; 
    }
    if (expTree.children != null) {
      for (var i = 0; i < expTree.children.length; i++) {
        expString += this.TreeToString(expTree.children[i]); 
      }
    }
    expString += ") "; 
    return expString; 
  }, 


// Deal with exponents of functions (secX ^ 4)
// Absolute value? 
// Coloring parens? 
// isLeaf method? 
  TreeToTex: function(expTree) {

    texMap = {}; 

    function computeID(exp) {
      var count = 1; 
      var id = "" + exp.type + exp.val + count; 
      while (texMap[id]) {
        count++; 
        id = "" + exp.type + exp.val + count; 
      }
      texMap[id] = exp; 
      return id; 
    }

    function printNode(expTree, val) {
      var id = computeID(expTree); 
      expTree.id = id; 
      return "\\cssId{" + id + "}{ " + val + "}"; 
    }

    function printTreeToTex(expTree) {

      var texString = ""; 

      if (expTree.isNum() ||
          expTree.isVar() ||
          expTree.isConst()) {
        return printNode(expTree, expTree.val); 
      }

      if (expTree.type == "EQUAL") {
        texString += printTreeToTex(expTree.children[0]); 
        texString += printNode(expTree, "="); 
        texString += printTreeToTex(expTree.children[1]);

      } else if (expTree.type == "OPER") {

        if (expTree.val == "neg") {
          texString += printNode(expTree, "-"); 
          texString += printTreeToTex(expTree.children[0]); 

        } else if (expTree.val == "add") {
          var idArr = new Array(); 
          var length = expTree.children.length; 
          for (var i = 0; i < length; i++) {
            texString += printTreeToTex(expTree.children[i]); 
            if (i < length - 1 && 
                expTree.children[i + 1].val != "neg") {
              var id = computeID(expTree); 
              idArr.push(id); 
              texString += "\\cssId{" + id + "}{+}"; 
            }
          }
          expTree.idArr = idArr;  

        } else if (expTree.val == "mult") {
          var idArr = new Array(); 
          var length = expTree.children.length; 
          for (var i = 0; i < length; i++) {
            if (expTree.children[i].val == "add") {
              texString += "(" + printTreeToTex(expTree.children[i]) + ")"; 
            } else {
              texString += printTreeToTex(expTree.children[i]); 
            }
            if (expTree.children[i].type == "NUM" &&
                expTree.children[i + 1] &&
                expTree.children[i + 1].type == "NUM") {
              var id = computeID(expTree); 
              texString += "\\cssId{" + id + "}{*}"; 
              idArr.push(id); 
            }

            // THIS IS SUPER JANK
            // ADDING ONLY FOR DISTRIBUTION TESTING
            // FIND A BETTER WAY TO DO!!
            if (expTree.children[i].type == "NUM" &&
                expTree.children[i + 1] &&
                expTree.children[i + 1].val == "mult") {
              var id = computeID(expTree); 
              texString += "\\cssId{" + id + "}{*}"; 
              idArr.push(id); 
            }

          }
          expTree.idArr = idArr; 

        } else if (expTree.val == "frac") {
          var id = computeID(expTree);
          expTree.id = id; 
          texString += "\\cssId{" + id + "}{\\frac{";
          texString += printTreeToTex(expTree.children[0]); 
          texString += "}{"; 
          texString += printTreeToTex(expTree.children[1]); 
          texString += "}}";  
        }

      } else if (expTree.type == "FUNC") {
        if (expTree.val == "pow") {
          // var id = computeID(expTree); 
          //expTree.id = id; 
          // texString += "\\cssId{" + id + "}"; 
          var baseType = expTree.children[0].type; 
          if (baseType != "NUM" && 
              baseType != "CONST" &&
              baseType != "VAR") {
            texString += "(" + printTreeToTex(expTree.children[0]) + ")"; 
          } else {
            texString += printTreeToTex(expTree.children[0]); 
          }
          texString += "^{";
          texString += printTreeToTex(expTree.children[1]); 
          texString += "} "; 
        } else if (expTree.val == "exp") {
          var id = computeID(expTree); 
          expTree.id = id; 
          texString += "\\cssId{" + id + "}e^{"; 
          texString += printTreeToTex(expTree.children[0]); 
          texString += "}"; 
        } else if (expTree.val == "abs") {
          // compute id? 
          texString += "|"; 
          texString += printTreeToTex(expTree.children[0]); 
          texString += "| "; 

        } else if (expTree.val == "log") {
          var id = computeID(expTree); 
          expTree.id = id; 
          texString += "\\cssId{" + id + "}log_{"; 
          texString += printTreeToTex(expTree.children[0]) + "}{"; 
          if (expTree.children[1].type == "NUM" ||
              expTree.children[1].type == "CONST" ||
              expTree.children[1].type == "VAR") {
            texString += printTreeToTex(expTree.children[1]); 
          } else {
            texString += "(" + printTreeToTex(expTree.children[1]) + ")"; 
          }
          texString += "}"; 
        } else {
          var id = computeID(expTree); 
          expTree.id = id; 
          texString += "\\cssId{" + id + "}{" + expTree.val + "}"; 
          texString += "(" + printTreeToTex(expTree.children[0]) + ")"
        }
      }
      return texString; 
    }

    var texString = "$$\\displaystyle{" + printTreeToTex(expTree) + "}$$"; 
    texObj = { 
      texString: texString, 
      texMap: texMap
    }; 
    return texObj; 
  }

}
