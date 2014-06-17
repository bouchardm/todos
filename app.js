var http         = require('http');
var express      = require("express");
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser')
var session      = require('express-session')
var app          = express();
var mode = "normal";


app.use(bodyParser());

app.use(cookieParser("secret")) // required before session.
app.use(session({
    secret: 'keyboard cat'
  , proxy: true // if you do SSL outside of node.
  , cookie: { maxAge: 6000000000 }
}));


app.use(function(req, res, next){
    if (typeof(req.session.todolist) == 'undefined') {
        req.session.todolist = [];
        req.session.idToto = 0;
    }

    next();
});


app.get("/", function(req, res) {
	mode = "normal";
	res.render("index.ejs", {mode: "normal"});
});

app.get("/actif", function(req, res) {
	mode = "actif";
	res.render("index.ejs", {mode: "actif"});
});

app.get("/termine", function(req, res) {
	mode = "termine";
	res.render("index.ejs", {mode: "termine"});
});

// Return list of todo
app.get("/todos", function(req, res) {
	var listTodoTempo = req.session.todolist;
	var listTodo = [];
	var termine = 0;
	var actif = 0;

	for (var i = 0; i <= listTodoTempo.length - 1; i++) {
		if (listTodoTempo[i].done == "false" || listTodoTempo[i].done == false) {
			actif++;
		} else {
			termine++;
		}

		if (mode === "normal") {
			listTodo.push(listTodoTempo[i]);
		} else if (mode === "actif" && (listTodoTempo[i].done == "false" || listTodoTempo[i].done == false)) {
			listTodo.push(listTodoTempo[i]);
		} else if (mode === "termine" && (listTodoTempo[i].done == "true" || listTodoTempo[i].done == true)) {
			listTodo.push(listTodoTempo[i]);
		}
	};

	res.end(JSON.stringify({"todos" : listTodo, "termine" : termine, "actif" : actif}));
});

app.post("/todos", function(req, res) {
	var todo = {
		id : req.session.idToto++,
		str : req.body.str,
		done: false
	};

	req.session.todolist.push(todo);

	req.session.save();

	res.end(JSON.stringify(todo));
});

app.put("/todos/:id", function(req, res) {
	var todo = [];
	for (var i = req.session.todolist.length - 1; i >= 0; i--) {

		if (typeof(req.session.todolist[i]) !== "undefined") {

			if (req.session.todolist[i].id == req.params.id) {
				if (typeof(req.body.str) !== "undefined") {
					req.session.todolist[i].str = req.body.str;
				}
				if (typeof(req.body.done) !== "undefined") {
					req.session.todolist[i].done = req.body.done;
				}

				todo = req.session.todolist[i];
			}
		}
	};
	res.end(JSON.stringify(todo));
	req.session.save();
});

app.delete("/todos/termine", function(req, res) {
	var listTodosTempo = [];

	for (var i = 0; i <= req.session.todolist.length - 1; i++) {
		if (typeof(req.session.todolist[i]) !== "undefined") {
			if (req.session.todolist[i].done == "false" || req.session.todolist[i].done == false) {
				listTodosTempo.push(req.session.todolist[i]);
			}
		}
	};

	req.session.todolist = listTodosTempo;

	res.end(JSON.stringify(listTodosTempo));
	req.session.save();
});

app.delete("/todos/:id", function(req, res) {
	var todo = [];
	var idTodo = null;

	for (var i = req.session.todolist.length - 1; i >= 0; i--) {

		if (typeof(req.session.todolist[i]) !== "undefined") {
			if (req.session.todolist[i].id == req.params.id) {
				idTodo = i;
				todo = req.session.todolist[i];
			}
		}

	};

	if (idTodo != null) {
		req.session.todolist.splice(idTodo, 1);
	}

	res.end(JSON.stringify(todo));
	req.session.save();
});

app.use(express.static(__dirname + '/public'));


app.listen(1337);