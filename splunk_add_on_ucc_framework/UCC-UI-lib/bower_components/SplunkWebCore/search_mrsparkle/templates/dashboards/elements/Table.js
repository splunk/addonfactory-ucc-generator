<%page args="element,url=str" />\
<%
options = dict()
for k,v in element.options.items():
    options[k] = v
if element.fieldFormats is not None and len(element.fieldFormats) > 0:
    options['format'] = element.fieldFormats
if element.searchFieldList is not None and len(element.searchFieldList):
    options['fields'] = element.searchFieldList
pager = 'showPager' in options
%>\
new TableElement({
            "id": ${element.id|json_decode},
        % if element.tokenDeps:
            "tokenDependencies": ${json_decode(element.tokenDeps.obj())|n},
        % endif
        % for k,v in sorted(options.items()):
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
        % if element.search is not None:
            "managerid": ${json_decode(element.search.id)},
        %endif
            "el": $('#${element.id}')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
<%include file="drilldown/drilldown.js" args="element=element,url=url" />