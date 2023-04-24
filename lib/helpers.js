/**
 * Helpers for various tasks
 * 
*/

// dependencies
let crypto  = require('crypto');
let config = require('./cong');

// Containers
let helpers = {};

helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        let hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else{
        return false;
    }
}

helpers.parsedJSONtoObject = function(str){
    try {
       let obj = JSON.parse(str); 
       return obj;
    } catch (error) {
        return {};
    }
}

helpers.createRandomStr = function(strlength){
    strlength = typeof(strlength) == 'number' && strlength > 0 ?  strlength : false;
    if(strlength){
        //Define all possible characters that could go into the string
        let possibleChar = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for(let i = 1; i <=strlength; i++){
            // Get a random character from the possible characters
            randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            // Append the character to str
            str += randomChar;
        }
        return str;
    }
    else{
        return false;
    }
}
// Export modules
module.exports = helpers;