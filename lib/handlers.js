/**
 * Request handlers
 */

// Dependenciese
let _data = require('./data');
let helpers = require('./helpers')
// Define the handlers
let handlers = {};

// sample handler
handlers.sample = function(data, callback){
// callback a http status code and a payload object
callback(406, {'name': 'sample handler'});
};

// ping handler
handlers.ping = function(data,  callback){
    callback(200);
}

// not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

// users handler
handlers.users = function(data, callback){
    let acceptableMethods = ['post','get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback){
    // Check that all required fields are filled out (check the payload)
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;  
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user doesn't already exist
        _data.read('users',phone,function(err,data){
            if(err){
                // hash the password
                let hashedPassword = helpers.hash(password);
                if(hashedPassword){
                    // Create the user object
                    let userObject ={
                        'firstName':firstName,
                        'lastName':lastName,
                        'phone': phone,
                        'password': hashedPassword,
                        'tosAgreement': true
                    }

                    // store the user object
                    _data.create('users', phone, userObject, function(err){
                        if(!err){
                            callback(200);
                        }
                        else{
                            console.log(err)
                            callback(500, {'Error': 'Could not create the new user'});
                        }

                    });
                }

            }
            else{
                // User already exists
                callback(400,{'Error': 'A user with that phone number already exist'});
            }
        })
    }
    else{
        callback(400,{'Error': 'Missing required fields'});
    }
};  
// Users - get
// Required data: phone and optional none
// @TODO Only let an authenticated user access their objects.Do not let them access anyone's elses
handlers._users.get = function(data, callback){
    // check that the phone number is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;
    if(phone){
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
        //Verify that the token is valid for the specified user
        handlers._tokens.verify(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                // lookup the user
                _data.read('users', phone, function(err,data){
                    if(!err && data){
                        // Remove the hashed password from the user object before returning it.
                        delete data.password;
                        delete data.tosAgreement;
                        callback(200, data); 
                    }
                    else{
                    callback(404);
                    } 
        
                });      
        
            }
            else{
                callback(403, {'Error':'Missing required token or token is invalid'})
            }
        })
        
    }
    else{
        callback(400, {'Error':'Missing required field'})
    }
};

// Users - put
// required data is phone and optional data is all the other field(at least one must be specified)
// @TODO Only let an authenticated user update their own objects 
handlers._users.put = function(data, callback){
    // Check for the required field
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for the optional fields
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    // check if the phone is valid
    if(phone){
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
        //Verify that the token is valid for the specified user
        handlers._tokens.verify(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                if(firstName || lastName || password){
                    // lookup the user
                    _data.read('users', phone, function(err,userdata){
                        if(!err && userdata){
                            // Update the fields
                            if(firstName){
                                userdata.firstName = firstName;
                            }
                            
                            if(lastName){
                                userdata.lastName = lastName;
                            }
                            if(password){
                                userdata.password = helpers.hash(password);
                            }
                        //store the new users updates
                        _data.update('users', phone, userdata,function(err){
                            if(!err){
                                callback(200);
                            }
                            else{
                                console.log(err);
                                callback(500, {'Error': "Could not update the user's data"});
                            }
                        });
        
                        } 
                        else{
                            callback(400, {'Error': "Specified user does not exist"})
                        }
                    });
        
                }else{
                    callback(400, {'Error': 'Missing fields to update'});
                }
            }
            else{
                callback(403, {'Error':'Missing required token or token is invalid'})
            }
        });
        
    }
    else{
        callback(400, {'Error': 'Missing required fields'})
    }


};

// Users - delete
// Required data: phone and optional none
// @TODO Only let an authenticated user access their objects.Do not let them access anyone's elses
handlers._users.delete = function(data, callback){
    // check that the phone number is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim(): false;
    if(phone){
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
        //Verify that the token is valid for the specified user
        handlers._tokens.verify(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                // lookup the user
        _data.read('users', phone, function(err,data){
            if(!err && data){
             _data.delete('users', phone,function(err){
                 if(!err){
                     callback(200);
                 }
                 else{
                     callback(500, {'Error': "Could not delete the specified user"});
                 }
             })       
         }
            else{
             callback(400, {'Error': 'Could not find the specified user'});
            } 
 
         });      
 
            }
            else{
                callback(403, {'Error':'Missing required token or token is invalid'})
            }
        });
        
    }
    else{
        callback(400, {'Error':'Missing required field'})
    }
};

// tokens handler
handlers.tokens = function(data, callback){
    let acceptableMethods = ['post','get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// container for tokens sub methods
handlers._tokens ={}

// Sub methods
// token- post
// Required data: phone number and password
handlers._tokens.post = function(data, callback){
    // Check that all required fields are filled out (check the payload)
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;  
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    if(phone && password){
        // lookup the user who matches the phone number
        _data.read('users', phone, function(err,userData){
            if(!err && userData){
                let hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.password){
                    // If valid, create a token with a random name and set expiration time to 1hr
                    let tokenId = helpers.createRandomStr(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObj = {
                        'phone' : phone,
                        'tokenId' : tokenId,
                        'expires' : expires
                    };

                    // Store token
                    _data.create('tokens', tokenId, tokenObj, function (err){
                        if(!err){
                            callback(200, tokenObj)
                        }
                        else(
                            callback(500, {'Error':'Could not create the new token'})
                        )
                    });
                }
                else{
                    callback(400, {'Error':'Password incorrect!'})
                }
            }
            else{
                callback(400, {'Error': "Could not find specified user."});
            }
        });
    }
    else{
        callback(400,{'Error': 'Missing required fields'});
    }

}

// token get
// Required data: token id
handlers._tokens.get = function(data, callback){
    // check that the token id is valid
    let tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ? data.queryStringObject.tokenId.trim(): false;
    if(tokenId){
        // lookup the token
        _data.read('tokens', tokenId, function(err,tdata){
           if(!err && tdata){
               callback(200, tdata); 
           }
           else{
            callback(404);
           } 

        });      

    }
    else{
        callback(400, {'Error':'Missing required fields'})
    }
}

// token- put
// Required data: id and extend(bool)
handlers._tokens.put = function(data, callback){
    let tokenId = typeof(data.payload.tokenId) == 'string' && data.payload.tokenId.trim().length == 20 ? data.payload.tokenId.trim(): false;
    let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true: false;
    if(tokenId && extend){
        _data.read('tokens', tokenId, function(err,tdata){
            if(!err && tdata){
                // Check to make sure your token is active
                if(tdata.expires > Date.now()){
                    // Extend the expiration time by an hour
                    tdata.expires = Date.now() + 1000 * 60 * 60;

                    //store the new update
                    _data.update('tokens', tokenId, tdata, function(err){
                        if(!err){
                            callback(200);
                        }
                        else{
                            callback(500, {'Error':'Could not update the token'});
                        }
                    })
                }
                else{
                    callback(400, {'Error': 'Specified token has expired'});  
                }
            }
            else{
             callback(404, {'Error': 'Specified token does not exist'});
            } 
 
         });      
 
    }
    else{
        callback(400, {'Error':'Missing required fields'})
    }
}

// token- delete
// Required- toke id
handlers._tokens.delete = function(data, callback){
    let tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ? data.queryStringObject.tokenId.trim(): false;
    if(tokenId){
        // lookup the token
        _data.read('tokens', tokenId, function(err,data){
           if(!err && data){
            _data.delete('tokens', tokenId,function(err){
                if(!err){
                    callback(200);
                }
                else{
                    callback(500, {'Error': "Could not delete the specified token"});
                }
            })       
        }
           else{
            callback(400, {'Error': 'Could not find the specified token'});
           } 

        });      

    }
    else{
        callback(400, {'Error':'Missing required field'})
    }

}

//Verify if a given token is currently valid for a given user
handlers._tokens.verify = function(tokenId, phone, callback){
    // lookup the token
    _data.read('tokens', tokenId, function(err, tdata){
        if(!err && tdata){
            // Check if the token is for the specified user and has not expired
            if(tdata.phone == phone && tdata.expires > Date.now()){
                callback(true);
            }
            else{
                callback(false);
            }

        }
        else{
            callback(false)
        }
    });
}

// export
module.exports = handlers;