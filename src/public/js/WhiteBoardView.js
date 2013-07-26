WhiteBoardView = (function() {

  function WhiteBoardView(options) {
    this.options = options || {};
    this.model = options.model || undefined;
    this.modelView = options.modelView || undefined;
    this.setElement(options.el);
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
      var expInputBox = drawInputElement('text', this.el, "Enter a math expression: ");
      expInputBox.size = 50;
      this.el.innerHTML += "&nbsp;&nbsp;&nbsp;&nbsp;";
      var submitButton = drawInputElement('button', this.el, null, "Submit");
      var clearButton = drawInputElement('button', this.el, null, "Clear Board");
      var helpButton = drawInputElement('button', this.el, null, "Help");
      this.el.innerHTML += "<br/>";
      var solveForSelector = drawInputElement('radio', this.el, "I want to solve for:");
    }

  }); 

  return WhiteBoardView; 

  function drawInputElement(type, parent, labelText, value) {
    var elem = document.createElement('input');
    elem.type = type;
    elemId = type + 'input';
    elem.setAttribute('id', elemId);
    if (labelText) {
      var elemLabel = document.createElement('label')
      elemLabel.innerHTML = labelText;
      elemLabel.setAttribute('for', elemId);
      elemLabel.setAttribute('class', 'whiteboardInputLabel');
      parent.appendChild(elemLabel);
    }
    if (value) {
      elem.value = value;
    }
    parent.appendChild(elem);
    return elem;
  }

})(); 