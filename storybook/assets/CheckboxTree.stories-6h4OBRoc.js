import{f as i}from"./index-DkzrWKzW.js";import{c,M as r,b as s}from"./ControlWrapper-C-3SaADr.js";import{w as d}from"./withControlGroup-DQs6wCdb.js";import"./iframe-D1ZpU7rR.js";import"./index-BAMY2Nnw.js";import"./jsx-runtime-1FKYbnEZ.js";import"./index-prPvd6Su.js";import"./_commonjsHelpers-CE1G-McA.js";import"./Number-akKODsrJ.js";import"./isEqual-YuU2Zr8y.js";import"./_baseIteratee-CGcCafy9.js";import"./omit-UcH284-_.js";import"./Dropdown-CEDZaBsM.js";import"./Clickable-vbs6x6a2.js";import"./_arrayIncludesWith-C0sUgJs0.js";import"./includes-BxfbO0I6.js";import"./Box-CA7p2Imy.js";import"./index-BQPxV8oF.js";import"./AnimationToggle-CdPY36C5.js";import"./ScrollContainerContext-DNG8B1ai.js";import"./ChevronRight-Do8a4H-E.js";import"./Menu-D4-b3kko.js";import"./Divider-HUVeSv0X.js";import"./ScreenReaderContent-DRRIcB0C.js";import"./url-C03nQury.js";import"./Button-gbqT1swN.js";import"./ButtonSimple-uRr2gocj.js";import"./Link-ooEZC2Mq.js";import"./CollapsiblePanel-BAnOmC7s.js";import"./_baseDifference-BqVURxtm.js";import"./WaitSpinner-DIBk8RZx.js";import"./ExclamationTriangle-C7EecpCM.js";import"./pick-BOH874jN.js";import"./InformationCircle-kDXLS5kt.js";import"./index-DtbBJ32H.js";import"./MarkdownMessage-Duo508BE.js";import"./Button-B_-pY_Ng.js";import"./variables-BJ06o7R7.js";import"./textUtils-CXkcwnOE.js";import"./api-BXYB3TVR.js";import"./url-uLXecbUQ.js";import"./util-BVaVe7dF.js";import"./messageUtil-CvmCOD_s.js";import"./script-ClADN3Yb.js";import"./Group-BGuJRPkj.js";const oe={component:c,title:"CheckboxTree/Component",decorators:[d]},e={args:{handleChange:i(),mode:r,field:"api",value:"collect_collaboration,collect_file,collect_task",label:"checkboxtree",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}}]}}},l={args:{handleChange:i(),mode:r,field:"api",value:"neigh,like",label:"checkboxtree",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}}]}}},a={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},t={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry dummy",fields:["lorem_ipsum1"],options:{isExpandable:!0}},{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry",fields:["lorem_ipsum","lorem_ipsum2"],options:{isExpandable:!1}}],rows:[{field:"lorem_ipsum1",checkbox:{label:"Lorem ipsum dummy"}},{field:"lorem_ipsum2",checkbox:{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry"}},{field:"lorem_ipsum",checkbox:{label:"Lorem ipsum"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},n={args:{...e.args,value:void 0,mode:s,controlOptions:{rows:[{field:"field1",checkbox:{label:"checkbox list with default value true",defaultValue:!0}},{field:"field2",checkbox:{label:"checkbox list with default value false",defaultValue:!1}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const ae=["Base","Multiline","WithSingleGroup","MixedWithGroups","MultilineWithGroups","CreateMode"];export{e as Base,n as CreateMode,a as MixedWithGroups,l as Multiline,t as MultilineWithGroups,o as WithSingleGroup,ae as __namedExportsOrder,oe as default};
