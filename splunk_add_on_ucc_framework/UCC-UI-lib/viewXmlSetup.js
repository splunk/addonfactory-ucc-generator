var fs = require('fs');
var globalConfig = require('../globalConfig.json');

var TARGET_FILE_NAME_ARR = ['configuration.xml', 'inputs.xml', 'redirect.xml'];
var BASE_DIR = './build/default/data/ui/views/';
var PLACE_HOLDER = '${package.name}';

var TAName = globalConfig.meta.name;

for (var i = 0; i < TARGET_FILE_NAME_ARR.length; i++) {
    var filePath = BASE_DIR + TARGET_FILE_NAME_ARR[i];
    var content = fs.readFileSync(filePath).toString();
    var newContent = content.replace(PLACE_HOLDER, TAName);
    fs.writeFileSync(filePath, newContent);
}
