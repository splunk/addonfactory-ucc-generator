import React, { useState, useEffect } from 'react';
import { createURL } from '@splunk/splunk-utils/url';
import {defaultFetchInit} from '@splunk/splunk-utils/fetch';
import * as _ from "lodash";

import InputTable from './InputTable';

function TableWrapper() {

    const [data, setData] = useState([
        {
          "name": "account",
          "id": "https://10.202.39.212:8000/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/account",
          "updated": "1970-01-01T00:00:00+00:00",
          "links": {
            "alternate": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/account",
            "list": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/account",
            "edit": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/account",
            "remove": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/account"
          },
          "author": "nobody",
          "acl": {
            "app": "Splunk_TA_salesforce",
            "can_list": true,
            "can_write": true,
            "modifiable": false,
            "owner": "nobody",
            "perms": {
              "read": [
                "admin",
                "power",
                "splunk-system-role",
                "user"
              ],
              "write": [
                "admin",
                "splunk-system-role"
              ]
            },
            "removable": true,
            "sharing": "app"
          },
          "content": {
            "disabled": false,
            "eai:acl": null,
            "host": "$decideOnStartup",
            "host_resolved": "so1",
            "index": "11default",
            "interval": "1200",
            "limit": "1000",
            "object": "Account",
            "object_fields": "Id,LastModifiedById,LastModifiedDate,Name",
            "order_by": "LastModifiedDate",
            "python.version": null,
            "sourcetype": "sfdc:object",
            "start_by_shell": "false"
          }
        },
        {
          "name": "contentversion",
          "id": "https://10.202.39.212:8000/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/contentversion",
          "updated": "1970-01-01T00:00:00+00:00",
          "links": {
            "alternate": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/contentversion",
            "list": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/contentversion",
            "edit": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/contentversion",
            "remove": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/contentversion"
          },
          "author": "nobody",
          "acl": {
            "app": "Splunk_TA_salesforce",
            "can_list": true,
            "can_write": true,
            "modifiable": false,
            "owner": "nobody",
            "perms": {
              "read": [
                "admin",
                "power",
                "splunk-system-role",
                "user"
              ],
              "write": [
                "admin",
                "splunk-system-role"
              ]
            },
            "removable": true,
            "sharing": "app"
          },
          "content": {
            "disabled": false,
            "eai:acl": null,
            "host": "$decideOnStartup",
            "host_resolved": "so1",
            "index": "default",
            "interval": "1200",
            "limit": "1000",
            "object": "ContentVersion",
            "object_fields": "Id,LastModifiedById,LastModifiedDate,Title",
            "order_by": "LastModifiedDate",
            "python.version": null,
            "sourcetype": "sfdc:object",
            "start_by_shell": "false"
          }
        },
        {
          "name": "dashboard",
          "id": "https://10.202.39.212:8000/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/dashboard",
          "updated": "1970-01-01T00:00:00+00:00",
          "links": {
            "alternate": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/dashboard",
            "list": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/dashboard",
            "edit": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/dashboard",
            "remove": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/dashboard"
          },
          "author": "nobody",
          "acl": {
            "app": "Splunk_TA_salesforce",
            "can_list": true,
            "can_write": true,
            "modifiable": false,
            "owner": "nobody",
            "perms": {
              "read": [
                "admin",
                "power",
                "splunk-system-role",
                "user"
              ],
              "write": [
                "admin",
                "splunk-system-role"
              ]
            },
            "removable": true,
            "sharing": "app"
          },
          "content": {
            "disabled": true,
            "eai:acl": null,
            "account": "Temp1",
            "host": "$decideOnStartup",
            "host_resolved": "so1",
            "index": "22default",
            "interval": "1200",
            "limit": "1000",
            "object": "Dashboard",
            "object_fields": "Id,LastModifiedDate,Title",
            "order_by": "LastModifiedDate",
            "python.version": null,
            "sourcetype": "sfdc:object",
            "start_by_shell": "false"
          }
        },
        {
          "name": "loginhistory",
          "id": "https://10.202.39.212:8000/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/loginhistory",
          "updated": "1970-01-01T00:00:00+00:00",
          "links": {
            "alternate": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/loginhistory",
            "list": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/loginhistory",
            "edit": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/loginhistory",
            "remove": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/loginhistory"
          },
          "author": "nobody",
          "acl": {
            "app": "Splunk_TA_salesforce",
            "can_list": true,
            "can_write": true,
            "modifiable": false,
            "owner": "nobody",
            "perms": {
              "read": [
                "admin",
                "power",
                "splunk-system-role",
                "user"
              ],
              "write": [
                "admin",
                "splunk-system-role"
              ]
            },
            "removable": true,
            "sharing": "app"
          },
          "content": {
            "disabled": true,
            "eai:acl": null,
            "account": "Other",
            "host": "$decideOnStartup",
            "host_resolved": "so1",
            "index": "default",
            "interval": "60",
            "limit": "1000",
            "object": "LoginHistory",
            "object_fields": "ApiType,ApiVersion,Application,Browser,ClientVersion,Id,LoginTime,LoginType,LoginUrl,Platform,SourceIp,Status,UserId",
            "order_by": "LoginTime",
            "python.version": null,
            "sourcetype": "sfdc:object",
            "start_by_shell": "false"
          }
        },
        {
          "name": "opportunity",
          "id": "https://10.202.39.212:8000/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/opportunity",
          "updated": "1970-01-01T00:00:00+00:00",
          "links": {
            "alternate": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/opportunity",
            "list": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/opportunity",
            "edit": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/opportunity",
            "remove": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/opportunity"
          },
          "author": "nobody",
          "acl": {
            "app": "Splunk_TA_salesforce",
            "can_list": true,
            "can_write": true,
            "modifiable": false,
            "owner": "nobody",
            "perms": {
              "read": [
                "admin",
                "power",
                "splunk-system-role",
                "user"
              ],
              "write": [
                "admin",
                "splunk-system-role"
              ]
            },
            "removable": true,
            "sharing": "app"
          },
          "content": {
            "disabled": true,
            "eai:acl": null,
            "account": "Dummy1",
            "host": "$decideOnStartup",
            "host_resolved": "so1",
            "index": "default",
            "interval": "1200",
            "limit": "1000",
            "object": "Opportunity",
            "object_fields": "Id,LastModifiedById,LastModifiedDate,Name",
            "order_by": "LastModifiedDate",
            "python.version": null,
            "sourcetype": "sfdc:object",
            "start_by_shell": "false"
          }
        },
        {
          "name": "report",
          "id": "https://10.202.39.212:8000/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/report",
          "updated": "1970-01-01T00:00:00+00:00",
          "links": {
            "alternate": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/report",
            "list": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/report",
            "edit": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/report",
            "remove": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/report"
          },
          "author": "nobody",
          "acl": {
            "app": "Splunk_TA_salesforce",
            "can_list": true,
            "can_write": true,
            "modifiable": false,
            "owner": "nobody",
            "perms": {
              "read": [
                "admin",
                "power",
                "splunk-system-role",
                "user"
              ],
              "write": [
                "admin",
                "splunk-system-role"
              ]
            },
            "removable": true,
            "sharing": "app"
          },
          "content": {
            "disabled": true,
            "eai:acl": null,
            "account": "Test",
            "host": "$decideOnStartup",
            "host_resolved": "so1",
            "index": "default",
            "interval": "1200",
            "limit": "1000",
            "object": "Report",
            "object_fields": "Id,LastModifiedDate,Name",
            "order_by": "LastModifiedDate",
            "python.version": null,
            "sourcetype": "sfdc:object",
            "start_by_shell": "false"
          }
        },
        {
          "name": "user",
          "id": "https://10.202.39.212:8000/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/user",
          "updated": "1970-01-01T00:00:00+00:00",
          "links": {
            "alternate": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/user",
            "list": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/user",
            "edit": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/user",
            "remove": "/servicesNS/nobody/Splunk_TA_salesforce/Splunk_TA_salesforce_sfdc_object/user"
          },
          "author": "nobody",
          "acl": {
            "app": "Splunk_TA_salesforce",
            "can_list": true,
            "can_write": true,
            "modifiable": false,
            "owner": "nobody",
            "perms": {
              "read": [
                "admin",
                "power",
                "splunk-system-role",
                "user"
              ],
              "write": [
                "admin",
                "splunk-system-role"
              ]
            },
            "removable": true,
            "sharing": "app"
          },
          "content": {
            "disabled": true,
            "account": "Tushar",
            "eai:acl": null,
            "host": "$decideOnStartup",
            "host_resolved": "so1",
            "index": "default",
            "interval": "1200",
            "limit": "1000",
            "object": "User",
            "object_fields": "LastModifiedDate,City,Country,FirstName,Id,IsActive,LastLoginDate,LastName,Latitude,Longitude,MobilePhone,Name,PostalCode,State,Username,UserRoleId,UserType,Email,CompanyName,ProfileId,Profile.PermissionsApiEnabled,Profile.PermissionsModifyAllData,Profile.PermissionsViewSetup",
            "order_by": "LastModifiedDate",
            "python.version": null,
            "sourcetype": "sfdc:object",
            "start_by_shell": "false"
          }
        }
      ]);
      
    const [columns, setColumns] = useState([
        { sortKey: 'name', key: 'name', label: 'Name', width: 300, minWidth: 80, visible: true },
        { sortKey: 'account', key: 'account', label: 'Account Name', width: 300, minWidth: 80, visible: true },
        { sortKey: 'interval', key: 'interval', label: 'Interval', width: 300, minWidth: 80, visible: true },
        { sortKey: 'index', key: 'index', label: 'Index', width: 300, minWidth: 80, visible: true },
        { sortKey: 'status', key: 'status', label: 'Status', width: 300, minWidth: 80, visible: true },
        { sortKey: '', key: 'actions', label: 'Actions', width: 200, minWidth: 80, visible: true }
    ]);

    const changeStatus = (row) => {
        let oldData = _.cloneDeep(data);
        const index = _.findIndex(oldData, (o) => { return o.id == row.id });
        if (index != -1) {
            oldData[index].content.disabled = !oldData[index].content.disabled;
        }
        setData(oldData);
    }

    return (
        <InputTable 
            data={data} 
            columns={columns} 
            handleToggleActionClick={(row) => changeStatus(row)}
        />
    );
}

export default TableWrapper;
