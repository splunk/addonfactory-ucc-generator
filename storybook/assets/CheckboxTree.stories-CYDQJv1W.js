import{M as i,a as r,c as s}from"./ControlWrapper-DW1ssuup.js";import{w as d}from"./withControlGroup-BJ6Sc_PQ.js";import"./iframe-BybQmYhs.js";import"./preload-helper-BWMXw09x.js";import"./Date-BwH_Uvrg.js";import"./lodash-BinLombY.js";import"./includes-C10hJJlp.js";import"./ChevronLeft-BdtWL9An.js";import"./ChevronRight-Cuua9ySr.js";import"./isEqual-t5_yoTve.js";import"./_baseIsEqual-CpM8zJ8H.js";import"./Popover-Bq-E0Lli.js";import"./_arrayIncludesWith-CAwgIatL.js";import"./ScrollContainerContext-CT0yTyFc.js";import"./index-BWpmYAE4.js";import"./Box-Qxlnrgei.js";import"./_baseIteratee-D2Sk1jod.js";import"./ExclamationTriangle-np3aM2XP.js";import"./Tooltip-D3jrOxmc.js";import"./InformationCircle-CW3KzXgV.js";import"./MarkdownMessage-CMGJKqHa.js";import"./Link-DMTOu5_Y.js";import"./Divider-BWQHoYm-.js";import"./CollapsiblePanel-B2Pplelk.js";import"./pick-S4WDSwY2.js";import"./Menu-Cw2EvSGZ.js";import"./Dropdown-ChPXRHzi.js";import"./textUtils-BWv0koaU.js";import"./Number-Cq_yzL8f.js";import"./url-BycM6uy-.js";import"./_baseDifference-CKo66-zF.js";import"./api-DcmWZcVU.js";import"./url-CVF012Ry.js";import"./util-CwSpPLLj.js";import"./messageUtil-CRqYlSDi.js";import"./DatePickerComponent-C7BptdDe.js";import"./script-DKIohx6e.js";import"./Group-z9SGg5Y_.js";const{fn:c}=__STORYBOOK_MODULE_TEST__,P={component:s,title:"CheckboxTree/Component",decorators:[d]},e={args:{handleChange:c(),mode:i,field:"api",value:"collect_collaboration,collect_file,collect_task",label:"checkboxtree",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}}]}}},l={args:{handleChange:c(),mode:i,field:"api",value:"neigh,like",label:"checkboxtree",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}}]}}},a={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},n={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry dummy",fields:["lorem_ipsum1"],options:{isExpandable:!0}},{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry",fields:["lorem_ipsum","lorem_ipsum2"],options:{isExpandable:!1}}],rows:[{field:"lorem_ipsum1",checkbox:{label:"Lorem ipsum dummy"}},{field:"lorem_ipsum2",checkbox:{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry"}},{field:"lorem_ipsum",checkbox:{label:"Lorem ipsum"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},t={args:{...e.args,value:void 0,mode:r,controlOptions:{rows:[{field:"field1",checkbox:{label:"checkbox list with default value true",defaultValue:!0}},{field:"field2",checkbox:{label:"checkbox list with default value false",defaultValue:!1}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const Q=["Base","Multiline","WithSingleGroup","MixedWithGroups","MultilineWithGroups","CreateMode"];export{e as Base,t as CreateMode,a as MixedWithGroups,l as Multiline,n as MultilineWithGroups,o as WithSingleGroup,Q as __namedExportsOrder,P as default};
