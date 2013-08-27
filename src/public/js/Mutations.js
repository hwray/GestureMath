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
  }
}