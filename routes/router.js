var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Gladiator = require('../models/gladiator');


//GET route for reading data
router.get('/',function(req,res,next){
    return res.sendFile(path.join(__dirname + 'logReg/Profile.html'));
    //return res.sendFile(path.join(__dirname + 'logReg/index.html'));
});

//POST ROUTE for updating data
router.post('/',function(req,res,next){
    //confirm user has typed same password twice
    if(req.body.password !== req.body.passwordConf){
        var err = new Error('Passwords are different, please confirm password');
        err.status = 400;
        res.send("Passwords don't match");
        return next(err);
    }

    if(req.body.email && req.body.username && req.body.password && req.body.passwordConf){
        var userData = {
            email:req.body.email,
            username:req.body.username,
            password:req.body.password,
            funds:50,
        };
        //create new user
        User.create(userData, function (error,user){
            if(error){
                return next(error);
            } else{
                req.session.userId = user._id;
                return res.redirect('/profile.html');
            }
        });
    }else if(req.body.logemail && req.body.logpassword){
        User.authenticate(req.body.logemail, req.body.logpassword, function(error,user){
            if(error || !user){
                var err = new Error('Wrong email or password');
                err.status = 401;
                return next(err);
            }else{
                req.session.userId = user._id;
                return res.redirect('/profile.html');
            }
        });
    }else{
        var err = new Error('All fields required');
        err.status = 400;
        return next(err);
    }
});

/////////////////////////////////////LUDUS PAGE ROUTES
//Create Gladiator
router.post('/ludus',function(req,res,next) {
    var gladiatorData = {
        Name:req.body.name,
        Strength:req.body.strength,
        Agility:req.body.agility,
        Stamina:req.body.stamina,
        Owner:req.body.userName,
    };
    var funds = 0;
    var username = req.body.userName;
    var total = 0;
    console.log("this is the total:" + total);
    total = total +  parseInt(req.body.strength.toString());
    total = total + parseInt(req.body.agility.toString());
    total = total + parseInt(req.body.stamina.toString());
    console.log("total after addition" + total);
    console.log("Starting Funds:" + funds);
   // Get current funds
    User.find({"username": username},{funds:1,_id:0},
        function (error, user){
            if(error){
                return next(error);
            } else{
                if (user === null){
                    var err = new Error('Go Back!');
                    err.status = 400;
                    return next(err);
                } else{

                    for(var i =0; i < user.length; i++){
                         funds += parseInt(user[i].funds);
                        console.log("funds during search" + user[i].funds);
                        if(total > funds){
                            var err = new Error('Insufficient Funds');
                            err.status = 400;
                            return next(err);
                        }else{
                            Gladiator.create(gladiatorData , function (error){
                                if(error){
                                    return next(error);
                                } else{
                                    User.update({"username": username},{$inc: {funds: - total}},
                                        function (error, user){
                                            if(error){
                                                return next(error);
                                            } else{
                                                if (user === null){
                                                    var err = new Error('Go Back!');
                                                    err.status = 400;
                                                    return next(err);
                                                } else{
                                                    return res.redirect('/ludus.html');
                                                }
                                            }
                                        })
                                }
                            });
                        }
                       // console.log("funds after everything " + funds);
                       // return res.redirect('/ludus.html');
                    }

                }
            }
        });
    });
//Upgrade Gladiator
router.post('/Upgrade',function(req,res,next) {
    var name = req.body.existingName;
    var strength = req.body.newStrength;
    var agility = req.body.newAgility;
    var stamina = req.body.newStamina;
    var username = req.body.existingUserName;
    var funds = 0;
    var total = 0;
    console.log("this is the total:" + total);
    total = total + parseInt(req.body.newStrength.toString());
    total = total + parseInt(req.body.newAgility.toString());
    total = total + parseInt(req.body.newStamina.toString());
    console.log("total after addition" + total);
    console.log("Starting Funds:" + funds);
    //Get current funds
    User.find({"username": username}, {funds: 1, _id: 0},
        function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Go Back!');
                    err.status = 400;
                    return next(err);
                } else {

                    for (var i = 0; i < user.length; i++) {
                        funds += parseInt(user[i].funds);
                        console.log("funds during search" + user[i].funds);
                        if (total > funds) {
                            var err = new Error('Insufficient Funds');
                            err.status = 400;
                            return next(err);
                        }
                        else {
                            Gladiator.update({"Name": name},
                                {$inc: {Strength: +strength, Agility: +agility, Stamina: +stamina}},
                                function (error, user) {
                                    if (error) {
                                        return next(error);
                                    } else {
                                        if (user === null) {
                                            var err = new Error('Go Back!');
                                            err.status = 400;
                                            return next(err);
                                        } else {
                                            User.update({"username": username}, {$inc: {funds: -total}},
                                                function (error, user) {
                                                    if (error) {
                                                        return next(error);
                                                    } else {
                                                        if (user === null) {
                                                            var err = new Error('Go Back!');
                                                            err.status = 400;
                                                            return next(err);
                                                        } else {
                                                            return res.redirect('/ludus.html');
                                                        }
                                                    }
                                                })                                        }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        })
});

//Get Current Funds
router.post('/funds', function(req,res,next){
        var username = req.body.username;
        console.log(username);
        User.find({"username": username},{funds:1,_id:0},
        function (error, user){
            if(error){
                return next(error);
            } else{
                if (user === null){
                    var err = new Error('Go Back!');
                    err.status = 400;
                    return next(err);
                } else{
                    var message = "";
                    for(var i =0; i < user.length; i++){
                        message += user[i].funds;
                    }
                    return res.send('<h1> Funds </h1>' + message);
                }
            }
        });
});

//Sea Pillage Routes
router.post('/pillage', function(req,res,next){
    var username = req.body.username;
    console.log(username + " is cashing in");
    var funds = 0;
    console.log(funds);
    funds = parseInt(req.body.funds.toString());
    console.log("after obtaining " + funds);

    User.update({"username": username},{$inc: {funds: + funds}},
        function (error, user){
            if(error){
                return next(error);
            } else{
                if (user === null){
                    var err = new Error('Go Back!');
                    err.status = 400;
                    return next(err);
                } else{
                    return res.send('<h1> You pillaged </h1>' + funds );
                }
            }
        })
})

//Get Your Gladiators
router.post('/ArenaUser',function(req,res,next){
    var username = req.body.userName;
    Gladiator.find({"Owner": username}, {Name:1, Strength:1, Agility:1, Stamina:1,_id:0})
        .exec(function(error,gladiator){
            if(error){
                return next(error);
            } else{
                    for(var i = 0; i < gladiator.length; i++){
                        console.log(gladiator[i].Name);
                    }
                    return res.send('<h1>Gladiator Details.  Use name for upgrade </h1>' + gladiator.toString());
                }
        })
});
//Get all Gladiators
router.post('/ArenaAll',function(req,res,next){
    var username = req.body.userName;
    Gladiator.find({}, {Name:1,_id:0})
        .exec(function(error,gladiator){
            if(error){
                return next(error);
            } else{
                for(var i = 0; i < gladiator.length; i++){
                    console.log(gladiator[i].Name);
                }
                return res.send('<h1>Gladiator Details.  Use name for upgrade </h1>' + gladiator.toString());
            }
        })
});
//Fight Gladiator
//1 and 10
router.post('/FightEasy',function(req,res,next)
{
       var user = req.body.userName;
       var name = req.body.gladiatorName;
       console.log(name);
    Gladiator.find({"Name": name})
        .exec(function (error, gladiator) {
            if (error) {
                return next(error);
            } else {
                if (gladiator === null) {
                    var err = new Error("No gladiator found");
                    err.status = 400;
                    return next(err);
                } else {
                    var total = 0;
                    Gladiator.find({"Name": name},
                        function (error, gladiator){
                            if(error){
                                return next(error);
                            } else{
                                if (gladiator === null){
                                    var err = new Error('Go Back!');
                                    err.status = 400;
                                    return next(err);
                                } else{
                                    var factor = Math.floor(Math.random() * 3) + 1;
                                    console.log(factor);
                                    if(factor === 1){
                                        for(var i =0; i <gladiator.length; i++){
                                            total += gladiator[i].Strength;
                                            console.log("Strength of gladiator: " + total);
                                        }
                                    }
                                    else if(factor === 2){
                                        for(var i = 0; i < gladiator.length; i++){
                                            total += gladiator[i].Agility;
                                            console.log("Agility of gladiator: " + total);
                                        }
                                    }
                                    else{
                                        for(var i = 0; i < gladiator.length; i++){
                                            total += gladiator[i].Stamina;
                                            console.log("Stamina of gladiator");
                                        }
                                    }
                                    /*for(var i =0; i < gladiator.length; i++){
                                        total += gladiator[i].Strength;
                                        total += gladiator[i].Agility;
                                        total += gladiator[i].Stamina;
                                        console.log("Total value of gladiator: " + total);
                                    }
                                    */
                                    var result = Math.floor(Math.random() * 10) + 1;
                                    console.log(total);
                                    console.log(result);
                                    if( total > result ){
                                        var income = total - result;
                                        if(income < 0){
                                            income = income * (-10);
                                        }
                                        else{
                                            income = income * 10;
                                        }
                                        User.update({"username": user},{$inc: {funds: + income}},
                                            function (error, user){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if (user === null){
                                                        var err = new Error('Go Back!');
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        return res.send('<h1> You won with winnings of </h1>' + income);
                                                    }
                                                }
                                            })
                                    }
                                    else{
                                        Gladiator.deleteOne({"Name": name})
                                            .exec(function(error,gladiator){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if(gladiator === null){
                                                        var err = new Error("No Gladiators Found")
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        console.log(name + " was deleted");
                                                    }
                                                }
                                            });
                                        User.update({"username": user},{$inc: {funds: - 10}},
                                            function (error, user){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if (user === null){
                                                        var err = new Error('Go Back!');
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        return res.send('<h1> Your gladiator died and you lost 10 gold</h1>');
                                                    }
                                                }
                                            })
                                    }
                                }
                            }
                        });
                }
            }
        })
});

//10 and 100
router.post('/FightMedium',function(req,res,next)
{
    var user = req.body.userName;
    var name = req.body.gladiatorName;
    console.log(name);
    Gladiator.find({"Name": name})
        .exec(function (error, gladiator) {
            if (error) {
                return next(error);
            } else {
                if (gladiator === null) {
                    var err = new Error("No gladiator found");
                    err.status = 400;
                    return next(err);
                } else {
                    var total = 0;
                    Gladiator.find({"Name": name},
                        function (error, gladiator){
                            if(error){
                                return next(error);
                            } else{
                                if (gladiator === null){
                                    var err = new Error('Go Back!');
                                    err.status = 400;
                                    return next(err);
                                } else{
                                    var factor = Math.floor(Math.random() * 3) + 1;
                                    console.log(factor);
                                    if(factor === 1){
                                        for(var i =0; i <gladiator.length; i++){
                                            total += gladiator[i].Strength;
                                            console.log("Strength of gladiator: " + total);
                                        }
                                    }
                                    else if(factor === 2){
                                        for(var i = 0; i < gladiator.length; i++){
                                            total += gladiator[i].Agility;
                                            console.log("Agility of gladiator: " + total);
                                        }
                                    }
                                    else{
                                        for(var i = 0; i < gladiator.length; i++){
                                            total += gladiator[i].Stamina;
                                            console.log("Stamina of gladiator");
                                        }
                                    }
                                    var result = Math.floor(Math.random() * 100) + 10;
                                    console.log(total);
                                    console.log(result);
                                    if( total > result ){
                                        var income = total - result;
                                        if(income < 0){
                                            income = income * (-10);
                                        }
                                        else{
                                            income = income * 10;
                                        }
                                        User.update({"username": user},{$inc: {funds: + income}},
                                            function (error, user){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if (user === null){
                                                        var err = new Error('Go Back!');
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        return res.send('<h1> You won with winnings of </h1>' + income);
                                                    }
                                                }
                                            })
                                    }
                                    else{
                                        Gladiator.deleteOne({"Name": name})
                                            .exec(function(error,gladiator){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if(gladiator === null){
                                                        var err = new Error("No Gladiators Found")
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        console.log(name + " was deleted");
                                                    }
                                                }
                                            });
                                        User.update({"username": user},{$inc: {funds: - 100}},
                                            function (error, user){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if (user === null){
                                                        var err = new Error('Go Back!');
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        return res.send('<h1> Your gladiator died and you lost 10 gold</h1>');
                                                    }
                                                }
                                            })
                                    }
                                }
                            }
                        });
                }
            }
        })
});

//Between 300 and 3000
router.post('/FightHard',function(req,res,next)
{
    var user = req.body.userName;
    var name = req.body.gladiatorName;
    console.log(name);
    Gladiator.find({"Name": name})
        .exec(function (error, gladiator) {
            if (error) {
                return next(error);
            } else {
                if (gladiator === null) {
                    var err = new Error("No gladiator found");
                    err.status = 400;
                    return next(err);
                } else {
                    var total = 0;
                    Gladiator.find({"Name": name},
                        function (error, gladiator){
                            if(error){
                                return next(error);
                            } else{
                                if (gladiator === null){
                                    var err = new Error('Go Back!');
                                    err.status = 400;
                                    return next(err);
                                } else{
                                    var factor = Math.floor(Math.random() * 3) + 1;
                                    console.log(factor);
                                    if(factor === 1){
                                        for(var i =0; i <gladiator.length; i++){
                                            total += gladiator[i].Strength;
                                            console.log("Strength of gladiator: " + total);
                                        }
                                    }
                                    else if(factor === 2){
                                        for(var i = 0; i < gladiator.length; i++){
                                            total += gladiator[i].Agility;
                                            console.log("Agility of gladiator: " + total);
                                        }
                                    }
                                    else{
                                        for(var i = 0; i < gladiator.length; i++){
                                            total += gladiator[i].Stamina;
                                            console.log("Stamina of gladiator");
                                        }
                                    }
                                    var result = Math.floor(Math.random() * 3000) + 300;
                                    console.log(total);
                                    console.log(result);
                                    if( total > result ){
                                        var income = total - result;
                                        if(income < 0){
                                            income = income * (-10);
                                        }
                                        else{
                                            income = income * 10;
                                        }
                                        User.update({"username": user},{$inc: {funds: + income}},
                                            function (error, user){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if (user === null){
                                                        var err = new Error('Go Back!');
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        return res.send('<h1> You won with winnings of </h1>' + income);
                                                    }
                                                }
                                            })
                                    }
                                    else{
                                        Gladiator.deleteOne({"Name": name})
                                            .exec(function(error,gladiator){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if(gladiator === null){
                                                        var err = new Error("No Gladiators Found")
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        console.log(name + " was deleted");
                                                    }
                                                }
                                            });
                                        User.update({"username": user},{$inc: {funds: - 500}},
                                            function (error, user){
                                                if(error){
                                                    return next(error);
                                                } else{
                                                    if (user === null){
                                                        var err = new Error('Go Back!');
                                                        err.status = 400;
                                                        return next(err);
                                                    } else{
                                                        return res.send('<h1> Your gladiator died and you lost 100 gold</h1>');
                                                    }
                                                }
                                            })
                                    }
                                }
                            }
                        });
                }
            }
        })
});


//Multiplayer Fight
router.post('/FightMulti',function(req,res,next) {
    var user = req.body.username
    var userGladiator = req.body.userGladiator;
    var oppGladiator = req.body.oppGladiator;
    Gladiator.find({"Name": userGladiator})
        .exec(function (error, gladiator) {
            if (error) {
                return next(error);
            } else {
                if (gladiator === null) {
                    var err = new Error("No Gladiator found with the name " + userGladiator);
                    err.status = 400;
                    return next(err);
                }
                else {
                    var total = 0;
                }
                for (var i = 0; i < gladiator.length; i++) {
                    total += gladiator[i].Strength;
                    total += gladiator[i].Agility;
                    total += gladiator[i].Stamina;
                    console.log("Total value of gladiator: " + total);
                }
                var result = 0;
                Gladiator.find({"Name": oppGladiator})
                    .exec(function (error, gladiator) {
                        if (error) {
                            return next(error);
                        } else {
                            if (gladiator === null) {
                                var err = new Error("No Gladiator found with the name " + userGladiator);
                                err.status = 400;
                                return next(err);
                            }
                            else {
                                for (var i = 0; i < gladiator.length; i++) {
                                    result += gladiator[i].Strength;
                                    result += gladiator[i].Agility;
                                    result += gladiator[i].Stamina;
                                    console.log("Total value of gladiator: " + total);
                                }
                                console.log(result);
                                if (total > result) {
                                    var income = total - result;
                                    if (income < 0) {
                                        income = income * (-10);
                                    }
                                    else {
                                        income = income * 10;
                                    }
                                    User.update({"username": user}, {$inc: {funds: +income}},
                                        function (error, user) {
                                            if (error) {
                                                return next(error);
                                            } else {
                                                if (user === null) {
                                                    var err = new Error('Go Back!');
                                                    err.status = 400;
                                                    return next(err);
                                                } else {
                                                    return res.send('<h1> You won with winnings of </h1>' + income);
                                                }
                                            }
                                        })
                                    Gladiator.deleteOne({"Name": oppGladiator})
                                        .exec(function (error, gladiator) {
                                            if (error) {
                                                return next(error);
                                            } else {
                                                if (gladiator === null) {
                                                    var err = new Error("No Gladiators Found")
                                                    err.status = 400;
                                                    return next(err);
                                                } else {
                                                    console.log(oppGladiator + " was deleted");
                                                }
                                            }
                                        });
                                }
                                else {
                                    Gladiator.deleteOne({"Name": userGladiator})
                                        .exec(function (error, gladiator) {
                                            if (error) {
                                                return next(error);
                                            } else {
                                                if (gladiator === null) {
                                                    var err = new Error("No Gladiators Found")
                                                    err.status = 400;
                                                    return next(err);
                                                } else {
                                                    console.log(userGladiator + " was deleted");
                                                }
                                            }
                                        });
                                    User.update({"username": user}, {$inc: {funds: -1000}},
                                        function (error, user) {
                                            if (error) {
                                                return next(error);
                                            } else {
                                                if (user === null) {
                                                    var err = new Error('Go Back!');
                                                    err.status = 400;
                                                    return next(err);
                                                } else {
                                                    return res.send('<h1> Your gladiator died and you lost 1000 gold</h1>');
                                                }
                                            }
                                        })
                                }
                            }
                        }
                    });
            }
        });
});

//GET route after registering
router.get('/profile',function(req,res,next) {
    User.findById(req, req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go Back!');
                    err.status = 400;
                    return next(err);
                } else {
                    return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>');
                }
            }
        });
});

//GET for logout
router.get('/logout',function(req,res,next){
    if(req.session){
        req.session.destroy(function(err){
            if(err){
                return next(err);
            } else{
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;