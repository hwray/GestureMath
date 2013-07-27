InputsView = (function() {

  function InputsView(options) {
    this.options = options || {};
    this.setElement(options.el);
    this.renderInputForm();
    popUpDialog(this.$el);
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
  	},

    renderInputForm: function() {
        
      var expInputBox = drawInputElement('text', this.el, "Enter a math expression: ");
      expInputBox.size = 40;
      var helpButton = drawInputElement('button', this.el, null, "Help");
      var submitButton = drawInputElement('button', this.el, null, "Submit");
      var clearButton = drawInputElement('button', this.el, null, "Clear");
      var self = this;
      handleSubmit = function(){
        var graphView = new GraphView({
          el: document.getElementById("graph_container"),
        }); 

        var whiteboardView = new WhiteBoardView({
          el: document.getElementById("whiteboard_container"), 
        });

        self.$el.dialog("close");
      }

      submitButton.addEventListener("click", handleSubmit);
    }

  });

  return InputsView; 

  function popUpDialog(el) {
    el.dialog({
        height: 170,
        width: 500,
        resizable: false,
        modal: true,
        closeText: "Submit"
    });
  }

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