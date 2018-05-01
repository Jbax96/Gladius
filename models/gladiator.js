var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var User = require('../models/user');

var GladiatorSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        trim:true
    },
    Strength:{
        type:Number,
        unique:false,
        required:true,
        trim:true
    },
    Agility:{
        type:Number,
        unique:false,
        required:true,
    },
    Stamina:{
        type:Number,
        unique:false,
        required:true,
    },
    Owner:{
        type:String,
        required:true,
    }
});

var Gladiator = mongoose.model('Gladiator', GladiatorSchema);
module.exports = Gladiator;