var DASHBOARD_RESPONSE_UNPARSED = {

   "links": {

      "create": "/servicesNS/admin/launcher/data/ui/views/_new",

      "_reload": "/servicesNS/admin/launcher/data/ui/views/_reload"

   },

   "origin": "https://127.0.0.1:8832/servicesNS/admin/launcher/data/ui/views",

   "updated": "2014-05-20T16:28:21-07:00",

   "generator": {

      "build": "208545",

      "version": "20140514"

   },

   "entry": [

      {

         "name": "dashboard",

         "id": "https://127.0.0.1:8832/servicesNS/admin/launcher/data/ui/views/dashboard",

         "updated": "2014-05-20T16:28:21-07:00",

         "links": {

            "alternate": "/servicesNS/admin/launcher/data/ui/views/dashboard",

            "list": "/servicesNS/admin/launcher/data/ui/views/dashboard",

            "_reload": "/servicesNS/admin/launcher/data/ui/views/dashboard/_reload",

            "edit": "/servicesNS/admin/launcher/data/ui/views/dashboard",

            "remove": "/servicesNS/admin/launcher/data/ui/views/dashboard",

            "move": "/servicesNS/admin/launcher/data/ui/views/dashboard/move"

         },

         "author": "admin",

         "acl": {

            "app": "launcher",

            "can_change_perms": true,

            "can_list": true,

            "can_share_app": true,

            "can_share_global": true,

            "can_share_user": true,

            "can_write": true,

            "modifiable": true,

            "owner": "nobody",

            "perms": {

               "read": [

                  "*"

               ],

               "write": [

                  "power"

               ]

            },

            "removable": true,

            "sharing": "user"

         },

         "fields": {

            "required": [

               "eai:data"

            ],

            "optional": [

               "eai:type"

            ],

            "wildcard": []

         },

         "content": {

            "eai:acl": null,

            "eai:appName": "launcher",

            "eai:data": "<dashboard>\n  <label/>\n  <searchTemplate>| metadata index=* type=sourcetypes | search totalCount &gt; 0 | rename totalCount as Count recentTime as \"Last Update\"<\/searchTemplate>\n  <row>\n    <panel>\n      <html>\n      <div>\n      <h3>Getting started<\/h3>\n        <ul class=\"link-list\">\n          <li>\n            <a href=\"/app/search/search\" target=\"_blank\">Run a search  <i class=\"icon-external\"/>\n            <\/a>\n          <\/li>\n          <li>\n            <a href=\"/manager/launcher/adddata\" target=\"_blank\">Add data  <i class=\"icon-external\"/>\n            <\/a>\n          <\/li>\n          <li>\n            <a href=\"/app/search/reports\" target=\"_blank\">See reports  <i class=\"icon-external\"/>\n            <\/a>\n          <\/li>\n          <li>\n            <a href=\"/app/search/alerts\" target=\"_blank\">See alerts  <i class=\"icon-external\"/>\n            <\/a>\n          <\/li>\n          <li>\n            <a href=\"/app/search/dashbaoards\" target=\"_blank\">See dashboards  <i class=\"icon-external\"/>\n            <\/a>\n          <\/li>\n        <\/ul>\n      <\/div>\n    <\/html>\n    <\/panel>\n    <panel>\n      <html>\n      <img style=\"height: 160px;\" src=\"http://coverall2.splunk.com/web_assets/usercon/2014/HERO-Splunk-conf2014-RegEarly-Extended.jpg\"/>\n    <\/html>\n    <\/panel>\n    <panel>\n      <html>\n      <h3>Help<\/h3>\n      <ul class=\"link-list\">\n        <li>\n          <a href=\"http://www.splunk.com/view/education-videos/SP-CAAAGB6\" target=\"_blank\">Video Tutorials <i class=\"icon-external\"/>\n          <\/a>\n        <\/li>\n        <li>\n          <a href=\"http://splunk-base.splunk.com/\" target=\"_blank\">Splunk Answers <i class=\"icon-external\"/>\n          <\/a>\n        <\/li>\n        <li>\n          <a href=\"http://www.splunk.com/support\" target=\"_blank\">Contact Support <i class=\"icon-external\"/>\n          <\/a>\n        <\/li>\n        <li>\n          <a href=\"http://docs.splunk.com/Documentation/Splunk\" target=\"_blank\">Documentation <i class=\"icon-external\"/>\n          <\/a>\n        <\/li>\n      <\/ul>\n    <\/html>\n    <\/panel>\n  <\/row>\n  <row>\n    <panel>\n      <single>\n        <title>Events indexed<\/title>\n        <searchPostProcess>| stats sum(Count)<\/searchPostProcess>\n        <option name=\"drilldown\">none<\/option>\n        <option name=\"linkView\">search<\/option>\n      <\/single>\n      <single>\n        <title>Earliest event<\/title>\n        <searchPostProcess>| stats min(firstTime) as min | eval min=strftime(min,\"%c\")<\/searchPostProcess>\n        <option name=\"drilldown\">none<\/option>\n        <option name=\"linkView\">search<\/option>\n      <\/single>\n      <single>\n        <title>Latest event<\/title>\n        <searchPostProcess>| stats max(lastTime) as max | eval max=strftime(max,\"%c\")<\/searchPostProcess>\n        <option name=\"drilldown\">none<\/option>\n        <option name=\"linkView\">search<\/option>\n      <\/single>\n      <chart>\n        <searchString>index=* | timechart count<\/searchString>\n        <earliestTime>0<\/earliestTime>\n        <latestTime/>\n        <option name=\"charting.chart\">column<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.overflowMode\">ellipsisNone<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.rotation\">0<\/option>\n        <option name=\"charting.axisTitleX.visibility\">visible<\/option>\n        <option name=\"charting.axisTitleY.visibility\">visible<\/option>\n        <option name=\"charting.axisTitleY2.visibility\">visible<\/option>\n        <option name=\"charting.axisX.scale\">linear<\/option>\n        <option name=\"charting.axisY.scale\">linear<\/option>\n        <option name=\"charting.axisY2.enabled\">false<\/option>\n        <option name=\"charting.axisY2.scale\">inherit<\/option>\n        <option name=\"charting.chart.bubbleMaximumSize\">50<\/option>\n        <option name=\"charting.chart.bubbleMinimumSize\">10<\/option>\n        <option name=\"charting.chart.bubbleSizeBy\">area<\/option>\n        <option name=\"charting.chart.nullValueMode\">gaps<\/option>\n        <option name=\"charting.chart.sliceCollapsingThreshold\">0.01<\/option>\n        <option name=\"charting.chart.stackMode\">default<\/option>\n        <option name=\"charting.chart.style\">shiny<\/option>\n        <option name=\"charting.drilldown\">all<\/option>\n        <option name=\"charting.layout.splitSeries\">0<\/option>\n        <option name=\"charting.legend.labelStyle.overflowMode\">ellipsisMiddle<\/option>\n        <option name=\"charting.legend.placement\">right<\/option>\n      <\/chart>\n    <\/panel>\n  <\/row>\n  <row>\n    <panel>\n      <chart>\n        <title>Top 10 Sources<\/title>\n        <searchString>| metadata index=* type=sources | top limit=10 totalCount by source | rename totalCount as count<\/searchString>\n        <earliestTime>0<\/earliestTime>\n        <latestTime/>\n        <option name=\"charting.chart\">column<\/option>\n        <option name=\"charting.axisY.scale\">log<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.overflowMode\">ellipsisMiddle<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.rotation\">-45<\/option>\n        <option name=\"charting.axisTitleX.visibility\">collapsed<\/option>\n        <option name=\"charting.axisTitleY.visibility\">collapsed<\/option>\n        <option name=\"charting.axisTitleY2.visibility\">visible<\/option>\n        <option name=\"charting.axisX.scale\">linear<\/option>\n        <option name=\"charting.axisY2.enabled\">false<\/option>\n        <option name=\"charting.axisY2.scale\">inherit<\/option>\n        <option name=\"charting.chart.bubbleMaximumSize\">50<\/option>\n        <option name=\"charting.chart.bubbleMinimumSize\">10<\/option>\n        <option name=\"charting.chart.bubbleSizeBy\">area<\/option>\n        <option name=\"charting.chart.nullValueMode\">gaps<\/option>\n        <option name=\"charting.chart.sliceCollapsingThreshold\">0.01<\/option>\n        <option name=\"charting.chart.stackMode\">default<\/option>\n        <option name=\"charting.chart.style\">shiny<\/option>\n        <option name=\"charting.drilldown\">all<\/option>\n        <option name=\"charting.layout.splitSeries\">0<\/option>\n        <option name=\"charting.legend.labelStyle.overflowMode\">ellipsisMiddle<\/option>\n        <option name=\"charting.legend.placement\">none<\/option>\n        <option name=\"charting.axisTitleX.text\">Top 10 Sources<\/option>\n      <\/chart>\n      <table>\n        <searchString>| metadata index=* type=sources  | search totalCount &gt; 0  | rename totalCount as Count recentTime as \"Last Update\"  | table source Count \"Last Update\"  | fieldformat Count=tostring(Count, \"commas\")<\/searchString>\n        <earliestTime>rt<\/earliestTime>\n        <latestTime>rt<\/latestTime>\n      <\/table>\n    <\/panel>\n    <panel>\n      <chart>\n        <title>Top 10 Sourcetypes<\/title>\n        <searchString>| metadata index=* type=sourcetypes | top limit=10 totalCount by sourcetype | rename totalCount as count<\/searchString>\n        <earliestTime>0<\/earliestTime>\n        <latestTime/>\n        <option name=\"charting.chart\">column<\/option>\n        <option name=\"charting.axisY.scale\">log<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.overflowMode\">ellipsisMiddle<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.rotation\">-45<\/option>\n        <option name=\"charting.axisTitleX.visibility\">collapsed<\/option>\n        <option name=\"charting.axisTitleY.visibility\">collapsed<\/option>\n        <option name=\"charting.axisTitleY2.visibility\">visible<\/option>\n        <option name=\"charting.axisX.scale\">linear<\/option>\n        <option name=\"charting.axisY2.enabled\">false<\/option>\n        <option name=\"charting.axisY2.scale\">inherit<\/option>\n        <option name=\"charting.chart.bubbleMaximumSize\">50<\/option>\n        <option name=\"charting.chart.bubbleMinimumSize\">10<\/option>\n        <option name=\"charting.chart.bubbleSizeBy\">area<\/option>\n        <option name=\"charting.chart.nullValueMode\">gaps<\/option>\n        <option name=\"charting.chart.sliceCollapsingThreshold\">0.01<\/option>\n        <option name=\"charting.chart.stackMode\">default<\/option>\n        <option name=\"charting.chart.style\">shiny<\/option>\n        <option name=\"charting.drilldown\">all<\/option>\n        <option name=\"charting.layout.splitSeries\">0<\/option>\n        <option name=\"charting.legend.labelStyle.overflowMode\">ellipsisMiddle<\/option>\n        <option name=\"charting.legend.placement\">none<\/option>\n        <option name=\"charting.axisTitleX.text\">Top 10 Sourcetypes<\/option>\n      <\/chart>\n      <table>\n        <searchString>| metadata index=* type=sourcetypes | search totalCount &gt; 0  | rename totalCount as Count recentTime as \"Last Update\"  | table sourcetype Count \"Last Update\"  | fieldformat Count=tostring(Count, \"commas\")<\/searchString>\n        <earliestTime>rt<\/earliestTime>\n        <latestTime>rt<\/latestTime>\n      <\/table>\n    <\/panel>\n    <panel>\n      <chart>\n        <title>Top 10 Hosts<\/title>\n        <searchString>| metadata index=* type=hosts | top limit=10 totalCount by host | rename totalCount as count<\/searchString>\n        <earliestTime>0<\/earliestTime>\n        <latestTime/>\n        <option name=\"charting.chart\">column<\/option>\n        <option name=\"charting.axisY.scale\">log<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.overflowMode\">ellipsisMiddle<\/option>\n        <option name=\"charting.axisLabelsX.majorLabelStyle.rotation\">-45<\/option>\n        <option name=\"charting.axisTitleX.visibility\">collapsed<\/option>\n        <option name=\"charting.axisTitleY.visibility\">collapsed<\/option>\n        <option name=\"charting.axisTitleY2.visibility\">visible<\/option>\n        <option name=\"charting.axisX.scale\">linear<\/option>\n        <option name=\"charting.axisY2.enabled\">false<\/option>\n        <option name=\"charting.axisY2.scale\">inherit<\/option>\n        <option name=\"charting.chart.bubbleMaximumSize\">50<\/option>\n        <option name=\"charting.chart.bubbleMinimumSize\">10<\/option>\n        <option name=\"charting.chart.bubbleSizeBy\">area<\/option>\n        <option name=\"charting.chart.nullValueMode\">gaps<\/option>\n        <option name=\"charting.chart.sliceCollapsingThreshold\">0.01<\/option>\n        <option name=\"charting.chart.stackMode\">default<\/option>\n        <option name=\"charting.chart.style\">shiny<\/option>\n        <option name=\"charting.drilldown\">all<\/option>\n        <option name=\"charting.layout.splitSeries\">0<\/option>\n        <option name=\"charting.legend.labelStyle.overflowMode\">ellipsisMiddle<\/option>\n        <option name=\"charting.legend.placement\">none<\/option>\n        <option name=\"charting.axisTitleX.text\">Top 10 Hosts<\/option>\n      <\/chart>\n      <table>\n        <searchString>| metadata index=* type=hosts  | search totalCount &gt; 0  | rename totalCount as Count recentTime as \"Last Update\"  | table host Count \"Last Update\"  | fieldformat Count=tostring(Count, \"commas\")<\/searchString>\n        <earliestTime>rt<\/earliestTime>\n        <latestTime>rt<\/latestTime>\n      <\/table>\n    <\/panel>\n  <\/row>\n<\/dashboard>",

            "eai:digest": "b929cf4867deb062eec951925ad49a8a",

            "eai:type": "views",

            "eai:userName": "admin",

            "isDashboard": true,

            "isVisible": true,

            "label": ""

         }

      }

   ],

   "paging": {

      "total": 1,

      "perPage": 30,

      "offset": 0

   },

   "messages": []

}; 
