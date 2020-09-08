<%page args="ctx,runOnSubmit=True,cancelOnUnload=False" />\
<%
options = dict()
for key,opt in {'searchEarliestTime':'earliest_time','searchLatestTime':'latest_time','earliest_time':'earliest_time','latest_time':'latest_time', 'earliestTime':'earliest_time','latestTime':'latest_time'}.items():
    if hasattr(ctx,key):
        options[opt] = getattr(ctx,key)
options['searchname'] = ctx.searchCommand
if hasattr(ctx, 'statusBuckets'):
    options['status_buckets'] = ctx.statusBuckets
else:
    options['status_buckets'] = 0
options['cancelOnUnload'] = cancelOnUnload
options['cache'] = ctx.cache or 'scheduled'
%>\
new SavedSearchManager({
            "id": ${ctx.id|json_decode},
        % for k,v in options.items():
<%
if k == 'earliest_time' and v is None:
    continue
if k == 'latest_time' and v is None:
    continue
%>\
            ${k|json_decode}: ${json_decode(v)|n},
        % endfor
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "rt_backfill": true,
            "preview": true,
            "runWhenTimeIsUndefined": false
<%
optionsSuffix = ', tokenNamespace: "submitted"' if runOnSubmit else ''
%>\
        }, {tokens: true${optionsSuffix}});

