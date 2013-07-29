GraphView = (function() {

  function GraphView(options) {
    this.options = options || {};
    this.modelView = options.modelView || undefined;
    this.setElement(options.el);
    this.expr = options.expr; 
    this.initialize(); 
  }

  _.extend(GraphView.prototype, Backbone.Events, {

    // Change the fact that graph_container is hard-coded
    // Pinch-to-zoom? 
    // Remove dash marks from graph grid? 
    initialize: function() {

      var board = JXG.JSXGraph.initBoard('board_container', {boundingbox:[-10,10,10,-10], axis:true, showCopyright:false, zoom:true});
      var f, curve; // global objects

      var self = this; 

      var plotButton = document.getElementById("plot"); 
      
      plotButton.onclick = function() {

        // NEED: 
        // - Metaprogrammed Javascript function that takes in params, returns value
        // - Sliders for each undefined param

        // var txtraw = document.getElementById('input').value;
        // f = board.jc.snippet(txtraw, true, 'x', true);

        var muS = board.create('slider', [[-5,-6],[5,-6],[-10,0,10]], {name:'mu',snapWidth:0.1});
        var sigS = board.create('slider', [[-5,-8],[5,-8],[0,1,10]], {name:'sigma',snapWidth:0.1});

        f = function (x) {
          return (4 * Math.exp(((-Math.pow((x - muS.Value()), 2)) / Math.pow((2 * sigS.Value()), 2))));
        }

        curve = board.create('functiongraph',[f,
          function(){ 
            var c = new JXG.Coords(JXG.COORDS_BY_SCREEN,[0,0],board);
            return c.usrCoords[1];
          },
          function(){ 
            var c = new JXG.Coords(JXG.COORDS_BY_SCREEN,[board.canvasWidth,0],board);
            return c.usrCoords[1];
          }
          ]); //],{name:txtraw, withLabel:true});
        var q = board.create('glider', [2, 1, curve], {withLabel:false});
        // Slope text 
        /*
        var t = board.create('text', [
          function(){ return q.X()+0.1; },
          function(){ return q.Y()+0.1; },
          function(){ return "The slope of the function f(x)=" + txtraw + "<br>at x=" + q.X().toFixed(2) + " is equal to " + (JXG.Math.Numerics.D(f))(q.X()).toFixed(2); }
          ], 
          {fontSize:15});
        */
      };  

      var clearButton = document.getElementById("clear"); 

      clearButton.onclick = function() {
        JXG.JSXGraph.freeBoard(board);
        board = JXG.JSXGraph.initBoard('board_container', {boundingbox:[-10,10,10,-10], axis:true, showCopyright:false, zoom:true});
        f = null;
        curve = null;
      };
    }, 

  	setElement: function(el) {
  		if (!el)
  			throw new Error("View requires a container element");
  		this.el = el instanceof $ ? el.get(0) : el;
  		this.$el = el instanceof $ ? el : $(el);
  	},

  	getElement: function() {
  		return this.el; 
  	}

  }); 

  return GraphView; 

})(); 