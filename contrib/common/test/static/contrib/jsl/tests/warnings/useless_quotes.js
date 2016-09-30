function useless_quotes() {
    var o = {
        'key': 1 /*warning:useless_quotes*/
    };
    o = {
        'key with space': false
    };
    o = {
        key: '1'
    };
}
