$(document).ready(function(event) {

  function configMathJax() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src  = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";

    var config =  'MathJax.Hub.Config({' +
                  'tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}, ' +
                  '"HTML-CSS": { scale: 300 }, ' +
                  'showMathMenu: false' +
                  '});' +
                  'MathJax.Hub.Startup.onload();';

    if (window.opera) { script.innerHTML = config; }
     else { script.text = config }

    document.getElementsByTagName("head")[0].appendChild(script);
  }

  configMathJax(); 


  var test = "( = y ( / ( exp ( / ( - ( pow ( + x ( - \\mu ) ) 2 ) ) ( * 2 ( pow \\sigma 2 ) ) ) ) ( * \\sigma ( pow ( * 2 \\pi ) ( / 1 2 ) ) ) ) )"; 
  var poly = "( = y ( + (* 40 (pow x 2) x) ( - (* 12 (pow x 3) 12) ) 20 ) )"; 

  var factor = "( = y ( + (* 40 (pow x 2) (pow y 3) (pow n 6)) ( - (* 12 (pow x 3) (pow y 2) (pow n 5)) ) (* 20 x (pow y 2) (pow n 5)) ) )"; 
  var falseFactor = "( = y ( + (* 40 (pow x 2) (pow y 3)) ( - (* 12 (pow y 2) (pow n 5)) ) (* 20 x (pow n 5)) ) )"; 

  var distribute = "( = y ( + (- 50) ( * 10 ( + (* 9 (pow x 2) ) (* 7 x) 4))))"; 
  var distribute2 = "( = y  ( * (+ 10 x) ( + (* 9 (pow x 2) ) (* 7 x) 4)))";
  var test1 = "(= (/ (+ 100 (- (* 4 x))) 3) (+ (/ (+ (* 5 x) 6) 4) 6))";
  var test2 = "(= (+ (/ 6 x) (- (/ 2 (+ x 3)))) (/ (* (- 3) (+ x 5)) (- (+ (pow x 2) (* 3 x)))))";
  var test3 = "(= (log 3 4) (/ 2 5))";
  var test4 = "(= (+ (* 2 (tan x)) (- 1)) 0)";
  var test5 = "(= (+ (pow (sec x) 4) (- (* 3 (pow (sec x) 2))) (- 4)) 0)";
  var test6 = "(= (abs (+ (pow (sec x) 4) (- (* 3 (pow (sec x) 2))) (- 4))) 0)";
  var test7 = "(= y (* x (+ x 3))";
  var test8 = "(= y (+ (log 10 x) (log 10 y) (log 10 z)))";

  var evalTest = "(= y (* (* 2 (pow x 2)) (* 5 (pow x 4))))";
  var addTest = "(= y (+ (* 4 x) 3 5 x ))";
  var addTest2 = "(= y (+ (* 4 x) x (pow x 2) (- (* 5 (pow x 2))) (pow x 3) 3 5 x ))"

  var eval2 = "(= y (+ 3  (* 4 x) (- (* 2 x)) )"; 

  var multTest1 = "(= (+ x 2) (/ (- 1) (- 3)))"

  var multTest2 = "(= y (* (pow x 2) x ))"; 

  var subTest = "(= y (+ (/ 7 x) (- (/  3 x)) ) )"; 

  var goal = "(= (+ (* 2 (+ x 5)) (- 7)) (* 3 (+ x (- 2))) )";
  var divTest = "(= y (/ c (/ a b)))"
  var divTest2 = "(= y (/ (* a b) (* b a)))"


  var test1Parsed = Parser.StringToTree(multTest2);



  currentExp = Parser.StringToTree(factor);


  var mathDiv = document.getElementById("mathDisplay"); 

  var texObj = Parser.TreeToTex(currentExp, true);

  texStr = texObj.texString; 

  texMap = texObj.texMap; 

  mathDiv.innerHTML = texStr; 



  // DOUBLE CHECK THIS
  document.ontouchstart = function(e){ 
      e.preventDefault(); 
  }


  var x = new Var("x");
  var xInstances = test1Parsed.searchForTreeMatches(x);

  var createNeg = function(child) {
    var neg = new Oper("neg", [child]);
    return neg;
  }
  for (var i = 0; i < xInstances.length; i++) {
    Mutations.swapInExp(xInstances[i], createNeg);  
  }



}); 