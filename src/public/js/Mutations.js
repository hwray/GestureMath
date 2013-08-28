Mutations = {

  swapInExp: function(insertInstance, constructorFunc) {

    var match = insertInstance;
    var swapParent = match.parent;
      
    var toSwap = constructorFunc(match);
    match.parent = toSwap;
    toSwap.parent = swapParent;

    if(swapParent) {
      var childArrIndex = swapParent.children.indexOf(match);
      swapParent.children[childArrIndex] = toSwap; 
    }

    return toSwap;
    
  }, 

  // Pass in rewrite pair of trees
  substituteTree: function(tree, matchTree, subTree) {
    var matches = tree.searchForTreeMatches(matchTree);
    var subs = new Array(); 
    for (var i = 0; i < matches.length; i++) {
      var parent = matches[i].match.parent; 
      var index = matches[i].childArrIndex; 
      var sub = subTree.clone(); 
      parent.children[index] = sub;  
      sub.parent = parent; 
      subs.push(sub); 
    }
    return subs; 
  },

  replaceExp: function(tree, replacement) {
    var parent = tree.parent;
    replacement.parent = parent;
    if (parent) {
      var treeIndex = parent.children.indexOf(tree);
      parent.children[treeIndex] = replacement;
      if (parent.type === "OPER" && !parent.validOpers[parent.val].validate(parent.children)) {
        this.replaceExp(parent, replacement);
      }
    }

    return replacement;
  },

  // This is pretty janky right now
// Flattens children both before and after
// propagate 0s in mult ops? 
// rearrange mult children? (num-const-var order?)
  flattenTree: function(tree) {
    if (tree.children) {
      for (var i = 0; i < tree.children.length; i++) {
        this.flattenTree(tree.children[i]); 
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
      console.log("enters neg elimination")
      var parent = tree.parent; 
      var grandChild = tree.children[0].children[0]; 

      var index = parent.children.indexOf(tree);
      parent.children[index] = grandChild; 
      grandChild.parent = parent; 
    }

    // Eliminate "pow" funcs with an exponent of 0
    if (tree.val == "pow" &&
        tree.children[1].val == 0) {
      var parent = tree.parent; 
      var index = parent.children.indexOf(tree); 
      parent.children.splice(index, 1); 
    }

    // Reduce "pow" funcs with an exponent of 1 to their base
    if (tree.val == "pow" &&
        tree.children[1].val == 1) {
      var parent = tree.parent; 
      var index = parent.children.indexOf(tree); 
      parent.children[index] = tree.children[0]; 
      tree.children[0].parent = parent; 
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
        this.flattenTree(tree.children[i]); 
      }
    }
  }
}