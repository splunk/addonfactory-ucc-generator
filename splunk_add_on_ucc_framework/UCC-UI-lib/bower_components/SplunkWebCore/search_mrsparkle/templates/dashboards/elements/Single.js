<%page args="element,url=str" />\
<%
options = dict()
for k,v in element.options.items():
    options[k] = v

if not 'drilldown' in options and len(element.simpleDrilldown) > 0:
    options['drilldown'] = 'all'
%>\
new SingleElement({
            "id": ${element.id|json_decode},
        % if element.tokenDeps:
            "tokenDependencies": ${json_decode(element.tokenDeps.obj())|n},
        % endif
        % for k,v in options.items():
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
        % if element.search is not None:
            "managerid": ${json_decode(element.search.id)},
        %endif
            "el": $('#${element.id}')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
<%include file="drilldown/drilldown.js" args="element=element,url=url" />