import{f as t}from"./index-DkzrWKzW.js";import{a as i,M as r,b as c}from"./ControlWrapper-C-3SaADr.js";import{w as u}from"./withControlGroup-DQs6wCdb.js";import"./iframe-D1ZpU7rR.js";import"./index-BAMY2Nnw.js";import"./jsx-runtime-1FKYbnEZ.js";import"./index-prPvd6Su.js";import"./_commonjsHelpers-CE1G-McA.js";import"./Number-akKODsrJ.js";import"./isEqual-YuU2Zr8y.js";import"./_baseIteratee-CGcCafy9.js";import"./omit-UcH284-_.js";import"./Dropdown-CEDZaBsM.js";import"./Clickable-vbs6x6a2.js";import"./_arrayIncludesWith-C0sUgJs0.js";import"./includes-BxfbO0I6.js";import"./Box-CA7p2Imy.js";import"./index-BQPxV8oF.js";import"./AnimationToggle-CdPY36C5.js";import"./ScrollContainerContext-DNG8B1ai.js";import"./ChevronRight-Do8a4H-E.js";import"./Menu-D4-b3kko.js";import"./Divider-HUVeSv0X.js";import"./ScreenReaderContent-DRRIcB0C.js";import"./url-C03nQury.js";import"./Button-gbqT1swN.js";import"./ButtonSimple-uRr2gocj.js";import"./Link-ooEZC2Mq.js";import"./CollapsiblePanel-BAnOmC7s.js";import"./_baseDifference-BqVURxtm.js";import"./WaitSpinner-DIBk8RZx.js";import"./ExclamationTriangle-C7EecpCM.js";import"./pick-BOH874jN.js";import"./InformationCircle-kDXLS5kt.js";import"./index-DtbBJ32H.js";import"./MarkdownMessage-Duo508BE.js";import"./Button-B_-pY_Ng.js";import"./variables-BJ06o7R7.js";import"./textUtils-CXkcwnOE.js";import"./api-BXYB3TVR.js";import"./url-uLXecbUQ.js";import"./util-BVaVe7dF.js";import"./messageUtil-CvmCOD_s.js";import"./script-ClADN3Yb.js";import"./Group-BGuJRPkj.js";const le={component:i,title:"CheckboxGroup/Component",decorators:[u]},e={args:{handleChange:t(),mode:r,field:"api",value:"collect_collaboration/1200,collect_file/1,collect_task/1",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}}]}}},l={args:{handleChange:t(),mode:r,field:"api",value:"neigh/1,like/1",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}}]}}},a={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"},input:{defaultValue:1200,required:!1}},{field:"collect_file",checkbox:{label:"Collect file metadata"},input:{defaultValue:1,required:!0}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"},input:{defaultValue:1,required:!0}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"},input:{defaultValue:3600,required:!0}}]}}},n={args:{...e.args,value:void 0,mode:c,controlOptions:{rows:[{field:"field1",checkbox:{label:"Default true with value = 1200",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field2",checkbox:{label:"Default false with value = 2",defaultValue:!1},input:{defaultValue:2,required:!0}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const oe=["Base","Multiline","WithSingleGroup","MixedWithGroups","CreateMode"];export{e as Base,n as CreateMode,a as MixedWithGroups,l as Multiline,o as WithSingleGroup,oe as __namedExportsOrder,le as default};
