/*conf:+jscript_function_extensions*/
function conf() {
    this.settings = {};
}

function conf.jscript_function_extensions(val) {
    this.settings.jscript_function_extensions = val;
}

function conf.jscript_function_extensions(val) {
    /* cannot warn about redeclaration */
    return val;
}

function conf.jscript_function_extensions.can.have.infinite.depth() {
}

function conf::jscript_function_extensions(val) {
    this.val = val;
}

function conf.jscript_function_extensions::onunload() {
    this.val = null;
}

function conf.jscript_function_extensions..ok(val) { /*warning:syntax_error*/
}
