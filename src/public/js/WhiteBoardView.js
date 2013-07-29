WhiteBoardView = (function() {

  function WhiteBoardView(options) {
    this.options = options || {};
    this.modelView = options.modelView || undefined;
    this.setElement(options.el);
    this.expr = options.expr; 
    this.renderEmptyWhiteBoard();
  }

  _.extend(WhiteBoardView.prototype, Backbone.Events, {


  	setElement: function(el) {
  		if (!el)
  			throw new Error("View requires a container element");
  		this.el = el instanceof $ ? el.get(0) : el;
  		this.$el = el instanceof $ ? el : $(el);
  		console.log(this.el); 
  	},

  	getElement: function() {
  		return this.el; 
  	},

    renderEmptyWhiteBoard: function() { 

    }

  }); 

  return WhiteBoardView; 

})(); 