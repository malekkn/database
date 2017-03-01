"use strict";
var fs = require('fs');
var mysql = require('mysql');
const express = require('express');
const app = express();
app.use(require('body-parser').json());

var config = JSON.parse(fs.readFileSync("credentials.json"))
var connection = mysql.createConnection({
	host: config.host,
	user: config.user,
	password: config.password,
	port: config.port,
	database: config.database
});
connection.connect();

//--------------------------------------------------------------------

app.get('/todo',(req, res, next) => {
	connection.query('SELECT * FROM todos ORDER BY id DESC LIMIT 7',(error, results, fields) => {
	res.status(200).json(results);
	console.log("latest 7 tasks sent");
	});
});

app.get('/todo/:id',(req, res, next) => {
	var sql = "SELECT * FROM ?? WHERE ?? = ?";
	var inserts = ['todos', 'id', req.params.id];
	sql = mysql.format(sql, inserts);
	connection.query(sql, (error, results, fields) => {
		if (results.length > 0){	
			res.status(200).json(results);
			console.log("task " + req.params.id + " sent");
		} else {
			console.log("error task " + req.params.id + " not found in the database");
			res.status(404).json({"message":"Not Found"});
		}
	});	
});

app.post('/todo',(req, res, next) => {
	const task = req.query.task;
	if(task){
		var sql = "INSERT INTO ?? (Name) VALUES (?)";
		var inserts = ['todos', task];
		sql = mysql.format(sql, inserts);
		connection.query(sql, (error, results, fields) => {
			res.status(201).send(sql);	
			console.log("task " + task + " added");
		});
	} else {
		console.log('new task query not found in the request')
		res.status(400).json({"message":"add task query plz"});
	}
});

app.patch('/todo/:id',(req, res, next) => {
	const id = Number(req.params.id);
	const newTask = req.query.task
	if (id && newTask){
		var sql = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
		var inserts = ['todos', 'name', newTask, 'id', id];
		sql = mysql.format(sql, inserts);
		connection.query(sql, (error, results, fields) => {
			if(results.affectedRows !== 0){
				res.status(200).json({"message":"task "+ id +" updated"});
				console.log("task " + id + " got updated");
			} else {
				console.log("error " + req.params.id + " or " + newTask + " not found in the database");
				res.status(400).json({"message":"plz send an existed id in your request"});
			}
		});
	} else{
		res.status(400).json({"message":"plz send a proper request"});
	}
});

app.delete('/todo/:id',(req, res, next) => {
		const id = Number(req.params.id);
		if(id){
			var sql = "DELETE FROM todos WHERE id=?";
			sql = mysql.format(sql, [id]);
			connection.query(sql, (error, results, fields) => {
				if(results.affectedRows !== 0){
					res.status(200).json({"message":"task "+ id +" deleted"});
					console.log("task " + req.params.id + " got deleted");
				} else {
					console.log("error task with the id " + req.params.id + " not found in the database");
					res.status(404).json({"message":"Not Found"});
				}
			});
	} else {
		res.status(400).json({"message":"plz send a proper request"});
	}
});

app.listen(3000, ()=>{
	console.log('listening to port 3000')
});