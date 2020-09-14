define(['underscore', '../check', '../types'], function(_, check, types) {

    var MISC_FUNCTIONS = {};

    // register a new type function
    function register(name, fn, checkArgs, returns) {
        MISC_FUNCTIONS[name] = {
            checkArguments: checkArgs,
            evaluatedArgs: true,
            evaluate: fn,
            type: returns
        };
    }


    /**
     * cidrmatch("X",Y)
     * This function returns true, when an IP address Y belongs to a particular subnet X. The function uses two
     * string arguments: the first is the CIDR subnet; the second is the IP address to match.
     * @param subnet X
     * @param ip Y
     * @returns {boolean}
     */
    function evalCidrMatch(subnet, ip) {
        var subnetParts = subnet.split('/', 2);
        var net = aton(subnetParts[0]);
        var bits = 32 - (+subnetParts[1]);
        if (bits < 0 || bits > 32) {
            throw new Error('Invalid bit mask ' + JSON.stringify(subnetParts[1]));
        }
        var inverseMask = 0;
        while (bits--) {
            inverseMask = inverseMask << 1 | 1;
        }
        var mask = (0xFFFFFFFF ^ inverseMask) >>> 0;
        return (aton(ip) & mask) === (net & mask);
    }

    function aton(ip) {
        var parts = _(ip.split('.')).map(function(n) {
            n = parseInt(n, 10);
            if (_.isNaN(n) || n < 0 || n > 255) {
                throw new Error('Invalid octet in IP address ' + JSON.stringify(ip));
            }
            return n;
        });
        if (parts.length !== 4) {
            throw new Error('Invalid IP address ' + JSON.stringify(ip));
        }
        return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    }

    register('cidrmatch', evalCidrMatch, check.all(
        check.length(2), check.type(0, types.STRING), check.type(1, types.STRING)
    ), types.BOOLEAN);


    /**
     * urldecode(X)
     * This function takes one URL string argument X and returns the unescaped or decoded URL string.
     * @param str X
     * @returns {string}
     */
    function evalUrldecode(str) {
        return str != null ? decodeURIComponent(str) : null;
    }

    register('urldecode', evalUrldecode, check.all(check.length(1), check.type(0, types.STRING)), types.STRING);

    /**
     * URL-Encodes the given string
     * @param str
     * @returns {string}
     */
    function evalUrlEncode(str) {
        return str != null ? encodeURIComponent(str) : null;
    }

    register('urlencode', evalUrlEncode, check.all(check.length(1), check.type(0, types.STRING)), types.STRING);

    return MISC_FUNCTIONS;
});