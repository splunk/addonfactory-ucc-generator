import{M as t,a as i,b as c}from"./ControlWrapper-DW1ssuup.js";import{w as u}from"./withControlGroup-BJ6Sc_PQ.js";import"./iframe-BybQmYhs.js";import"./preload-helper-BWMXw09x.js";import"./Date-BwH_Uvrg.js";import"./lodash-BinLombY.js";import"./includes-C10hJJlp.js";import"./ChevronLeft-BdtWL9An.js";import"./ChevronRight-Cuua9ySr.js";import"./isEqual-t5_yoTve.js";import"./_baseIsEqual-CpM8zJ8H.js";import"./Popover-Bq-E0Lli.js";import"./_arrayIncludesWith-CAwgIatL.js";import"./ScrollContainerContext-CT0yTyFc.js";import"./index-BWpmYAE4.js";import"./Box-Qxlnrgei.js";import"./_baseIteratee-D2Sk1jod.js";import"./ExclamationTriangle-np3aM2XP.js";import"./Tooltip-D3jrOxmc.js";import"./InformationCircle-CW3KzXgV.js";import"./MarkdownMessage-CMGJKqHa.js";import"./Link-DMTOu5_Y.js";import"./Divider-BWQHoYm-.js";import"./CollapsiblePanel-B2Pplelk.js";import"./pick-S4WDSwY2.js";import"./Menu-Cw2EvSGZ.js";import"./Dropdown-ChPXRHzi.js";import"./textUtils-BWv0koaU.js";import"./Number-Cq_yzL8f.js";import"./url-BycM6uy-.js";import"./_baseDifference-CKo66-zF.js";import"./api-DcmWZcVU.js";import"./url-CVF012Ry.js";import"./util-CwSpPLLj.js";import"./messageUtil-CRqYlSDi.js";import"./DatePickerComponent-C7BptdDe.js";import"./script-DKIohx6e.js";import"./Group-z9SGg5Y_.js";const{fn:r}=__STORYBOOK_MODULE_TEST__,J={component:c,title:"CheckboxGroup/Component",decorators:[u]},e={args:{handleChange:r(),mode:t,field:"api",value:"collect_collaboration/1200,collect_file/1,collect_task/1",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}}]}}},l={args:{handleChange:r(),mode:t,field:"api",value:"neigh/1,like/1",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}}]}}},a={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"},input:{defaultValue:3600,required:!0}}]}}},n={args:{...e.args,value:void 0,mode:i,controlOptions:{rows:[{field:"field1",checkbox:{label:"Default true with value = 1200",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field2",checkbox:{label:"Default false with value = 2",defaultValue:!1},input:{defaultValue:2,required:!0}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const P=["Base","Multiline","WithSingleGroup","MixedWithGroups","CreateMode"];export{e as Base,n as CreateMode,a as MixedWithGroups,l as Multiline,o as WithSingleGroup,P as __namedExportsOrder,J as default};
