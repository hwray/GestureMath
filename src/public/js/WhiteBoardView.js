WhiteBoardView = (function() {

  function WhiteBoardView(options) {
    this.options = options || {};
    this.model = options.model || undefined;
    this.modelView = options.modelView || undefined;
    this.setElement(options.el);

    this.el.innerHTML = "Whiteboard here (where you can play with the equation)"; 
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
  	}

  }); 

  return WhiteBoardView; 

})(); 