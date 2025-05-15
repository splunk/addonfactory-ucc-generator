import{f as t}from"./index-CvFo5rXR.js";import{C as i}from"./CheckboxGroup-CqFPSUvW.js";import{M as r,a as c}from"./modes-BS4Pl0Rc.js";import{w as u}from"./withControlGroup-BJQrrEa9.js";import"./jsx-runtime-ClejQJRV.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./Button-CGXuhmos.js";import"./Button-CaNu-0_n.js";import"./Clickable-Bwca2DKB.js";import"./index-C6Xwkj2v.js";import"./index-NODxQXf6.js";import"./ScreenReaderContent-BTHKdSEY.js";import"./style-Df2q8Zk_.js";import"./IconProvider-BEtmCpKb.js";import"./External-N3vgloA-.js";import"./Group-CC-M2yhK.js";import"./CollapsiblePanel-D1q-pX-7.js";import"./usePrevious-T3tkdeEg.js";import"./Box-ikMjEsld.js";import"./ChevronRight-DdqaOJ2q.js";import"./variables-DE_hyTtg.js";import"./Text-BNJLg959.js";import"./TextArea-W5IxQHto.js";import"./ControlGroup-BdgR-Lfo.js";import"./find-gWtmx_xX.js";import"./Tooltip-C8RPrfb3.js";import"./Close-Bj9wtoJU.js";import"./Switch-CDZXRY2n.js";import"./Switch-DviBBIIV.js";import"./messageUtil-1EVq4BLQ.js";import"./invariant-Cbo0Fu-i.js";import"./ControlGroup-DNw1xQ1K.js";const H={component:i,title:"CheckboxGroup/Component",decorators:[u]},e={args:{handleChange:t(),mode:r,field:"api",value:"collect_collaboration/1200,collect_file/1,collect_task/1",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}}]}}},l={args:{handleChange:t(),mode:r,field:"api",value:"neigh/1,like/1",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}}]}}},a={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"},input:{defaultValue:3600,required:!0}}]}}},n={args:{...e.args,value:void 0,mode:c,controlOptions:{rows:[{field:"field1",checkbox:{label:"Default true with value = 1200",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field2",checkbox:{label:"Default false with value = 2",defaultValue:!1},input:{defaultValue:2,required:!0}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
