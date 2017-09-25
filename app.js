const yargs =  require('yargs');
const axios = require('axios');
const iplocation = require('iplocation');

// ##    ##    ###    ########   ######    ######
//  ##  ##    ## ##   ##     ## ##    ##  ##    ##
//   ####    ##   ##  ##     ## ##        ##
//    ##    ##     ## ########  ##   ####  ######
//    ##    ######### ##   ##   ##    ##        ##
//    ##    ##     ## ##    ##  ##    ##  ##    ##
//    ##    ##     ## ##     ##  ######    ######

const argv = yargs
  .options({
    a: {
      demand: false,
      alias: 'address',
      describe: 'Address to get weather for',
      string: true
    }
  })
  .help()
  .alias('help','h')
  .argv;

var address = argv.address;

// #### ########  ##        #######   ######     ###    ######## ####  #######  ##    ##
//  ##  ##     ## ##       ##     ## ##    ##   ## ##      ##     ##  ##     ## ###   ##
//  ##  ##     ## ##       ##     ## ##        ##   ##     ##     ##  ##     ## ####  ##
//  ##  ########  ##       ##     ## ##       ##     ##    ##     ##  ##     ## ## ## ##
//  ##  ##        ##       ##     ## ##       #########    ##     ##  ##     ## ##  ####
//  ##  ##        ##       ##     ## ##    ## ##     ##    ##     ##  ##     ## ##   ###
// #### ##        ########  #######   ######  ##     ##    ##    ####  #######  ##    ##

var locate = () => {
  if (!address) {
    return iplocation().then((res) => {
      address = `${res.city}, ${res.region}, ${res.country}`;
      var geocodeURL = `http://maps.googleapis.com/maps/api/geocode/json?address=
          ${encodeURIComponent(address)}`;
      return axios.get(geocodeURL);
    });
  } else {
    var geocodeURL = `http://maps.googleapis.com/maps/api/geocode/json?address=
        ${encodeURIComponent(address)}`;
    return axios.get(geocodeURL);
  }
};

//  ######   ########  #######   ######   #######  ########  ########
// ##    ##  ##       ##     ## ##    ## ##     ## ##     ## ##
// ##        ##       ##     ## ##       ##     ## ##     ## ##
// ##   #### ######   ##     ## ##       ##     ## ##     ## ######
// ##    ##  ##       ##     ## ##       ##     ## ##     ## ##
// ##    ##  ##       ##     ## ##    ## ##     ## ##     ## ##
//  ######   ########  #######   ######   #######  ########  ########

locate().then(response => {
  if (response.data.status === 'ZERO_RESULTS') {
    throw new Error('\x1b[31mError: Unable to find that address\x1b[0m');
  }

  var lat = response.data.results[0].geometry.location.lat;
  var lng = response.data.results[0].geometry.location.lng;

// ########     ###    ########  ##    ##  ######  ##    ## ##    ##
// ##     ##   ## ##   ##     ## ##   ##  ##    ## ##   ##   ##  ##
// ##     ##  ##   ##  ##     ## ##  ##   ##       ##  ##     ####
// ##     ## ##     ## ########  #####     ######  #####       ##
// ##     ## ######### ##   ##   ##  ##         ## ##  ##      ##
// ##     ## ##     ## ##    ##  ##   ##  ##    ## ##   ##     ##
// ########  ##     ## ##     ## ##    ##  ######  ##    ##    ##

  var weatherURL = `https://api.darksky.net/forecast/af8603e899b688c28f3fe29c0689fcad/${lat},${lng}?units=si`;
  console.log(response.data.results[0].formatted_address);

  return axios.get(weatherURL);
}).then(response => {
  var temp = response.data.currently.temperature;
  var apparentTemp = response.data.currently.apparentTemperature;

  console.log(`It's currently ${temp}ºF, but it feels like ${apparentTemp}ºF`);
}).catch(e => {
  if (e.message === 'All providers failed.') {
    console.log('\x1b[31mError: Unable to determine location.\x1b[0m');
  } else if (e.code === 'ENOTFOUND') {
    console.log('\x1b[31mError: Unable to connect to Google servers\x1b[0m');
  } else {
    console.log(`\x1b[31mError: ${e.message}\x1b[0m`);
  }
});
