import{M as c,a as r,c as s}from"./ControlWrapper-CcOJthta.js";import{w as d}from"./withControlGroup-eGtL2iWE.js";import"./iframe-BLQN0JqS.js";import"./preload-helper-BWMXw09x.js";import"./Date-CLp5-Jfo.js";import"./ChevronLeft-BedkDF4G.js";import"./ChevronRight-Dq0W4qWj.js";import"./ExclamationTriangle-d6YEqz5S.js";import"./Box-YFEb_QRy.js";import"./MarkdownMessage-BHbFjhs0.js";import"./Link-BZqR4iUZ.js";import"./Divider-aChyjKRp.js";import"./CollapsiblePanel-C1Njf11K.js";import"./SVGInternal-sFyMgQuT.js";import"./Number-aCLGLkFq.js";import"./Menu-BiGojXeR.js";import"./Heading-XPGzsxsQ.js";import"./_baseDifference-DZ-TZE0x.js";import"./script-BPSliBjH.js";import"./url-CvJzWRTA.js";import"./url-BdB9R0LC.js";import"./util-D1kXELUL.js";import"./messageUtil-CQQ8zf_h.js";import"./textUtils-BK2yMsTW.js";import"./api-B7g4orc8.js";import"./DatePickerComponent-DYkEFl2K.js";import"./Group-BiXwZAAO.js";const{fn:i}=__STORYBOOK_MODULE_TEST__,A={component:s,title:"CheckboxTree/Component",decorators:[d]},e={args:{handleChange:i(),mode:c,field:"api",value:"collect_collaboration,collect_file,collect_task",label:"checkboxtree",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}}]}}},l={args:{handleChange:i(),mode:c,field:"api",value:"neigh,like",label:"checkboxtree",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}}]}}},a={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},n={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry dummy",fields:["lorem_ipsum1"],options:{isExpandable:!0}},{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry",fields:["lorem_ipsum","lorem_ipsum2"],options:{isExpandable:!1}}],rows:[{field:"lorem_ipsum1",checkbox:{label:"Lorem ipsum dummy"}},{field:"lorem_ipsum2",checkbox:{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry"}},{field:"lorem_ipsum",checkbox:{label:"Lorem ipsum"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},t={args:{...e.args,value:void 0,mode:r,controlOptions:{rows:[{field:"field1",checkbox:{label:"checkbox list with default value true",defaultValue:!0}},{field:"field2",checkbox:{label:"checkbox list with default value false",defaultValue:!1}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const N=["Base","Multiline","WithSingleGroup","MixedWithGroups","MultilineWithGroups","CreateMode"];export{e as Base,t as CreateMode,a as MixedWithGroups,l as Multiline,n as MultilineWithGroups,o as WithSingleGroup,N as __namedExportsOrder,A as default};
