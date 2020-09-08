<%page args="element,url=str,drilldownType=None" />\
% if len(element.simpleDrilldown) > 0:

        ${element.id}.on("click", function(e) {
<% cond = 'if' %>\
% for condition in element.simpleDrilldown:
    % if condition.attr == 'match':
            ${cond} (EventHandler.evaluateCondition(${condition.value|json_decode}, e.data)) {
    % elif condition.field == '*':
        % if cond != 'if':
            } else {
        % else:
            if (e.field !== undefined) {
        % endif
    % else:
            ${cond} (e.field === ${condition.field|json_decode}) {
    % endif
                e.preventDefault();
    % for item in condition.actions:
        % if item.type == 'link':
                var url = TokenUtils.replaceTokenNames(${url(str(item.link))|json_decode}, _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
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
        % elif item.type == 'default':
                e.drilldown();
        % endif
    % endfor
<%
    cond = '} else if'
    if condition.field == '*':
        break
%>\
% endfor
            }
        });
% endif