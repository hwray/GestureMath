GraphView = (function() {

  function GraphView(options) {
    this.options = options || {};
    this.modelView = options.modelView || undefined;
    this.setElement(options.el);
    this.initialize(); 
  }

  _.extend(GraphView.prototype, Backbone.Events, {

    // Change the fact that graph_container is hard-coded
    initialize: function() {
      var board = JXG.JSXGraph.initBoard('board_container', {boundingbox:[-5,8,8,-5], axis:true});
      var f, curve; // global objects

      var plotButton = document.getElementById("plot"); 
      var clearButton = document.getElementById("clear"); 

      plotButton.onclick = function() {
        var txtraw = document.getElementById('input').value;
        f = board.jc.snippet(txtraw, true, 'x', true);
        curve = board.create('functiongraph',[f,
          function(){ 
            var c = new JXG.Coords(JXG.COORDS_BY_SCREEN,[0,0],board);
            return c.usrCoords[1];
          },
          function(){ 
            var c = new JXG.Coords(JXG.COORDS_BY_SCREEN,[board.canvasWidth,0],board);
            return c.usrCoords[1];
          }
          ],{name:txtraw, withLabel:true});
        var q = board.create('glider', [2, 1, curve], {withLabel:false});
        var t = board.create('text', [
          function(){ return q.X()+0.1; },
          function(){ return q.Y()+0.1; },
          function(){ return "The slope of the function f(x)=" + txtraw + "<br>at x=" + q.X().toFixed(2) + " is equal to " + (JXG.Math.Numerics.D(f))(q.X()).toFixed(2); }
          ], 
          {fontSize:15});
      };  

      clearButton.onclick = function() {
        JXG.JSXGraph.freeBoard(board);
        board = JXG.JSXGraph.initBoard('board_container', {boundingbox:[-5,8,8,-5], axis:true});
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