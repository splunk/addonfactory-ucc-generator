<%page args="element,url=str" />\
<%
options = dict(resizable=True)
for k,v in element.options.items():
    options[k] = v
%>\
new ChartElement({
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
% if element.selection:
        ${element.id}.on('selection', function(e) {
            e.preventDefault();
% for item in element.selection:
    % if item.type == 'link':
            var url = TokenUtils.replaceTokenNames(${url(str(item.link))|json_decode}, _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'));
        % if item.target is None:
            utils.redirect(url);
        % else:
            utils.redirect(url, false, ${item.target|json_decode});
        % endif
    % elif item.type == 'settoken':
            setToken(${item.name|json_decode}, ${item.prefix and (json_decode(item.prefix) + ' + ') or ''}TokenUtils.replaceTokenNames(${item.template|json_decode}, _.extend(submittedTokenModel.toJSON(), e.data))${item.suffix and (' + ' + json_decode(item.suffix)) or ''});
    % elif item.type == 'unsettoken':
            unsetToken(${item.name|json_decode});
    % elif item.type == 'eval':
            EventHandler.evalToken(${item.name|json_decode}, ${item.expr|json_decode}, e.data);
    % endif
% endfor
        });
% endif