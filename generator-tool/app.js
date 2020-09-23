
const fs = require('fs');
const path = require('path');

const mccMncJsonPath = path.join(__dirname, 'mccmnc.json');
const outputPath = path.join(__dirname, '../src/Carriers.h');

const jsonData = JSON.parse(fs.readFileSync(mccMncJsonPath));

// [{"mcc":"289","mnc":"88","iso":"ge","country":"Abkhazia","name":"A-Mobile"},{"mcc":"289","mnc":"68","iso":"ge","country":"Abkhazia","name":"A-Mobile"},{"mcc":"289","mnc":"67","iso":"ge","country":"Abkhazia","name":"Aquafon"},{"mcc":"412","mnc":"88","iso":"af","country":"Afghanistan","name":"Afghan Telecom Corp. (AT)"},{"mcc":"412","mnc":"80","iso":"af","country":"Afghanistan","name":"Afghan Telecom Corp. (AT)"},{"mcc":"412","mnc":"01","iso":"af","country":"Afghanistan","name":"Afghan Wireless/AWCC"},

let countryMap = {};
let carrierMap = {};
let nameMap = {};

// There are a few ambiguous mcc, force values here
countryMap['310'] = 'United States'; // Also Guam
countryMap['340'] = 'French Guiana, Guadeloupe, Martinique';
countryMap['362'] = 'Curacao, Netherlands Antilles';

countryMap['425'] = 'Israel'; // also Palestinian Territory
countryMap['901'] = 'International Networks';


for(let ii = 0; ii < jsonData.length; ii++) {
    const mcc = make3digit(jsonData[ii].mcc);
    const mnc = make3digit(jsonData[ii].mnc);
    const country = jsonData[ii].country;
    const name = jsonData[ii].name;

    if (!countryMap[mcc]) {
        countryMap[mcc] = country;
    }
    /*
    if (countryMap[mcc] != country) {
        console.log("ambiguous mcc " + mcc + " " + countryMap[mcc] + ", " + country);
    }
    */

    if (!nameMap[name]) {
        nameMap[name] = [];
    }
    nameMap[name].push(mcc + mnc);

    carrierMap[mcc + mnc] = name;
}

let code = '';

// Generate C code for the binary representation
let countryMapCode = '';
for(let mcc in countryMap) {
    // console.log(mcc + ': ' + countryMap[mcc]);
    countryMapCode += makeBinaryFrom3digits(mcc, 0) + ', // ' + mcc + '\n';
    countryMapCode += makeBinaryString(countryMap[mcc]) + ', // ' + countryMap[mcc] + '\n';
}
countryMapCode += '0, 0\n';

code += 'const uint8_t countryMap[' + calculateSize(countryMapCode) + '] = {\n' + countryMapCode + '};\n';

/*
for(let mccmnc in carrierMap) {
    console.log(mccmnc + ': ' + carrierMap[mccmnc]);
}
*/

let carrierMapCode = '';

for(let name in nameMap) {
    for(let ii = 0; ii < nameMap[name].length; ii++) {
        let orInHigh = ((ii + 1) < nameMap[name].length) ? 0x80 : 0;

        carrierMapCode += makeBinaryFromMccmnc(nameMap[name][ii], orInHigh) + ', // ' + nameMap[name][ii] + '\n';
    }
    carrierMapCode += makeBinaryString(name) + ', // ' + name + '\n';
}
carrierMapCode += '0, 0, 0, 0\n';


code += 'const uint8_t carrierMap[' + calculateSize(carrierMapCode) + '] = {\n' + carrierMapCode + '};\n';

const codeSize = calculateSize(code);
code += '// Code size=' + codeSize + '\n';

fs.writeFileSync(outputPath, code);

function make3digit(s) {
    if (s.length < 3) {
        return '0000000'.substr(0, 3 - s.length) + s;
    }
    else {
        return s;
    }
}

function makeBinaryFrom3digits(s, orInHighByte) {
    const value = parseInt(s);

    const highByte = ((value >> 8) & 0xff) | orInHighByte;
    const lowByte = value & 0xff;

    return highByte.toString() + ', ' + lowByte.toString(); 
}

function makeBinaryFromMccmnc(s, orInHigh) {

    return makeBinaryFrom3digits(s.substr(0, 3), orInHigh) + ', ' + makeBinaryFrom3digits(s.substr(3, 3));
}

function makeBinaryString(s) {
    var result = '';

    // Output string characters
    for(let ii = 0; ii < s.length; ii++) {
        result += s.charCodeAt(ii).toString() + ', ';
    }
    // Terminating null
    result += '0';

    return result;
}

function calculateSize(s) {
    let count = 0;

    for(let ii = 0; ii < s.length; ii++) {
        if (s.charAt(ii) == ',') {
            count++;
        }
    }
    if (count > 0) {
        count++;
    }

    return count;
}