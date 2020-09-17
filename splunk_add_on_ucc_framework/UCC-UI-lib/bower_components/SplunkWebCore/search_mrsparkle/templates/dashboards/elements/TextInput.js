<%page args="element" />\
<%
options = dict()
for opt in ('default', 'prefix', 'suffix'):
    attr = opt + 'Value'
    if hasattr(element, attr) and getattr(element, attr) is not None:
        options[opt] = getattr(element, attr)
if hasattr(element, 'searchWhenChanged') and getattr(element, 'searchWhenChanged') is not None:
    options['searchWhenChanged'] = getattr(element, 'searchWhenChanged')
if hasattr(element, 'initialValue') and getattr(element, 'initialValue') is not None:
    options['initialValue'] = getattr(element, 'initialValue')
value = "$form." + element.token + "$" if element.token else "$form." + element.id + "$"
%>\
new TextInput({
            "id": ${json_decode(element.id)|n},
        % if element.tokenDeps:
            "tokenDependencies": ${json_decode(element.tokenDeps.obj())|n},
        % endif
        % for k,v in options.items():
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
            "value": ${json_decode(value)|n},
            "el": $('#${element.id}')
        }, {tokens: true}).render();
