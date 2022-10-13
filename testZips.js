var zipcodes = require('zipcodes');
// var hills = zipcodes.lookup(78729);
// var dist = zipcodes.distance(77406, 77406); // In Miles

// console.log(hills)

// console.log(dist)


function zipcodeDistancer(zipA, zipB) {

    var results = zipcodes.distance(zipA, zipB);

    if (zipA == zipB) {
        return 0
    } else {
        return results
    }
}


var testSub = zipcodeDistancer(78729, 78729);

console.log(testSub)


// test