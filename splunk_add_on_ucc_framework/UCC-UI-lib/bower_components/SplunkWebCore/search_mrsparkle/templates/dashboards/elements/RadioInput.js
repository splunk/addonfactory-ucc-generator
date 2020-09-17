<%page args="element" />\
<%
options = dict()
for opt in ('default', 'prefix', 'suffix'):
    attr = opt + 'Value'
    if hasattr(element, attr) and getattr(element, attr) is not None:
        options[opt] = getattr(element, attr)
if hasattr(element, 'searchWhenChanged') and getattr(element, 'searchWhenChanged') is not None:
    options['searchWhenChanged'] = getattr(element, 'searchWhenChanged')
if len(element.searchFields) > 0:
    options['labelField'] = element.searchFields[0].get('label')
    options['valueField'] = element.searchFields[0].get('value')
options['selectFirstChoice'] = element.selectFirstChoice
if hasattr(element, 'initialValue') and getattr(element, 'initialValue') is not None:
    options['initialValue'] = getattr(element, 'initialValue')
value = "$form." + element.token + "$" if element.token else "$form." + element.id + "$"
%>\
new RadioGroupInput({
            "id": ${json_decode(element.id)|n},
        % if element.tokenDeps:
            "tokenDependencies": ${json_decode(element.tokenDeps.obj())|n},
        % endif
        % if element.staticFields is not None and len(element.staticFields):
            "choices": [
            % for i,choice in enumerate(element.staticFields):
                ${json_decode(choice)|n}${"," if i<len(element.staticFields)-1 else ""}
            % endfor
            ],
        % else:
            "choices": [],
        % endif
        % for k,v in options.items():
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
            "value": ${json_decode(value)|n},
            % if getattr(element, 'search', None) is not None:
            "managerid": ${json_decode(element.search.id)},
            %endif,
            "el": $('#${element.id}')
        }, {tokens: true}).render();
