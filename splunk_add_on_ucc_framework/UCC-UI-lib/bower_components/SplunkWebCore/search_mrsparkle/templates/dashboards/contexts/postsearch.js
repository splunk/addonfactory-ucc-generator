<%page args="ctx,runOnSubmit=True" />\
<%
options = dict()
options['search'] = ctx.searchCommand
options['managerid'] = ctx.baseSearchId
%>\
var ${ctx.id} = new PostProcessManager({
        % for k,v in options.items():
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
            "id": ${ctx.id|json_decode}
        }, {tokens: true, tokenNamespace: "submitted"});

