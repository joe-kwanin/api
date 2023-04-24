/**
 * Library for storing and editing data
 * 
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for the modules (to be exported)
let lib = {};

// Base dir of the data folder'
lib.basedir = path.join(__dirname,'/../.data/');

// Write data to a file
lib.create = function(dir,file,data,callback){
    // Open the file for writing
    fs.open(lib.basedir+dir+'/'+file+'.json', 'wx', function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to a string
            let stringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor,stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        }
                        else{
                            callback('Error closing new file');
                        }
                    })
                }
                else{
                    callback('Error wrirting to new file');
                }
            });

        }
        else{
            callback('Could not create a new file. It may already exit');
        }
    });
}

// Read data from a file
lib.read = function(dir, file, callback){
    fs.readFile(lib.basedir+dir+'/'+file+'.json', 'utf-8', function(err,data){
        if(!err && data){
            let parsedData = helpers.parsedJSONtoObject(data)
            callback(false,parsedData);
         }
         else{
        callback(err, data);
         }
    });
}

// Update existing file
lib.update = function(dir, file, data, callback){
    fs.open(lib.basedir+dir+'/'+file+'.json', 'r+', function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to a string
            let stringData = JSON.stringify(data);

            // Truncate the file before writing
            fs.ftruncate(fileDescriptor, function(err){
                if(!err){
                    // write to the file and close it
                    fs.writeFile(fileDescriptor,stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false);
                                }
                                else{
                                    callback('Error closing existing file');
                                }
                            })
                        }
                        else{
                            callback('Error writing to existing file');
                        }
                    });
        
                }
                else{
                    callback('Error truncating file')
                }
            });

            
        } 
        else{
            callback('Could not open the file for update. It may not exit');
        }
    }


)};

// Delete a file
lib.delete = function(dir, file, callback){
    // Unlink
    fs.unlink(lib.basedir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false);
        }
        else{
            callback('Error deleting file');
        }
    });
}


// Export the module
module.exports = lib;