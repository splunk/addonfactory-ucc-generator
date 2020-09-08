define(
    [
        'underscore', 
        'util/string_utils'
    ],
    function(_, stringUtils) {
        var stylizeVariables = function(text) {
                // finds all terms of the form <foo> (surrounded by "<" and ">", contains a-z, A-Z, 0-9, _/:-)
                var myRegexp = /<([a-zA-Z][a-zA-Z0-9_\/:=-]*)>/g,
                    terms = stringUtils.getRegexMatches(myRegexp, text); 
 
                // Each term has a structure: "<foo:bar=hurrah>" (the ":bar=hurrah" is optional)
                // in the above example, datatype=foo, variable=bar, defaultval="=hurrah"
                // Convert <foo:bar=hurrah> to xxxixxxfooxxx/ixxxbar=hurrah
                _.each(terms, function(term) {
                    var fullTerm = term[1],
                        partsOfTermRegexp = /([a-zA-Z0-9_\/-]+)([^=]+)?(=.*)?/g,
                        partsOfTerm = partsOfTermRegexp.exec(fullTerm),
                        datatype = partsOfTerm[1],
                        variable = partsOfTerm[2] || "",
                        defaultval = partsOfTerm[3] || ""; 
                    text = text.replace("<" + fullTerm + ">", "xxxixxx" + datatype + "xxx/ixxx" + variable + defaultval);  
                });

                // Finds "literals", which are a sequence of all capital letters (or an underscore or a dash) 
                // immediately followed by a non-letter.  Wraps each match with the "xxxbxxx" and "xxx/bxxx" tags 
                // and converts to lower case.  
                // Examples: 
                //     "SQL" is not a match because it's not followed by a non-letter
                //     "SQL1" finds a match for "SQL" because it is all caps and is followed by a non-letter ("1")     
                //     "SQL hurrah" find a match for "SQL" because it is all caps and is folowed by a space
                // In last two examples above, the match "SQL" is converted to "xxxbxxxsqlxxx/bxxx"
                var allCapsLitRegexp = /([A-Z][A-Z_-]+)[^a-zA-Z]/g,
                    allCapsLiterals = stringUtils.getRegexMatches(allCapsLitRegexp, text); 

                _.each(allCapsLiterals, function(allCapsLiteral) {
                    var lit = allCapsLiteral[1];  
                    text = text.replace(lit, "xxxbxxx" + lit.toLowerCase() + "xxx/bxxx");  
                });

                // Finds a second type of literal, anything surrounded by quotes 
                var quotedLitRegexp = /"([^"]*)"/g,
                    quotedLiterals = stringUtils.getRegexMatches(quotedLitRegexp, text); 

                _.each(quotedLiterals, function(quotedLiteral) {
                    var lit = quotedLiteral[1]; 
                    text = text.replace('"' + lit + '"', "xxxbxxx" + lit + "xxx/bxxx");  
                });

                // Escape '<', '>', and '&' characters
                text = _.escape(text); 

                text = text.replace(/xxxixxx/g, "<em>");                
                text = text.replace(/xxx\/ixxx/g, "</em>"); 
                text = text.replace(/xxxbxxx/g, "<code>");                
                text = text.replace(/xxx\/bxxx/g, "</code>"); 

                return text; 
            };   
        var removeWhiteSpaces =  function(text) {
                text = text.replace(/\\\\n/g, " "); 
                text = text.replace(/\r\n/g, " "); 
                text = text.replace(/\n/g, " "); 
                text = text.replace(/\t/g, " "); 

                     
                while (true) {
                    var oldText = text; 
                    text = text.replace(/  /g, " ");                     

                    if (oldText == text) {
                        break; 
                    }
                }

                // replace PARAGRAPH TOKEN \p\ with newline
                text = text.replace(/\\\\p\\\\/g, "<br/><br/>");

                // replace INDENT TOKEN \i\ with newline and 4 spaces
                text = text.replace(/\\\\i\\\\/g, "<br/>&nbsp;&nbsp;&nbsp;&nbsp;"); 
                return text; 
        }; 
        return {
            stylizeVariables: stylizeVariables, 
            removeWhiteSpaces: removeWhiteSpaces
        };
    }
);
