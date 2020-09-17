<%page args="search,eventName,conditions" />\
<%
from collections import OrderedDict
def actionToJSON(action):
    result=OrderedDict()
    if action.type == "settoken":
        result['type'] = 'set'
        result['token'] = action.name
        result['value'] = action.template
        for attr in ('prefix', 'suffix', 'delimiter'):
            v = getattr(action, attr)
            if v is not None:
                result[attr] = v
    elif action.type == "unsettoken":
        result['type'] = 'unset'
        result['token'] = action.name
    elif action.type == 'link':
        result['type'] = 'link'
        result['value'] = action.link
        result['target'] = action.target
    elif action.type == 'eval':
        result['type'] = 'eval'
        result['token'] = action.name
        result['value'] = action.expr
    return json_decode(result)
            
def islast(l, i):
    return i == len(l)-1
%>\
new SearchEventHandler({
            managerid: ${search.id|json_decode},
            event: ${eventName|json_decode},
            conditions: [
            %for i, cond in enumerate(conditions):
                {
                    attr: ${cond.attr|json_decode},
                    value: ${cond.value|json_decode},
                    actions: [
                        %for j, action in enumerate(cond.actions):
                        ${actionToJSON(action)|n}${"" if islast(cond.actions, j) else ","}
                        %endfor
                    ]
                }${"" if islast(conditions, i) else ","}
            %endfor
            ]
        });