//User Schema
var messages = require('../../messages');
var mongoose = require('mongoose');
//Creating the schema
var User = new mongoose.Schema({
	user_id: mongoose.Types.ObjectId,
	email: {
		type:String, 
		unique:true,
		required: messages.es.constraints.email
	},
	name: { 
		type:String,
		required: messages.es.constraints.name
	},
	lastName: {
		type:String,
		required: messages.es.constraints.name
	},
	birthDate:Date,
	created: {
		type:Date,
		default: Date.now
	}	

});
module.export = User;
