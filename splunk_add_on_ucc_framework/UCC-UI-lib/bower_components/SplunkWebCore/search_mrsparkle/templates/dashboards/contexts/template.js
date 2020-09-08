<%page args="ctx,runOnSubmit=True,globalSearch=False,cancelOnUnload=False" />\
<%
options = dict()
for key,opt in {'searchEarliestTime':'earliest_time','searchLatestTime':'latest_time','earliest_time':'earliest_time','latest_time':'latest_time', 'earliestTime': 'earliest_time', 'latestTime': 'latest_time', 'sampleRatio': 'sample_ratio'}.items():
    if hasattr(ctx,key):
        options[opt] = getattr(ctx,key)
options['search'] = ctx.normalizedSearchCommand()
if hasattr(ctx, 'statusBuckets'):
    options['status_buckets'] = ctx.statusBuckets
else:
    options['status_buckets'] = 0
options['cancelOnUnload'] = cancelOnUnload
%>\
var ${ctx.id} = new SearchManager({
            "id": ${ctx.id|json_decode},
        % if globalSearch:
            "metadata": { "global": true },
        % endif
        % for k,v in options.items():
<%
if k == 'earliest_time' and v is None:
    v = '$earliest$'
if k == 'latest_time' and v is None:
    v = '$latest$'
%>\
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
<%
optionsSuffix = ', tokenNamespace: "submitted"' if runOnSubmit else ''
%>\
        }, {tokens: true${optionsSuffix}});

