var postcss     = require('postcss'),
    parser      = require('./parser').parser,
    unitconvert = require('css-unit-converter'),
    color       = require('css-color-converter');

var convertNodes = function (left, right) {
    var converted = {
        left: left,
        right: right,
        operators: ['!=', '==']
    };
    if (typeof left === 'boolean') {
        if (typeof right !== 'boolean')
            converted.right = Boolean(converted.right.value);
        return converted;
    }
    switch (left.type) {
        case 'ColorValue':
            converted.left = { type: left.type, value: color(left.value).toHexString() };
            switch (right.type) {
              case 'Value':
                    converted.right = { type: left.type, value: color().fromRgb([right.value, right.value, right.value]).toHexString() };
                case left.type:
                    converted.operators = converted.operators.concat(['+', '-', '*', '/']);
                  break;
            }
            break;
        case 'LengthValue':
        case 'AngleValue':
        case 'TimeValue':
        case 'FrequencyValue':
        case 'ResolutionValue':
            switch (right.type) {
                case left.type:
                    converted.right.value = unitconvert(right.value, right.unit, left.unit);
                case 'Value':
                    converted.right = { type: left.type, value: right.value, unit: left.unit };
                    converted.operators = converted.operators.concat(['>=', '>', '<=', '<', '+', '-', '*', '/']);
                    break;
            }
            break;
        case 'EmValue':
        case 'ExValue':
        case 'ChValue':
        case 'RemValue':
        case 'VhValue':
        case 'VwValue':
        case 'VminValue':
        case 'VmaxValue':
        case 'PercentageValue':
            switch (right.type) {
                case left.type:
                case 'Value':
                    converted.right = { type: left.type, value: right.value, unit: left.unit };
                    converted.operators = converted.operators.concat(['>=', '>', '<=', '<', '+', '-', '*', '/']);
                    break;
            }
            break;
        case 'String':
            break;
        case 'Value':
            switch (right.type) {
                case 'ColorValue':
                    converted.left = { type: right.type, value: color().fromRgb([left.value, left.value, left.value]).toHexString() };
                    converted.operators = converted.operators.concat(['+', '-', '*', '/']);
                    break;
                case 'LengthValue':
                case 'AngleValue':
                case 'TimeValue':
                case 'FrequencyValue':
                case 'ResolutionValue':
                    converted.left = { type: right.type, value: left.value, unit: right.unit };
                    converted.operators = converted.operators.concat(['>=', '>', '<=', '<', '+', '-', '*', '/']);
                    break;
                case 'EmValue':
                case 'ExValue':
                case 'ChValue':
                case 'RemValue':
                case 'VhValue':
                case 'VwValue':
                case 'VminValue':
                case 'VmaxValue':
                case 'PercentageValue':
                    converted.left = { type: right.type, value: left.value };
                case 'Value':
                    converted.operators = converted.operators.concat(['>=', '>', '<=', '<', '+', '-', '*', '/']);
                    break;
            }
    }
    return converted;
};

var cmp = function (val1, val2) {
    return val1 === val2 ? 0 : val1 > val2 ? 1 : -1;
};

var evalParseTree = function (tree) {
    var parseBinaryExpression = function (left, right, operator) {
        var converted = convertNodes(left, right);
        left = converted.left;
        right = converted.right;
        var comparison;
        if (typeof left === 'boolean') comparison = cmp(left, right);
        else comparison = cmp(left.value, right.value);

        if (converted.operators.indexOf(operator) < 0) {
            throw new Error("Invalid operands for operator '" + operator+ "'");
        }

        switch (operator) {
            case '==':
                if (left.type !== right.type) return false;
                return comparison === 0;
            case '!=':
                if (left.type !== right.type) return true;
                return comparison !== 0;
            case '>=':
                return comparison >= 0;
            case '>':
                return comparison > 0;
            case '<=':
                return comparison <= 0;
            case '<':
                return comparison < 0;
        }
    };

    var parseMathExpression = function (left, right, operator) {
        var converted = convertNodes(left, right);
        left = converted.left;
        right = converted.right;

        if (converted.operators.indexOf(operator) < 0) {
            throw new Error("Invalid operands for operator '" + operator+ "'");
        }

        if (left.type == 'ColorValue') {
            var val1 = color(left.value).toRgbaArray(),
                val2 = color(right.value).toRgbaArray();

            if (val1[3] !== val2[3]) {
                throw new Error('Alpha channels must be equal');
            }

            switch (operator) {
                case '+':
                    val1[0] = Math.min(val1[0] + val2[0], 255);
                    val1[1] = Math.min(val1[1] + val2[1], 255);
                    val1[2] = Math.min(val1[2] + val2[2], 255);
                    break;
                case '-':
                    val1[0] = Math.max(val1[0] - val2[0], 0);
                    val1[1] = Math.max(val1[1] - val2[1], 0);
                    val1[2] = Math.max(val1[2] - val2[2], 0);
                    break;
                case '*':
                    val1[0] = Math.min(val1[0] * val2[0], 255);
                    val1[1] = Math.min(val1[1] * val2[1], 255);
                    val1[2] = Math.min(val1[2] * val2[2], 255);
                    break;
                case '/':
                    val1[0] = Math.max(val1[0] / val2[0], 0);
                    val1[1] = Math.max(val1[1] / val2[1], 0);
                    val1[2] = Math.max(val1[2] / val2[2], 0);
                    break;
            }
            left.value = color().fromRgba(val1).toHexString();
            return left;
        }

        switch (operator) {
            case '+':
                left.value = left.value + right.value;
                break;
            case '-':
                left.value = left.value - right.value;
                break;
            case '*':
                left.value = left.value * right.value;
                break;
            case '/':
                left.value = left.value / right.value;
                break;
        }
        return left;
    };
    var parseTree = function (subtree) {
        switch (subtree.type) {
            case 'LogicalExpression':
                return subtree.operator === 'AND'
                    ? evalParseTree(subtree.left) && evalParseTree(subtree.right)
                    : evalParseTree(subtree.left) || evalParseTree(subtree.right);
            case 'BinaryExpression':
                return parseBinaryExpression(parseTree(subtree.left), parseTree(subtree.right), subtree.operator);
            case 'MathematicalExpression':
                return parseMathExpression(parseTree(subtree.left), parseTree(subtree.right), subtree.operator);
            case 'UnaryExpression':
                return !parseTree(subtree.argument);
            case 'BooleanValue':
                return subtree.value;
            case 'ColorValue':
                subtree.value = color(subtree.value).toHexString();
                return subtree;
            case 'String':
                return subtree;
            default:
                subtree.value = parseFloat(subtree.value);
                return subtree;
        }
    };
    var result = parseTree(tree);
    if (typeof result !== 'boolean') result = Boolean(result.value);
    return result;
};

var parseElseStatement = function (rule, prevPassed) {
    if (!prevPassed)
        rule.parent.insertBefore(rule, rule.nodes);
    rule.remove();
};

var parseIfStatement = function(rule, input) {
    processRule(rule);
    if (!input)
        throw rule.error('Missing condition', { plugin: 'postcss-conditionals' });
    var previousPassed = arguments[2] || false;
    var passed = false;
    try {
        passed = evalParseTree(parser.parse(input));
    }
    catch (err) {
        throw rule.error('Failed to parse expression', { plugin: 'postcss-conditionals' });
    }
    if (!previousPassed && passed)
        rule.parent.insertBefore(rule, rule.nodes);

    var next = rule.next();
    if (typeof next !== 'undefined' && next.type === 'atrule' && next.name === 'else') {
        if (next.params.substr(0, 2) === 'if')
            parseIfStatement(next, next.params.substr(3), passed || previousPassed);
        else
            parseElseStatement(next, passed || previousPassed);
    }
    rule.remove();
};

function processRule(css) {
    css.walkAtRules('if', function (rule) {
        parseIfStatement(rule, rule.params);
    });
}

module.exports = postcss.plugin('postcss-conditionals', function (opts) {
    opts = opts || {};

    return processRule;
});
