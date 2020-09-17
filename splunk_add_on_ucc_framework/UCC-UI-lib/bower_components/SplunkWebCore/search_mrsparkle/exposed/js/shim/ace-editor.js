define(['script!contrib/ace-editor/ace', 'splunk.util'], function(aceEditor, splunkUtil) {
    var basePath = splunkUtil.make_url('static/js/contrib/ace-editor');
    window.ace.config.set('basePath', basePath);
    return window.ace;
});
