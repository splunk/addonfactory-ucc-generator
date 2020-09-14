define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, function(VectorUtils) {

        // Public Static Methods

        VectorUtils.toSVGString = function(element) {
            // svg elements don't have innerHTML attribute...
            // clone svg element and place in container div so we can use innerHTML of the container
            var clonedElement = element.cloneNode(true);
            var containerElement = document.createElement("div");
            containerElement.appendChild(clonedElement);

            // get svg string using innerHTML
            var svgString = containerElement.innerHTML;

            // fix or add xlink namespace on href attributes
            svgString = svgString.replace(/xlink:href=|href=/g, "x:href=");

            // properly close image tags
            svgString = svgString.replace(/<image([\S\s]*?)\s*\/?>\s*(<\/image>)?/g, "<image$1></image>");

            // add xmlns attributes to root svg tag
            svgString = svgString.replace(/^<svg/, "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:x=\"http://www.w3.org/1999/xlink\"");

            // clear element references
            clonedElement = null;
            containerElement = null;

            return svgString;
        };

        VectorUtils.concatSVGStrings = function(/*...*/) {
            var concatString = "";
            var svgString;
            var viewBoxMatch;
            var viewBox;
            var width = 0;
            var height = 0;

            for (var i = 0, l = arguments.length; i < l; i++) {
                svgString = arguments[i];

                // read and parse viewBox attribute from root svg tag
                viewBoxMatch = svgString.match(/^<svg[^>]*viewBox=\"([^ ]+) ([^ ]+) ([^ ]+) ([^\"]+)\"[^>]*>/);
                if (viewBoxMatch && (viewBoxMatch.length == 5)) {
                    viewBox = {
                        x: Number(viewBoxMatch[1]),
                        y: Number(viewBoxMatch[2]),
                        width: Number(viewBoxMatch[3]),
                        height: Number(viewBoxMatch[4])
                    };

                    // expand width and height to include viewBox
                    width = Math.max(width, viewBox.width);
                    height = Math.max(height, viewBox.height);
                } else {
                    viewBox = null;
                }

                // replace root svg tag with g tag, including translate transform if needed
                if (viewBox && ((viewBox.x != 0) || (viewBox.y != 0))) {
                    svgString = svgString.replace(/^<svg[^>]*>/, "<g transform=\"translate(" + (-viewBox.x) + ", " + (-viewBox.y) + ")\">");
                } else {
                    svgString = svgString.replace(/^<svg[^>]*>/, "<g>");
                }
                svgString = svgString.replace(/<\/svg>$/, "</g>");

                concatString += svgString;
            }

            // generate new root svg tag around concatString
            svgString = "<svg";
            svgString += " xmlns=\"http://www.w3.org/2000/svg\"";
            svgString += " xmlns:x=\"http://www.w3.org/1999/xlink\"";
            svgString += " width=\"" + width + "\"";
            svgString += " height=\"" + height + "\"";
            svgString += " viewBox=\"0 0 " + width + " " + height + "\"";
            svgString += ">";
            svgString += concatString;
            svgString += "</svg>";

            return svgString;
        };

    });

});
