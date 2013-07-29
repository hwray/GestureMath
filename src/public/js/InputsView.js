InputsView = (function() {

  function InputsView(options) {
    this.options = options || {};
    this.setElement(options.el);
    this.setTextbox(options.inputBox);
    this.setSubmitButton(options.inputSubmit);
    this.setClearButton(options.inputClear);

    this.initialize();
    popUpDialog(this.$el);
  }

  _.extend(InputsView.prototype, Backbone.Events, {


  	setElement: function(el) {
  		if (!el)
  			throw new Error("View requires a container element");
  		this.el = el instanceof $ ? el.get(0) : el;
  		this.$el = el instanceof $ ? el : $(el);
  	},

    setTextbox: function(el) {
      if (!el)
        throw new Error("View requires a input text element");
      this.inputBox = el instanceof $ ? el.get(0) : el;
    },

    setSubmitButton: function(el) {
      if (!el)
        throw new Error("View requires a submit input button element");
      this.inputSubmit = el instanceof $ ? el.get(0) : el;
    },

    setClearButton: function(el) {
      if (!el)
        throw new Error("View requires a clear input button element");
      this.inputClear = el instanceof $ ? el.get(0) : el;
    },


    // Fix hard-coded container names? 
    initialize: function() {
      var self = this;

      handleSubmit = function() {
        alert(self.inputBox.value);
        var graphView = new GraphView({
          el: document.getElementById("graph_container"),
          expr: self.inputBox.value
        }); 

        var whiteboardView = new WhiteBoardView({
          el: document.getElementById("whiteboard_container"), 
          expr: self.inputBox.value
        });

        self.$el.dialog("close");
      }

      handleClear = function() {
        self.inputBox.value = "";
      }

      this.inputSubmit.addEventListener("click", handleSubmit);
      this.inputClear.addEventListener("click", handleClear);
    }

  });

  return InputsView; 

  function popUpDialog(el) {
    el.dialog({
        height: 130,
        width: 500,
        resizable: false,
        modal: true,
        title: "Enter a math expression:" 
    });
  }

  function drawInputElement(type, parent, value) {
    var elem = document.createElement('input');
    elem.type = type;
    elemId = type + 'input';
    elem.setAttribute('id', elemId);
    elem.value = value;
    parent.appendChild(elem);
    return elem;
  }

})(); 