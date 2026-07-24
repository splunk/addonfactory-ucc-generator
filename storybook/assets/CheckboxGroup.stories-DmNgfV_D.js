import{M as t,a as i,b as c}from"./ControlWrapper-8LmMu1gh.js";import{w as u}from"./withControlGroup-RXTCRBts.js";import"./iframe-CkO-8h3X.js";import"./preload-helper-BWMXw09x.js";import"./Date-BPwjYypH.js";import"./lodash-DC5tP0FI.js";import"./includes-CeWRCqDz.js";import"./ChevronLeft-CFN5hHG6.js";import"./ChevronRight-DlBO1xqA.js";import"./isEqual-D_kYa9Y5.js";import"./_baseIsEqual-BA1SpDro.js";import"./Popover-CCWJKSFR.js";import"./_arrayIncludesWith-CKt2KOEb.js";import"./ScrollContainerContext-B3z9T_lz.js";import"./Box-C3_NwA3u.js";import"./_baseIteratee-CKKdKeVM.js";import"./ExclamationTriangle-BPrZIRtp.js";import"./Tooltip-Nygr4oAo.js";import"./InformationCircle-dv8wnI9A.js";import"./MarkdownMessage-B9v76_pw.js";import"./Link-CETJi4Jo.js";import"./Divider-CkbYBkxJ.js";import"./CollapsiblePanel-CN6WDnk5.js";import"./pick-Toh7DJ-o.js";import"./Menu-Bq9H8ILd.js";import"./Dropdown-DdfZSMfv.js";import"./textUtils-Bj3ckYR9.js";import"./Number-DcvxqngO.js";import"./url-BGnD4wdp.js";import"./_baseDifference-BpZKW9m7.js";import"./api-brTVIpnl.js";import"./url-DqCSShB-.js";import"./util-DhnbgUjE.js";import"./messageUtil-CjQtoyHX.js";import"./DatePickerComponent-BAU-o5w3.js";import"./script-C_nnifbq.js";import"./Group-CG6LE1cd.js";const{fn:r}=__STORYBOOK_MODULE_TEST__,H={component:c,title:"CheckboxGroup/Component",decorators:[u]},e={args:{handleChange:r(),mode:t,field:"api",value:"collect_collaboration/1200,collect_file/1,collect_task/1",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}}]}}},l={args:{handleChange:r(),mode:t,field:"api",value:"neigh/1,like/1",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}}]}}},a={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"},input:{defaultValue:3600,required:!0}}]}}},n={args:{...e.args,value:void 0,mode:i,controlOptions:{rows:[{field:"field1",checkbox:{label:"Default true with value = 1200",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field2",checkbox:{label:"Default false with value = 2",defaultValue:!1},input:{defaultValue:2,required:!0}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    mode: MODE_EDIT,
    field: 'api',
    value: 'collect_collaboration/1200,collect_file/1,collect_task/1',
    controlOptions: {
      rows: [{
        field: 'collect_collaboration',
        checkbox: {
          label: 'Collect folder collaboration'
        },
        input: {
          defaultValue: 1200,
          required: false
        }
      }, {
        field: 'collect_file',
        checkbox: {
          label: 'Collect file metadata'
        },
        input: {
          defaultValue: 1,
          required: true
        }
      }, {
        field: 'collect_task',
        checkbox: {
          label: 'Collect tasks and comments'
        },
        input: {
          defaultValue: 1,
          required: true
        }
      }]
    }
  }
}`,...e.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    mode: MODE_EDIT,
    field: 'api',
    value: 'neigh/1,like/1',
    controlOptions: {
      rows: [{
        field: 'like',
        checkbox: {
          label: 'I like ponies'
        }
      }, {
        field: 'unicorn',
        checkbox: {
          label: 'Enable unicorn mode (Warning: May attract nearby ponies)'
        }
      }, {
        field: 'neigh',
        checkbox: {
          label: "I agree to occasionally neigh like a pony when nobody's watching"
        }
      }]
    }
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    value: undefined,
    controlOptions: {
      groups: [{
        label: 'Group 1',
        fields: ['collect_collaboration', 'collect_file'],
        options: {
          isExpandable: false
        }
      }],
      rows: [{
        field: 'collect_collaboration',
        checkbox: {
          label: 'Collect folder collaboration'
        },
        input: {
          defaultValue: 1200,
          required: false
        }
      }, {
        field: 'collect_file',
        checkbox: {
          label: 'Collect file metadata'
        },
        input: {
          defaultValue: 1,
          required: true
        }
      }]
    }
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    value: undefined,
    controlOptions: {
      groups: [{
        label: 'Expandable group',
        fields: ['collect_collaboration', 'collect_file'],
        options: {
          isExpandable: true,
          expand: true
        }
      }, {
        label: 'Non expandable group',
        fields: ['collect_folder_metadata'],
        options: {
          isExpandable: false
        }
      }],
      rows: [{
        field: 'collect_collaboration',
        checkbox: {
          label: 'Collect folder collaboration'
        },
        input: {
          defaultValue: 1200,
          required: false
        }
      }, {
        field: 'collect_file',
        checkbox: {
          label: 'Collect file metadata'
        },
        input: {
          defaultValue: 1,
          required: true
        }
      }, {
        field: 'collect_task',
        checkbox: {
          label: 'Collect tasks and comments'
        },
        input: {
          defaultValue: 1,
          required: true
        }
      }, {
        field: 'collect_folder_metadata',
        checkbox: {
          label: 'Collect folder metadata'
        },
        input: {
          defaultValue: 3600,
          required: true
        }
      }]
    }
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    value: undefined,
    mode: MODE_CREATE,
    controlOptions: {
      rows: [{
        field: 'field1',
        checkbox: {
          label: 'Default true with value = 1200',
          defaultValue: true
        },
        input: {
          defaultValue: 1200,
          required: false
        }
      }, {
        field: 'field2',
        checkbox: {
          label: 'Default false with value = 2',
          defaultValue: false
        },
        input: {
          defaultValue: 2,
          required: true
        }
      }]
    }
  }
}`,...n.parameters?.docs?.source}}};const J=["Base","Multiline","WithSingleGroup","MixedWithGroups","CreateMode"];export{e as Base,n as CreateMode,a as MixedWithGroups,l as Multiline,o as WithSingleGroup,J as __namedExportsOrder,H as default};
