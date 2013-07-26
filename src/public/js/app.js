$(document).ready(function(event) {

	var mathModel = undefined; // new MathModel(); 

	var graphView = new GraphView({
		el: document.getElementById("graph_container"),
		model: mathModel
	}); 

	var whiteboardView = new WhiteBoardView({
		el: document.getElementById("whiteboard_container"), 
		model: mathModel
	});


}); 