import{M as t,a as i,b as c}from"./ControlWrapper-CcOJthta.js";import{w as u}from"./withControlGroup-eGtL2iWE.js";import"./iframe-BLQN0JqS.js";import"./preload-helper-BWMXw09x.js";import"./Date-CLp5-Jfo.js";import"./ChevronLeft-BedkDF4G.js";import"./ChevronRight-Dq0W4qWj.js";import"./ExclamationTriangle-d6YEqz5S.js";import"./Box-YFEb_QRy.js";import"./MarkdownMessage-BHbFjhs0.js";import"./Link-BZqR4iUZ.js";import"./Divider-aChyjKRp.js";import"./CollapsiblePanel-C1Njf11K.js";import"./SVGInternal-sFyMgQuT.js";import"./Number-aCLGLkFq.js";import"./Menu-BiGojXeR.js";import"./Heading-XPGzsxsQ.js";import"./_baseDifference-DZ-TZE0x.js";import"./script-BPSliBjH.js";import"./url-CvJzWRTA.js";import"./url-BdB9R0LC.js";import"./util-D1kXELUL.js";import"./messageUtil-CQQ8zf_h.js";import"./textUtils-BK2yMsTW.js";import"./api-B7g4orc8.js";import"./DatePickerComponent-DYkEFl2K.js";import"./Group-BiXwZAAO.js";const{fn:r}=__STORYBOOK_MODULE_TEST__,R={component:c,title:"CheckboxGroup/Component",decorators:[u]},e={args:{handleChange:r(),mode:t,field:"api",value:"collect_collaboration/1200,collect_file/1,collect_task/1",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}}]}}},l={args:{handleChange:r(),mode:t,field:"api",value:"neigh/1,like/1",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},a={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"},input:{defaultValue:3600,required:!0}}]}}},n={args:{...e.args,value:void 0,mode:i,controlOptions:{rows:[{field:"field1",checkbox:{label:"Default true with value = 1200",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field2",checkbox:{label:"Default false with value = 2",defaultValue:!1},input:{defaultValue:2,required:!0}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const A=["Base","Multiline","WithSingleGroup","MixedWithGroups","CreateMode"];export{e as Base,n as CreateMode,o as MixedWithGroups,l as Multiline,a as WithSingleGroup,A as __namedExportsOrder,R as default};
