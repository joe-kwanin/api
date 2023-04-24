/**
 * Create and export configuration variables
 * 
 */

// Container for the env

let env = {};

// staginf (default) env
env.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret' : 'thisIsASecret'
}

// Production env
env.production = {
    'httpPort': 5000,
    'httpsPort':5001,
    'envName': 'production',
    'hashingSecret' : 'thisIsAlsoASecret'
}

// Determine which env was passed as a command-line argument
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check if the current env is not one of the env above else default is staging
let envToExport =  typeof(env[currentEnv]) == 'object' ? env[currentEnv] : env.staging;

// export the module

module.exports = envToExport;