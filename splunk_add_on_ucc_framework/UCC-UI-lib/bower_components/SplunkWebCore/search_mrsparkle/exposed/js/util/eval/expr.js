define(['underscore', './functions', './types', './like'], function(_, EvalFunctions, types, like) {
    var type = types.of;
    
    function EvalExpression() {
        this.initialize.apply(this, arguments);
    }

    _.extend(EvalExpression.prototype, {
        evaluate: function(context) {
            throw new Error("Evaluate not implemented");
        },
        simplify: function() {
            return this;
        },
        returnType: function() {
        },
        mightBeString: function() {
            var t = this.returnType();
            return t == null || t === 'string';
        },
        mightBeNumeric: function() {
            var t = this.returnType();
            return t == null || t === types.NUMBER;
        },
        mightBeBoolean: function() {
            var t = this.returnType();
            return t == null || t === types.BOOLEAN;
        },
        mightBeMultiValue: function(){
            var t = this.returnType();
            return t == null || t === types.MV;
        },
        toString: function() {
            return '//EXPRESSION//';
        },
        compileTimeValue: function() {
            // Return nothing
        },
        children: function() {
            return [];
        },
        walk: function(iterator) {
            _(this.children()).each(function(child) {
                iterator(child);
                child.walk(iterator);
            });
        },
        findVariables: function(unique) {
            var variables = [];
            this.walk(function(expr) {
                if (expr instanceof VariableExpression) {
                    variables.push(expr.name);
                }
            });
            return unique ? _.unique(variables) : variables;
        }
    });

    function extend(Super, name, prototype, classMethods) {
        var Expression = function() {
            Super.apply(this, arguments);
        };
        Expression.name = name;
        _.extend(Expression.prototype, Super.prototype, prototype, { type: name, baseType: Super.prototype.type });
        _.extend(Expression, classMethods || {});
        return Expression;
    }

    var LiteralValueExpression = extend(EvalExpression, "literal", {
        initialize: function(value) {
            this.value = value;
        },
        compileTimeValue: function() {
            return this.value;
        },
        evaluate: function() {
            return this.value;
        },
        returnType: function() {
            return type(this.value);
        },
        toString: function() {
            return JSON.stringify(this.value);
        }
    });

    var VariableExpression = extend(EvalExpression, "variable", {
        initialize: function(name) {
            this.name = name;
        },
        evaluate: function(context) {
            return context.getVar(this.name);
        },
        toString: function() {
            return this.name;
        }
    });

    var FunctionExpression = extend(EvalExpression, "function", {
        initialize: function(name, args) {
            this._name = name;
            this._fn = EvalFunctions[(name || '').toLowerCase()];
            if (!this._fn) {
                throw new Error('Unknown eval function ' + JSON.stringify(name));
            }
            this._args = args;
            var msg;
            if ((msg = this._fn.checkArguments.call(this, args)) !== true) {
                throw new Error('Invalid arguments for eval function ' + name + '()' + (msg ? ': ' + msg : ''));
            }
        },
        evaluate: function(context) {
            var args = this._args;
            var fn = this._fn;

            if (fn.evaluatedArgs) {
                // Pre-evaluated the arguments and pass in the resulting values instead of the expressions
                args = _.map(args, function(arg) {
                    return arg.evaluate(context);
                });

                if (fn.expandMultiValueArg && _.isArray(args[0])) {
                    // Automatically expand the first argument of the function call if it is multi-value
                    // Call the function for each value of the first argument separately and return the results as 
                    // multi-value
                    return _(args[0]).map(function(v) {
                        var newArgs = [v].concat(args.slice(1));
                        return fn.evaluate.apply(context, newArgs);
                    });
                } else {
                    return fn.evaluate.apply(context, args);
                }
            } else {
                return fn.evaluate.apply(context, args);
            }
        },
        returnType: function() {
            return this._fn.type;
        },
        toString: function() {
            return this.name + '(' + _(this._args).invoke('toString').join(', ') + ')';
        },
        children: function() {
            return this._args;
        }
    });

    var ArithmeticExpression = extend(EvalExpression, "arithmetic", {
        initialize: function(operand1, operand2) {
            if (!operand1.mightBeNumeric() || !operand2.mightBeNumeric()) {
                throw new Error('One or more operands are not numeric for arithmetic operation: ' + this.operator);
            }
            this.operand1 = operand1;
            this.operand2 = operand2;
        },
        returnType: function() {
            return 'number';
        },
        toString: function() {
            return ['(', this.operand1.toString(), this.operator, this.operand2.toString(), ')'].join(' ');
        },
        children: function() {
            return [this.operand1, this.operand2];
        }
    });

    var ConcatExpression = extend(EvalExpression, "concat", {
        initialize: function(left, right) {
            if (!left.mightBeString() || !right.mightBeString()) {
                throw new Error('One or more operands are not strings for concat operation');
            }
            this.left = left;
            this.right = right;
        },
        returnType: function() {
            return 'string';
        },
        checkString: function(val) {
            return val != null ? String(val) : null;
        },
        evaluate: function(context) {
            var left = this.checkString(this.left.evaluate(context));
            var right = this.checkString(this.right.evaluate(context));
            return left + right;
        },
        children: function() {
            return [this.left, this.right];
        }
    });

    var AdditionExpression = extend(ArithmeticExpression, 'addition', {
        initialize: function(operand1, operand2) {
            if (!(operand1.mightBeNumeric() || operand1.mightBeString())) {
                throw new Error('Invalid type of left operand for + operation: ' + JSON.stringify(operand1.returnType()));
            }
            if (!(operand2.mightBeNumeric() || operand2.mightBeString())) {
                throw new Error('Invalid type of right operand for + operation: ' + JSON.stringify(operand2.returnType()));
            }
            this.isAddition = _.any(arguments, function(expr) {
                return expr.returnType() === types.NUMBER;
            });
            if (this.isAddition) {
                if (!operand1.mightBeNumeric() || !operand2.mightBeNumeric()) {
                    throw new Error('One or more operands are not numeric for arithmetic operation: ' + this.operator);
                }
            }

            this.isConcat = (!this.isAddition) && _.any(arguments, function(expr) {
                return expr.returnType() === types.STRING;
            });
            if (this.isConcat) {
                if (!operand1.mightBeString() || !operand2.mightBeString()) {
                    throw new Error('One or more operands are not strings for concat operation');
                }
            }

            this.operand1 = operand1;
            this.operand2 = operand2;
        },
        evaluate: function(context) {
            var op1, op2;
            if (this.isAddition) {
                op1 = types.asNumeric(this.operand1.evaluate(context));
                op2 = types.asNumeric(this.operand2.evaluate(context));
            } else if (this.isConcat) {
                op1 = this.checkString(this.operand1.evaluate(context));
                op2 = this.checkString(this.operand2.evaluate(context));
            } else {
                op1 = types.tryNumeric(this.operand1.evaluate(context));
                op2 = types.tryNumeric(this.operand2.evaluate(context));
            }

            return op1 != null && op2 != null ? op1 + op2 : null;
        },
        checkString: ConcatExpression.prototype.checkString,
        returnType: function() {
            if (this.isAddition) {
                return types.NUMBER;
            } else if (this.isConcat) {
                return 'string';
            }
        },
        children: function() {
            return [this.operand1, this.operand2];
        },
        operator: '+'
    });

    var SubtractionExpression = extend(ArithmeticExpression, "subtraction", {
        evaluate: function(context) {
            var op1 = types.asNumeric(this.operand1.evaluate(context));
            var op2 = types.asNumeric(this.operand2.evaluate(context));
            return op1 != null && op2 != null ? op1 - op2 : null;
        },
        operator: '-'
    });

    var MultiplicationExpression = extend(ArithmeticExpression, "multiplication", {
        evaluate: function(context) {
            var op1 = types.asNumeric(this.operand1.evaluate(context));
            var op2 = types.asNumeric(this.operand2.evaluate(context));
            return op1 != null && op2 != null ? op1 * op2 : null;
        },
        operator: '*'
    });

    var DivisionExpression = extend(ArithmeticExpression, "division", {
        evaluate: function(context) {
            var divisor = types.asNumeric(this.operand2.evaluate(context));
            if (divisor != null) {
                if (divisor === 0) {
                    // Division by 0
                    return null;
                }
                var dividend = types.asNumeric(this.operand1.evaluate(context));
                if (dividend != null) {
                    return dividend / divisor;
                }
            }
            return null;
        },
        operator: '/'
    });

    var ModuloExpression = extend(ArithmeticExpression, "modulo", {
        evaluate: function(context) {
            var divisor = types.asNumeric(this.operand2.evaluate(context));
            if (divisor != null) {
                if (divisor === 0) {
                    // Division by 0
                    return null;
                }
                var dividend = types.asNumeric(this.operand1.evaluate(context));
                if (dividend != null) {
                    return dividend % divisor;
                }
            }
            return null;
        },
        operator: '%'
    });

    var ComparisonExpression = extend(EvalExpression, "comparison", {
        initialize: function(operand1, operand2) {
            this.operand1 = operand1;
            this.operand2 = operand2;
        },
        returnType: function() {
            return 'boolean';
        },
        evaluate: function(context) {
            var op1 = this.operand1.evaluate(context);
            var op2 = this.operand2.evaluate(context);
            return op1 != null && op2 != null ? this.compare(op1, op2) : null;
        },
        toString: function() {
            return ['(', this.operand1.toString(), this.operator, this.operand2.toString(), ')'].join(' ');
        },
        children: function() {
            return [this.operand1, this.operand2];
        }
    });

    var EqualsExpression = extend(ComparisonExpression, "equals", {
        compare: function(op1, op2) {
            return op1 === op2;
        },
        operator: '=='
    });

    var NotEqualsExpression = extend(ComparisonExpression, "notEquals", {
        compare: function(op1, op2) {
            return op1 !== op2;
        },
        operator: '!='
    });

    var GreaterThanExpression = extend(ComparisonExpression, 'greater', {
        evaluate: function(context) {
            return this.operand1.evaluate(context) > this.operand2.evaluate(context);
        },
        operator: '>'
    });

    var LessThanExpression = extend(ComparisonExpression, 'less', {
        compare: function(op1, op2) {
            return op1 < op2;
        },
        operator: '<'
    });

    var GreaterThanOrEqualsExpression = extend(ComparisonExpression, 'greaterOrEquals', {
        compare: function(op1, op2) {
            return op1 >= op2;
        },
        operator: '>='
    });

    var LessThanOrEqualsExpression = extend(ComparisonExpression, 'lessOrEquals', {
        compare: function(op1, op2) {
            return op1 <= op2;
        },
        operator: '<='
    });

    function booleanEquivalent(val) {
        return !!val;
    }

    var AndExpression = extend(ComparisonExpression, 'and', {
        evaluate: function(context) {
            return booleanEquivalent(this.operand1.evaluate(context)) && booleanEquivalent(this.operand2.evaluate(context));
        },
        operator: 'AND'
    });

    var OrExpression = extend(ComparisonExpression, 'or', {
        evaluate: function(context) {
            return booleanEquivalent(this.operand1.evaluate(context)) || booleanEquivalent(this.operand2.evaluate(context));
        },
        operator: 'OR'
    });

    var XorExpression = extend(ComparisonExpression, 'xor', {
        evaluate: function(context) {
            return booleanEquivalent(this.operand1.evaluate(context)) || booleanEquivalent(this.operand2.evaluate(context));
        },
        operator: 'XOR'
    });

    var LikeExpression = extend(ComparisonExpression, 'like', {
        initialize: function(operand1, operand2) {
            if ((!operand1.mightBeString()) || (!operand2.mightBeString())) {
                throw new Error('One or more operands are not strings for like expression');
            }
            ComparisonExpression.prototype.initialize.apply(this, arguments);
        },
        evaluate: function(context) {
            return like(this.operand1.evaluate(context), this.operand2.evaluate(context));
        },
        operator: 'LIKE'
    });
    
    var NotExpression = extend(EvalExpression, 'not', {
        initialize: function(expr) {
            if (!expr.mightBeBoolean()) {
                throw new Error('Unare NOT on non boolean expression');
            }
            this.expr = expr;
        },
        returnType: function() {
            return 'boolean';
        },
        evaluate: function(context) {
            return !booleanEquivalent(this.expr.evaluate(context));
        },
        children: function() {
            return [this.expr];
        }
    });

    var NegateExpression = extend(EvalExpression, 'negate', {
        initialize: function(expr) {
            if (!expr.mightBeNumeric()) {
                throw new Error('Unary negate on non numeric expression');
            }
            this.expr = expr;
        },
        simplify: function() {
            if (this.expr instanceof LiteralValueExpression) {
                return new LiteralValueExpression(-this.expr.value);
            }
            return this;
        },
        returnType: function() {
            return 'number';
        },
        evaluate: function(context) {
            var v = types.asNumeric(this.expr.evaluate(context));
            return v != null ? -v : null;
        },
        children: function() {
            return [this.expr];
        }
    });

    var PlusExpression = extend(EvalExpression, 'plus', {
        initialize: function(expr) {
            if (!expr.mightBeNumeric()) {
                throw new Error('Unary plus on non numeric expression');
            }
            this.expr = expr;
        },
        returnType: function() {
            return 'number';
        },
        evaluate: function(context) {
            return this.expr.evaluate(context);
        },
        children: function() {
            return [this.expr];
        }
    });

    return {
        Comparison: ComparisonExpression,
        Literal: LiteralValueExpression,
        Variable: VariableExpression,
        Function: FunctionExpression,
        Addition: AdditionExpression,
        Concat: ConcatExpression,
        And: AndExpression,
        Division: DivisionExpression,
        Equals: EqualsExpression,
        GreaterThan: GreaterThanExpression,
        GreaterThanOrEquals: GreaterThanOrEqualsExpression,
        LessThan: LessThanExpression,
        LessThanOrEquals: LessThanOrEqualsExpression,
        Like: LikeExpression,
        Modulo: ModuloExpression,
        Multiplication: MultiplicationExpression,
        Negate: NegateExpression,
        NotEquals: NotEqualsExpression,
        Not: NotExpression,
        Or: OrExpression,
        Plus: PlusExpression,
        Subtraction: SubtractionExpression,
        Xor: XorExpression
    };
});
