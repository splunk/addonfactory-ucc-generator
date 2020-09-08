<%page args="element,url=str" />\
<%
options = dict()
for k,v in element.options.items():
    options[k] = v
%>\
new ListElement({
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
% if element.options.get('labelFieldTarget', False) and element.options.get('labelFieldSearch', False):

        ${element.id}.on('click', function(e){
            e.preventDefault();
## TODO: support intentions
            var searchClause = TokenUtils.getEscaper(e.data['click.name'])("search") + "=" + TokenUtils.getEscaper(e.data['click.value'])("search");
            var search = ${element.options['labelFieldSearch'].rstrip() + ' ' | json_decode } + searchClause;
            utils.redirect(${url(element.options['labelFieldTarget']) | json_decode} + '?q=' + encodeURIComponent(search), e.event.modifierKey);
        });
% endif
