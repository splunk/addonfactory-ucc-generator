<%page args="element" />\
<%
options = dict()
if hasattr(element, 'searchWhenChanged') and getattr(element, 'searchWhenChanged') is not None:
    options['searchWhenChanged'] = getattr(element, 'searchWhenChanged')
if element.selected is not None:
    # Is either a preset name or an {earliestTime: x, latestTime: y} dict
    if isinstance(element.selected, str):
        options['preset'] = element.selected
    else:
        options['default'] = dict(
            earliest_time=element.selected['earliestTime'],
            latest_time=element.selected['latestTime']
        )
if element.token is None:
    earliest_token_name = 'earliest'
    latest_token_name = 'latest'
    form_earliest_token_name = 'earliest'
    form_latest_token_name = 'latest'
else:
    earliest_token_name = '%s.earliest' % element.token
    latest_token_name = '%s.latest' % element.token
    form_earliest_token_name = 'form.'+earliest_token_name
    form_latest_token_name = 'form.'+latest_token_name
earliest_token = '$'+form_earliest_token_name+'$'
latest_token= '$'+form_latest_token_name+'$'
%>\
new TimeRangeInput({
            "id": ${json_decode(element.id)|n},
        % if element.tokenDeps:
            "tokenDependencies": ${json_decode(element.tokenDeps.obj())|n},
        % endif
        % for k,v in options.items():
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
            "earliest_time": ${json_decode(earliest_token)|n},
            "latest_time": ${json_decode(latest_token)|n},
            "el": $('#${element.id}')
        }, {tokens: true}).render();
