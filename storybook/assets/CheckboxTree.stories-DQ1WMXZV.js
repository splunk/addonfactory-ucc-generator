import{M as i,a as r,c as s}from"./ControlWrapper-8LmMu1gh.js";import{w as d}from"./withControlGroup-RXTCRBts.js";import"./iframe-CkO-8h3X.js";import"./preload-helper-BWMXw09x.js";import"./Date-BPwjYypH.js";import"./lodash-DC5tP0FI.js";import"./includes-CeWRCqDz.js";import"./ChevronLeft-CFN5hHG6.js";import"./ChevronRight-DlBO1xqA.js";import"./isEqual-D_kYa9Y5.js";import"./_baseIsEqual-BA1SpDro.js";import"./Popover-CCWJKSFR.js";import"./_arrayIncludesWith-CKt2KOEb.js";import"./ScrollContainerContext-B3z9T_lz.js";import"./Box-C3_NwA3u.js";import"./_baseIteratee-CKKdKeVM.js";import"./ExclamationTriangle-BPrZIRtp.js";import"./Tooltip-Nygr4oAo.js";import"./InformationCircle-dv8wnI9A.js";import"./MarkdownMessage-B9v76_pw.js";import"./Link-CETJi4Jo.js";import"./Divider-CkbYBkxJ.js";import"./CollapsiblePanel-CN6WDnk5.js";import"./pick-Toh7DJ-o.js";import"./Menu-Bq9H8ILd.js";import"./Dropdown-DdfZSMfv.js";import"./textUtils-Bj3ckYR9.js";import"./Number-DcvxqngO.js";import"./url-BGnD4wdp.js";import"./_baseDifference-BpZKW9m7.js";import"./api-brTVIpnl.js";import"./url-DqCSShB-.js";import"./util-DhnbgUjE.js";import"./messageUtil-CjQtoyHX.js";import"./DatePickerComponent-BAU-o5w3.js";import"./script-C_nnifbq.js";import"./Group-CG6LE1cd.js";const{fn:c}=__STORYBOOK_MODULE_TEST__,J={component:s,title:"CheckboxTree/Component",decorators:[d]},e={args:{handleChange:c(),mode:i,field:"api",value:"collect_collaboration,collect_file,collect_task",label:"checkboxtree",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}}]}}},l={args:{handleChange:c(),mode:i,field:"api",value:"neigh,like",label:"checkboxtree",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}}]}}},a={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},n={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry dummy",fields:["lorem_ipsum1"],options:{isExpandable:!0}},{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry",fields:["lorem_ipsum","lorem_ipsum2"],options:{isExpandable:!1}}],rows:[{field:"lorem_ipsum1",checkbox:{label:"Lorem ipsum dummy"}},{field:"lorem_ipsum2",checkbox:{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry"}},{field:"lorem_ipsum",checkbox:{label:"Lorem ipsum"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},t={args:{...e.args,value:void 0,mode:r,controlOptions:{rows:[{field:"field1",checkbox:{label:"checkbox list with default value true",defaultValue:!0}},{field:"field2",checkbox:{label:"checkbox list with default value false",defaultValue:!1}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    mode: MODE_EDIT,
    field: 'api',
    value: 'collect_collaboration,collect_file,collect_task',
    label: 'checkboxtree',
    controlOptions: {
      rows: [{
        field: 'collect_collaboration',
        checkbox: {
          label: 'Collect folder collaboration'
        }
      }, {
        field: 'collect_file',
        checkbox: {
          label: 'Collect file metadata'
        }
      }, {
        field: 'collect_task',
        checkbox: {
          label: 'Collect tasks and comments'
        }
      }]
    }
  }
}`,...e.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    mode: MODE_EDIT,
    field: 'api',
    value: 'neigh,like',
    label: 'checkboxtree',
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
        }
      }, {
        field: 'collect_file',
        checkbox: {
          label: 'Collect file metadata'
        }
      }]
    }
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    value: 'collect_collaboration',
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
        }
      }, {
        field: 'collect_file',
        checkbox: {
          label: 'Collect file metadata'
        }
      }, {
        field: 'collect_task',
        checkbox: {
          label: 'Collect tasks and comments'
        }
      }, {
        field: 'collect_folder_metadata',
        checkbox: {
          label: 'Collect folder metadata'
        }
      }]
    }
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    value: 'collect_collaboration',
    controlOptions: {
      groups: [{
        label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry dummy',
        fields: ['lorem_ipsum1'],
        options: {
          isExpandable: true
        }
      }, {
        label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
        fields: ['lorem_ipsum', 'lorem_ipsum2'],
        options: {
          isExpandable: false
        }
      }],
      rows: [{
        field: 'lorem_ipsum1',
        checkbox: {
          label: 'Lorem ipsum dummy'
        }
      }, {
        field: 'lorem_ipsum2',
        checkbox: {
          label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry'
        }
      }, {
        field: 'lorem_ipsum',
        checkbox: {
          label: 'Lorem ipsum'
        }
      }, {
        field: 'collect_folder_metadata',
        checkbox: {
          label: 'Collect folder metadata'
        }
      }]
    }
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    value: undefined,
    mode: MODE_CREATE,
    controlOptions: {
      rows: [{
        field: 'field1',
        checkbox: {
          label: 'checkbox list with default value true',
          defaultValue: true
        }
      }, {
        field: 'field2',
        checkbox: {
          label: 'checkbox list with default value false',
          defaultValue: false
        }
      }]
    }
  }
}`,...t.parameters?.docs?.source}}};const P=["Base","Multiline","WithSingleGroup","MixedWithGroups","MultilineWithGroups","CreateMode"];export{e as Base,t as CreateMode,a as MixedWithGroups,l as Multiline,n as MultilineWithGroups,o as WithSingleGroup,P as __namedExportsOrder,J as default};
