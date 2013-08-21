var Transforms = {
  commute: function() {

  }, 

  subtractOverEquals: function() {

  }, 

  divideOverEquals: function(numer, denom) {
    var divide = function (exp) {
      var children = new Array(exp, denom);
      return new Oper("frac", children);
    }
    Mutations.swapInExp(numer, divide);
  }, 

  distribute: function(select, target) {
    for (var i = 0; i < target.children.length; i++) {
      var mult = new Oper("mult", [CloneTree(select), CloneTree(target.children[i])]); 
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
  }, 

  factor: function() {

  }
};