<%page args="element,sourceApp=None" />\
<%
options = dict()
for k,v in element.options.items():
    if k in ('useTokens', 'serverSideInclude'):
        options[k] = v
if options.get('serverSideInclude', None) and sourceApp is not None:
    options['app'] = sourceApp
%>\
new HtmlElement({
            "id": ${element.id|json_decode},
        % if element.tokenDeps:
            "tokenDependencies": ${json_decode(element.tokenDeps.obj())|n},
        % endif
        % for k,v in options.items():
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
            "el": $('#${element.id}')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        DashboardController.addReadyDep(${element.id}.contentLoaded());
        