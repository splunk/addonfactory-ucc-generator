define(['util/console'], function(console) {
    'use strict';
    // Eval Expression parser based on a modified version of
    // JavaScript Expression Parser (JSEP)
    // JSEP may be freely distributed under the MIT License
    // http://jsep.from.so/

    // Node Types
    // ----------

    // This is the full set of types that any JSEP node can be.
    // Store them here to save space when minified
    var COMPOUND = 'Compound';
    var IDENTIFIER = 'Identifier';
    var LITERAL = 'Literal';
    var CALL_EXP = 'CallExpression';
    var UNARY_EXP = 'UnaryExpression';
    var BINARY_EXP = 'BinaryExpression';
    var LOGICAL_EXP = 'LogicalExpression';
    var PERIOD_CODE = 46;
    var COMMA_CODE = 44;
    var DQUOTE_CODE = 34;
    var SQUOTE_CODE = 39;
    var OPAREN_CODE = 40;
    var CPAREN_CODE = 41;
    var SEMCOL_CODE = 59;
    var DOLLAR_CODE = 36;
    var throwError = function(message, index) {
        var error = new Error(message + (index != null ? ' at character ' + index : ''));
        error.index = index;
        error.description = message;
        console.warn('Error in eval expression:', message);
        throw error;
    };
    var t = true;
    var unary_ops = {'-': 1, '!': 0, '+': 1, 'NOT': 0, 'not': 0};
    var binary_ops = {
        'OR': 1, 'AND': 2, 'XOR': 2,
        'or': 1, 'and': 2, 'xor': 2,
        '==': 6, '=': 6, '!=': 6, 'LIKE': 6, 'like': 6,
        '<': 7, '>': 7, '<=': 7, '>=': 7,
        '+': 9, '-': 9,
        '*': 10, '/': 10, '%': 10,
        '.': 11
    };
    var getMaxKeyLen = function(obj) {
        var max_len = 0, len;
        for (var key in obj) {
            if ((len = key.length) > max_len && obj.hasOwnProperty(key)) {
                max_len = len;
            }
        }
        return max_len;
    };
    var max_unop_len = getMaxKeyLen(unary_ops);
    var max_binop_len = getMaxKeyLen(binary_ops);

    var binaryPrecedence = function(op_val) {
        return binary_ops[op_val] || 0;
    };
    var createBinaryExpression = function(operator, left, right) {
        operator = operator.toUpperCase();
        var type = (operator === 'AND' || operator === 'OR' || operator === 'XOR') ? LOGICAL_EXP : BINARY_EXP;
        return {
            type: type,
            operator: operator,
            left: left,
            right: right
        };
    };
    var isDecimalDigit = function(ch) {
        return (ch >= 48 && ch <= 57); // 0...9
    };
    var isIdentifierStart = function(ch) {
        return (ch === 95) || // `_`
            (ch >= 65 && ch <= 90) || // A...Z
            (ch >= 97 && ch <= 122); // a...z
    };
    var isIdentifierPart = function(ch) {
        return (ch === 95) || // `_`
            (ch >= 65 && ch <= 90) || // A...Z
            (ch >= 97 && ch <= 122) || // a...z
            (ch >= 48 && ch <= 57); // 0...9
    };
    var isQuotedIdentifierStart = function(ch) {
        return ch === SQUOTE_CODE || ch === DOLLAR_CODE;
    };
    var jsep = function(expr) {
        if (expr.trim() === '') {
            throwError("Empty expression", 0);
        }
        // `index` stores the character number we are currently at while `length` is a constant
        // All of the gobbles below will modify `index` as we move along
        var index = 0;
        var charAtFunc = expr.charAt;
        var charCodeAtFunc = expr.charCodeAt;
        var exprI = function(i) {
            return charAtFunc.call(expr, i);
        };
        var exprICode = function(i) {
            return charCodeAtFunc.call(expr, i);
        };
        var length = expr.length;
        var gobbleSpaces = function() {
            var ch = exprICode(index);
            // space or tab
            while (ch === 32 || ch === 9) {
                ch = exprICode(++index);
            }
        };
        var gobbleExpression = function() {
            var test = gobbleBinaryExpression();
            gobbleSpaces();
            return test;
        };
        var gobbleBinaryOp = function() {
            gobbleSpaces();
            var to_check = expr.substr(index, max_binop_len), tc_len = to_check.length;
            while (tc_len > 0) {
                if (binary_ops.hasOwnProperty(to_check)) {
                    index += tc_len;
                    return to_check;
                }
                to_check = to_check.substr(0, --tc_len);
            }
            return false;
        };
        var gobbleBinaryExpression = function() {
            var node, biop, prec, stack, biop_info, left, right, i;

            // First, try to get the leftmost thing
            // Then, check to see if there's a binary operator operating on that leftmost thing
            left = gobbleToken();
            biop = gobbleBinaryOp();

            // If there wasn't a binary operator, just return the leftmost node
            if (!biop) {
                return left;
            }

            // Otherwise, we need to start a stack to properly place the binary operations in their
            // precedence structure
            biop_info = {value: biop, prec: binaryPrecedence(biop)};

            right = gobbleToken();
            if (!right) {
                throwError("Expected expression after " + biop, index);
            }
            stack = [left, biop_info, right];

            // Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
            while ((biop = gobbleBinaryOp())) {
                prec = binaryPrecedence(biop);

                if (prec === 0) {
                    break;
                }
                biop_info = {value: biop, prec: prec};

                // Reduce: make a binary expression from the three topmost entries.
                while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                    right = stack.pop();
                    biop = stack.pop().value;
                    left = stack.pop();
                    node = createBinaryExpression(biop, left, right);
                    stack.push(node);
                }

                node = gobbleToken();
                if (!node) {
                    throwError("Expected expression after " + biop, index);
                }
                stack.push(biop_info, node);
            }

            i = stack.length - 1;
            node = stack[i];
            while (i > 1) {
                node = createBinaryExpression(stack[i - 1].value, stack[i - 2], node);
                i -= 2;
            }
            return node;
        };
        var gobbleToken = function() {
            var ch, to_check, tc_len;

            gobbleSpaces();
            ch = exprICode(index);

            if (isDecimalDigit(ch) || ch === PERIOD_CODE) {
                // Char code 46 is a dot `.` which can start off a numeric literal
                return gobbleNumericLiteral();
            } else if (ch === DQUOTE_CODE) {
                // double quotes
                return gobbleStringLiteral();
            } else if (isQuotedIdentifierStart(ch)) {
                // 'foo.bar'
                return gobbleQuotedIdentifier();
            } else {
                to_check = expr.substr(index, max_unop_len);
                tc_len = to_check.length;
                while (tc_len > 0) {
                    if (unary_ops.hasOwnProperty(to_check)) {
                        index += tc_len;
                        var unaryArg = unary_ops[to_check] === 0 ? gobbleExpression() : gobbleToken();
                        if (!unaryArg) {
                            throwError('Unary operation without argument', index);
                        }
                        return {
                            type: UNARY_EXP,
                            operator: to_check,
                            argument: unaryArg,
                            prefix: true
                        };
                    }
                    to_check = to_check.substr(0, --tc_len);
                }

                if (isIdentifierStart(ch) || ch === OPAREN_CODE) { // open parenthesis
                    // `foo`
                    return gobbleVariable();
                }

                return false;
            }
        };
        var gobbleNumericLiteral = function() {
            var number = '', ch, chCode;
            while (isDecimalDigit(exprICode(index))) {
                number += exprI(index++);
            }

            if (exprICode(index) === PERIOD_CODE) { // can start with a decimal marker
                number += exprI(index++);

                while (isDecimalDigit(exprICode(index))) {
                    number += exprI(index++);
                }
            }

            ch = exprI(index);
            if (ch === 'e' || ch === 'E') { // exponent marker
                number += exprI(index++);
                ch = exprI(index);
                if (ch === '+' || ch === '-') { // exponent sign
                    number += exprI(index++);
                }
                while (isDecimalDigit(exprICode(index))) { //exponent itself
                    number += exprI(index++);
                }
                if (!isDecimalDigit(exprICode(index - 1))) {
                    throwError('Expected exponent (' + number + exprI(index) + ')', index);
                }
            }


            chCode = exprICode(index);
            // Check to make sure this isn't a variable name that start with a number (123abc)
            if (isIdentifierStart(chCode)) {
                throwError('Variable names cannot start with a number (' +
                number + exprI(index) + ')', index);
            } else if (chCode === PERIOD_CODE) {
                throwError('Unexpected period', index);
            }

            return {
                type: LITERAL,
                value: parseFloat(number),
                raw: number
            };
        };
        var gobbleStringLiteral = function() {
            var str = '', quote = exprI(index++), closed = false, ch;

            while (index < length) {
                ch = exprI(index++);
                if (ch === quote) {
                    closed = true;
                    break;
                } else if (ch === '\\') {
                    // Check for all of the common escape codes
                    ch = exprI(index++);
                    switch (ch) {
                        case '\\':
                            str += '\\';
                            break;
                        case '"':
                            str += '"';
                            break;
                        case "'":
                            str += "'";
                            break;
                        case 'n':
                            str += '\n';
                            break;
                        case 'r':
                            str += '\r';
                            break;
                        case 't':
                            str += '\t';
                            break;
                        case 'b':
                            str += '\b';
                            break;
                        case 'f':
                            str += '\f';
                            break;
                        case 'v':
                            str += '\x0B';
                            break;
                    }
                } else {
                    str += ch;
                }
            }

            if (!closed) {
                throwError('Unclosed quote after "' + str + '"', index);
            }

            return {
                type: LITERAL,
                value: str,
                raw: quote + str + quote
            };
        };
        var gobbleIdentifier = function() {
            var ch = exprICode(index), start = index, identifier;
            if (isIdentifierStart(ch)) {
                index++;
            } else {
                throwError('Unexpected ' + exprI(index), index);
            }
            while (index < length) {
                ch = exprICode(index);
                if (isIdentifierPart(ch)) {
                    index++;
                } else {
                    break;
                }
            }
            identifier = expr.slice(start, index);
            return {
                type: IDENTIFIER,
                name: identifier
            };
        };
        var gobbleQuotedIdentifier = function() {
            var start = index, identifier, quoteChar = exprICode(index);
            while (index < length) {
                index++;
                if (exprICode(index) === quoteChar) {
                    break;
                }
            }
            identifier = expr.slice(start + 1, index);
            index++;
            return {
                type: IDENTIFIER,
                name: identifier
            };
        };
        var gobbleArguments = function(termination) {
            var ch_i, args = [], node;
            while (index < length) {
                gobbleSpaces();
                ch_i = exprICode(index);
                if (ch_i === termination) { // done parsing
                    index++;
                    break;
                } else if (ch_i === COMMA_CODE) { // between expressions
                    index++;
                } else {
                    node = gobbleExpression();
                    if (!node || node.type === COMPOUND) {
                        throwError('Expected comma', index);
                    }
                    args.push(node);
                }
            }
            return args;
        };
        var gobbleVariable = function() {
            var ch_i, node;
            ch_i = exprICode(index);

            if (ch_i === OPAREN_CODE) {
                node = gobbleGroup();
            } else {
                node = gobbleIdentifier();
            }
            gobbleSpaces();
            ch_i = exprICode(index);
            while (ch_i === OPAREN_CODE) {
                index++;
                if (ch_i === OPAREN_CODE) {
                    // A function call is being made; gobble all the arguments
                    node = {
                        type: CALL_EXP,
                        'arguments': gobbleArguments(CPAREN_CODE),
                        callee: node
                    };
                }
                gobbleSpaces();
                ch_i = exprICode(index);
            }
            return node;
        };
        var gobbleGroup = function() {
            index++;
            var node = gobbleExpression();
            gobbleSpaces();
            if (exprICode(index) === CPAREN_CODE) {
                index++;
                return node;
            } else {
                throwError('Unclosed (', index);
            }
        };
        var nodes = [];
        var ch_i;
        var node;

        while (index < length) {
            ch_i = exprICode(index);

            // Expressions can be separated by semicolons, commas, or just inferred without any
            // separators
            if (ch_i === SEMCOL_CODE || ch_i === COMMA_CODE) {
                index++; // ignore separators
            } else {
                // Try to gobble each expression individually
                if ((node = gobbleExpression())) {
                    nodes.push(node);
                    // If we weren't able to find a binary expression and are out of room, then
                    // the expression passed in probably has too much
                } else if (index < length) {
                    throwError('Unexpected "' + exprI(index) + '"', index);
                }
            }
        }

        // If there's only one expression just try returning the expression
        if (nodes.length === 1) {
            return nodes[0];
        } else {
            throwError('Compound expressions are not supported');
        }
    };

    return {
        parse: jsep
    };
});
