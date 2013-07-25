InputsView = (function() {

  function InputsView(options) {
    this.options = options || {};
    this.model = options.model || undefined;
    this.modelView = options.modelView || undefined;
    this.setElement(options.el);
    this.el.innerHTML = "hello world!"; 
  }

  _.extend(InputsView.prototype, Backbone.Events, {


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

  return InputsView; 

})(); 