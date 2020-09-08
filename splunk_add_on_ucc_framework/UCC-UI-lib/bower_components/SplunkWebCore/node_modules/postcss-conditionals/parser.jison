/* description: Parses expressions. */

/* lexical grammar */
%lex
%%
\s+                                                                            /* skip whitespace */
"true"                                                                                return 'BOOL';
"TRUE"                                                                                return 'BOOL';
"false"                                                                               return 'BOOL';
"FALSE"                                                                               return 'BOOL';
"AND"                                                                                 return 'OP';
"and"                                                                                 yytext = yytext.toUpperCase(); return 'OP';
"OR"                                                                                  return 'OP';
"or"                                                                                  yytext = yytext.toUpperCase(); return 'OP';
"NOT"                                                                                 return 'NOT';
"not"                                                                                 yytext = yytext.toUpperCase(); return 'NOT';
"*"                                                                                   return 'MUL';
"/"                                                                                   return 'DIV';
"+"                                                                                   return 'ADD';
"-"                                                                                   return 'SUB';
rgb\(\s*[0-9]+\%?\s*\,\s*[0-9]+\%?\s*\,\s*[0-9]+\%?\s*\)                              return 'COLOR';
hsl\(\s*[0-9]+\s*\,\s*[0-9]+\%\s*\,\s*[0-9]+\%\s*\)                                   return 'COLOR';
rgba\(\s*[0-9]+\%?\s*\,\s*[0-9]+\%?\s*\,\s*[0-9]+\%?\s*\,\s*([0-1]|0?\.[0-9]+)\s*\)   return 'COLOR';
hsla\(\s*[0-9]+\s*\,\s*[0-9]+\%\s*\,\s*[0-9]+\%\s*\,\s*([0-1]|0?\.[0-9]+)\s*\)        return 'COLOR';
\#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?\b                                                   return 'COLOR';
\#[0-9a-fA-F]{3}([0-9a-fA-F])?\b                                                      return 'COLOR';
"aliceblue"                                                                           return 'COLOR';
"antiquewhite"                                                                        return 'COLOR';
"aqua"                                                                                return 'COLOR';
"aquamarine"                                                                          return 'COLOR';
"azure"                                                                               return 'COLOR';
"beige"                                                                               return 'COLOR';
"bisque"                                                                              return 'COLOR';
"black"                                                                               return 'COLOR';
"blanchedalmond"                                                                      return 'COLOR';
"blue"                                                                                return 'COLOR';
"blueviolet"                                                                          return 'COLOR';
"brown"                                                                               return 'COLOR';
"burlywood"                                                                           return 'COLOR';
"cadetblue"                                                                           return 'COLOR';
"chartreuse"                                                                          return 'COLOR';
"chocolate"                                                                           return 'COLOR';
"coral"                                                                               return 'COLOR';
"cornflowerblue"                                                                      return 'COLOR';
"cornsilk"                                                                            return 'COLOR';
"crimson"                                                                             return 'COLOR';
"cyan"                                                                                return 'COLOR';
"darkblue"                                                                            return 'COLOR';
"darkcyan"                                                                            return 'COLOR';
"darkgoldenrod"                                                                       return 'COLOR';
"darkgray"                                                                            return 'COLOR';
"darkgreen"                                                                           return 'COLOR';
"darkgrey"                                                                            return 'COLOR';
"darkkhaki"                                                                           return 'COLOR';
"darkmagenta"                                                                         return 'COLOR';
"darkolivegreen"                                                                      return 'COLOR';
"darkorange"                                                                          return 'COLOR';
"darkorchid"                                                                          return 'COLOR';
"darkred"                                                                             return 'COLOR';
"darksalmon"                                                                          return 'COLOR';
"darkseagreen"                                                                        return 'COLOR';
"darkslateblue"                                                                       return 'COLOR';
"darkslategray"                                                                       return 'COLOR';
"darkslategrey"                                                                       return 'COLOR';
"darkturquoise"                                                                       return 'COLOR';
"darkviolet"                                                                          return 'COLOR';
"deeppink"                                                                            return 'COLOR';
"deepskyblue"                                                                         return 'COLOR';
"dimgray"                                                                             return 'COLOR';
"dimgrey"                                                                             return 'COLOR';
"dodgerblue"                                                                          return 'COLOR';
"firebrick"                                                                           return 'COLOR';
"floralwhite"                                                                         return 'COLOR';
"forestgreen"                                                                         return 'COLOR';
"fuchsia"                                                                             return 'COLOR';
"gainsboro"                                                                           return 'COLOR';
"ghostwhite"                                                                          return 'COLOR';
"gold"                                                                                return 'COLOR';
"goldenrod"                                                                           return 'COLOR';
"gray"                                                                                return 'COLOR';
"green"                                                                               return 'COLOR';
"greenyellow"                                                                         return 'COLOR';
"grey"                                                                                return 'COLOR';
"honeydew"                                                                            return 'COLOR';
"hotpink"                                                                             return 'COLOR';
"indianred"                                                                           return 'COLOR';
"indigo"                                                                              return 'COLOR';
"ivory"                                                                               return 'COLOR';
"khaki"                                                                               return 'COLOR';
"lavender"                                                                            return 'COLOR';
"lavenderblush"                                                                       return 'COLOR';
"lawngreen"                                                                           return 'COLOR';
"lemonchiffon"                                                                        return 'COLOR';
"lightblue"                                                                           return 'COLOR';
"lightcoral"                                                                          return 'COLOR';
"lightcyan"                                                                           return 'COLOR';
"lightgoldenrodyellow"                                                                return 'COLOR';
"lightgray"                                                                           return 'COLOR';
"lightgreen"                                                                          return 'COLOR';
"lightgrey"                                                                           return 'COLOR';
"lightpink"                                                                           return 'COLOR';
"lightsalmon"                                                                         return 'COLOR';
"lightseagreen"                                                                       return 'COLOR';
"lightskyblue"                                                                        return 'COLOR';
"lightslategray"                                                                      return 'COLOR';
"lightslategrey"                                                                      return 'COLOR';
"lightsteelblue"                                                                      return 'COLOR';
"lightyellow"                                                                         return 'COLOR';
"lime"                                                                                return 'COLOR';
"limegreen"                                                                           return 'COLOR';
"linen"                                                                               return 'COLOR';
"magenta"                                                                             return 'COLOR';
"maroon"                                                                              return 'COLOR';
"mediumaquamarine"                                                                    return 'COLOR';
"mediumblue"                                                                          return 'COLOR';
"mediumorchid"                                                                        return 'COLOR';
"mediumpurple"                                                                        return 'COLOR';
"mediumseagreen"                                                                      return 'COLOR';
"mediumslateblue"                                                                     return 'COLOR';
"mediumspringgreen"                                                                   return 'COLOR';
"mediumturquoise"                                                                     return 'COLOR';
"mediumvioletred"                                                                     return 'COLOR';
"midnightblue"                                                                        return 'COLOR';
"mintcream"                                                                           return 'COLOR';
"mistyrose"                                                                           return 'COLOR';
"moccasin"                                                                            return 'COLOR';
"navajowhite"                                                                         return 'COLOR';
"navy"                                                                                return 'COLOR';
"oldlace"                                                                             return 'COLOR';
"olive"                                                                               return 'COLOR';
"olivedrab"                                                                           return 'COLOR';
"orange"                                                                              return 'COLOR';
"orangered"                                                                           return 'COLOR';
"orchid"                                                                              return 'COLOR';
"palegoldenrod"                                                                       return 'COLOR';
"palegreen"                                                                           return 'COLOR';
"paleturquoise"                                                                       return 'COLOR';
"palevioletred"                                                                       return 'COLOR';
"papayawhip"                                                                          return 'COLOR';
"peachpuff"                                                                           return 'COLOR';
"peru"                                                                                return 'COLOR';
"pink"                                                                                return 'COLOR';
"plum"                                                                                return 'COLOR';
"powderblue"                                                                          return 'COLOR';
"purple"                                                                              return 'COLOR';
"rebeccapurple"                                                                       return 'COLOR';
"red"                                                                                 return 'COLOR';
"rosybrown"                                                                           return 'COLOR';
"royalblue"                                                                           return 'COLOR';
"saddlebrown"                                                                         return 'COLOR';
"salmon"                                                                              return 'COLOR';
"sandybrown"                                                                          return 'COLOR';
"seagreen"                                                                            return 'COLOR';
"seashell"                                                                            return 'COLOR';
"sienna"                                                                              return 'COLOR';
"silver"                                                                              return 'COLOR';
"skyblue"                                                                             return 'COLOR';
"slateblue"                                                                           return 'COLOR';
"slategray"                                                                           return 'COLOR';
"slategrey"                                                                           return 'COLOR';
"snow"                                                                                return 'COLOR';
"springgreen"                                                                         return 'COLOR';
"steelblue"                                                                           return 'COLOR';
"tan"                                                                                 return 'COLOR';
"teal"                                                                                return 'COLOR';
"thistle"                                                                             return 'COLOR';
"tomato"                                                                              return 'COLOR';
"turquoise"                                                                           return 'COLOR';
"violet"                                                                              return 'COLOR';
"wheat"                                                                               return 'COLOR';
"white"                                                                               return 'COLOR';
"whitesmoke"                                                                          return 'COLOR';
"yellow"                                                                              return 'COLOR';
"yellowgreen"                                                                         return 'COLOR';
[0-9]+("."[0-9]+)?px\b                                                                return 'LENGTH';
[0-9]+("."[0-9]+)?cm\b                                                                return 'LENGTH';
[0-9]+("."[0-9]+)?mm\b                                                                return 'LENGTH';
[0-9]+("."[0-9]+)?in\b                                                                return 'LENGTH';
[0-9]+("."[0-9]+)?pt\b                                                                return 'LENGTH';
[0-9]+("."[0-9]+)?pc\b                                                                return 'LENGTH';
[0-9]+("."[0-9]+)?deg\b                                                               return 'ANGLE';
[0-9]+("."[0-9]+)?grad\b                                                              return 'ANGLE';
[0-9]+("."[0-9]+)?rad\b                                                               return 'ANGLE';
[0-9]+("."[0-9]+)?turn\b                                                              return 'ANGLE';
[0-9]+("."[0-9]+)?s\b                                                                 return 'TIME';
[0-9]+("."[0-9]+)?ms\b                                                                return 'TIME';
[0-9]+("."[0-9]+)?Hz\b                                                                return 'FREQ';
[0-9]+("."[0-9]+)?kHz\b                                                               return 'FREQ';
[0-9]+("."[0-9]+)?dpi\b                                                               return 'RES';
[0-9]+("."[0-9]+)?dpcm\b                                                              return 'RES';
[0-9]+("."[0-9]+)?dppx\b                                                              return 'RES';
[0-9]+("."[0-9]+)?em\b                                                                return 'EMS';
[0-9]+("."[0-9]+)?ex\b                                                                return 'EXS';
[0-9]+("."[0-9]+)?ch\b                                                                return 'CHS';
[0-9]+("."[0-9]+)?rem\b                                                               return 'REMS';
[0-9]+("."[0-9]+)?vw\b                                                                return 'VHS';
[0-9]+("."[0-9]+)?vh\b                                                                return 'VWS';
[0-9]+("."[0-9]+)?vmin\b                                                              return 'VMINS';
[0-9]+("."[0-9]+)?vmax\b                                                              return 'VMAXS';
[0-9]+("."[0-9]+)?\%                                                                  return 'PERCENTAGE';
[0-9]+("."[0-9]+)?\b                                                                  return 'NUMBER';
[a-zA-Z0-9-_]+\b                                                                      return 'STRING';
\'(\\[^\']|[^\'\\])*\'                                                                yytext = yytext.slice(1,-1); return 'STRING';
"("                                                                                   return 'LPAREN';
")"                                                                                   return 'RPAREN';
"=="                                                                                  return 'RELOP';
"!="                                                                                  return 'RELOP';
">="                                                                                  return 'RELOP';
">"                                                                                   return 'RELOP';
"<="                                                                                  return 'RELOP';
"<"                                                                                   return 'RELOP';
<<EOF>>                                                                               return 'EOF';

/lex

%left ADD SUB
%left MUL DIV
%left OP
%left NOT
%left STRING
%left RELOP
%left UPREC

%start expression

%%

expression
	: expr EOF { return $1; }
	;

expr
	: logical_expression { $$ = $1; }
	| LPAREN logical_expression RPAREN { $$ = $2; }
	| binary_expression { $$ = $1; }
	| LPAREN binary_expression RPAREN { $$ = $2; }
	| unary_expression { $$ = $1; }
	| LPAREN unary_expression RPAREN { $$ = $2; }
	| math_expression { $$ = $1; }
	| bool_value { $$ = $1; }
	| string { $$ = $1; }
	;

binary_expression
	: expr RELOP expr %prec UPREC { $$ = { type: 'BinaryExpression', operator: $2, left: $1, right: $3 }; }
	;

unary_expression
	: NOT css_value { $$ = { type: 'UnaryExpression', operator: $1, argument: $2 }; }
	| NOT value { $$ = { type: 'UnaryExpression', operator: $1, argument: $2 }; }
	| NOT string { $$ = { type: 'UnaryExpression', operator: $1, argument: $2 }; }
	| NOT LPAREN expr RPAREN { $$ = { type: 'UnaryExpression', operator: $1, argument: $3 }; }
	;

logical_expression
	: expr OP expr { $$ = { type: 'LogicalExpression', operator: $2, left: $1, right: $3 }; }
	;

math_expression
	: math_expression ADD math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| math_expression SUB math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| math_expression MUL math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| math_expression DIV math_expression { $$ = { type: 'MathematicalExpression', operator: $2, left: $1, right: $3 }; }
	| LPAREN math_expression RPAREN { $$ = $2; }
	| css_value { $$ = $1; }
	| color_value { $$ = $1; }
	| value { $$ = $1; }
	;

bool_value
	: BOOL { $$ = { type: 'BooleanValue', value: $1.toLowerCase() == "true" }; }
	| LPAREN bool_value RPAREN { $$ = $2; }
	;

value
	: NUMBER { $$ = { type: 'Value', value: $1 }; }
	| SUB NUMBER { $$ = { type: 'Value', value: -$2 }; }
	;

css_value
	: LENGTH { $$ = { type: 'LengthValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; }
	| ANGLE { $$ = { type: 'AngleValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; }
	| TIME { $$ = { type: 'TimeValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; }
	| FREQ { $$ = { type: 'FrequencyValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; }
	| RES { $$ = { type: 'ResolutionValue', value: parseFloat($1), unit: /[a-z]+/.exec($1)[0] }; }
	| EMS { $$ = { type: 'EmValue', value: parseFloat($1) }; }
	| EXS { $$ = { type: 'ExValue', value: parseFloat($1) }; }
	| CHS { $$ = { type: 'ChValue', value: parseFloat($1) }; }
	| REMS { $$ = { type: 'RemValue', value: parseFloat($1) }; }
	| VHS { $$ = { type: 'VhValue', value: parseFloat($1) }; }
	| VWS { $$ = { type: 'VwValue', value: parseFloat($1) }; }
	| VMINS { $$ = { type: 'VminValue', value: parseFloat($1) }; }
	| VMAXS { $$ = { type: 'VmaxValue', value: parseFloat($1) }; }
	| PERCENTAGE { $$ = { type: 'PercentageValue', value: parseFloat($1) }; }
	| SUB css_value { var prev = $2; prev.value *= -1; $$ = prev; }
	;

color_value
	: COLOR { $$ = { type: 'ColorValue', value: $1 }; }
	;

string
	: STRING { $$ = { type: 'String', value: $1 }; }
	;
