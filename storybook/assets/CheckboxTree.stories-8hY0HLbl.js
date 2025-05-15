import{f as c}from"./index-CvFo5rXR.js";import{C as r}from"./CheckboxTree-CqcgSKlG.js";import{M as i,a as s}from"./modes-BS4Pl0Rc.js";import{w as d}from"./withControlGroup-BJQrrEa9.js";import"./jsx-runtime-ClejQJRV.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./Button-CGXuhmos.js";import"./Button-CaNu-0_n.js";import"./Clickable-Bwca2DKB.js";import"./index-C6Xwkj2v.js";import"./index-NODxQXf6.js";import"./ScreenReaderContent-BTHKdSEY.js";import"./style-Df2q8Zk_.js";import"./IconProvider-BEtmCpKb.js";import"./External-N3vgloA-.js";import"./CollapsiblePanel-D1q-pX-7.js";import"./usePrevious-T3tkdeEg.js";import"./Box-ikMjEsld.js";import"./ChevronRight-DdqaOJ2q.js";import"./variables-DE_hyTtg.js";import"./pick-BhCQhcgj.js";import"./Switch-CDZXRY2n.js";import"./Switch-DviBBIIV.js";import"./ControlGroup-DNw1xQ1K.js";import"./ControlGroup-BdgR-Lfo.js";import"./find-gWtmx_xX.js";import"./Tooltip-C8RPrfb3.js";const R={component:r,title:"CheckboxTree/Component",decorators:[d]},e={args:{handleChange:c(),mode:i,field:"api",value:"collect_collaboration,collect_file,collect_task",label:"checkboxtree",controlOptions:{rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}}]}}},l={args:{handleChange:c(),mode:i,field:"api",value:"neigh,like",label:"checkboxtree",controlOptions:{rows:[{field:"like",checkbox:{label:"I like ponies"}},{field:"unicorn",checkbox:{label:"Enable unicorn mode (Warning: May attract nearby ponies)"}},{field:"neigh",checkbox:{label:"I agree to occasionally neigh like a pony when nobody's watching"}}]}}},o={args:{...e.args,value:void 0,controlOptions:{groups:[{label:"Group 1",fields:["collect_collaboration","collect_file"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}}]}}},a={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Expandable group",fields:["collect_collaboration","collect_file"],options:{isExpandable:!0,expand:!0}},{label:"Non expandable group",fields:["collect_folder_metadata"],options:{isExpandable:!1}}],rows:[{field:"collect_collaboration",checkbox:{label:"Collect folder collaboration"}},{field:"collect_file",checkbox:{label:"Collect file metadata"}},{field:"collect_task",checkbox:{label:"Collect tasks and comments"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},n={args:{...e.args,value:"collect_collaboration",controlOptions:{groups:[{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry dummy",fields:["lorem_ipsum1"],options:{isExpandable:!0}},{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry",fields:["lorem_ipsum","lorem_ipsum2"],options:{isExpandable:!1}}],rows:[{field:"lorem_ipsum1",checkbox:{label:"Lorem ipsum dummy"}},{field:"lorem_ipsum2",checkbox:{label:"Lorem Ipsum is simply dummy text of the printing and typesetting industry"}},{field:"lorem_ipsum",checkbox:{label:"Lorem ipsum"}},{field:"collect_folder_metadata",checkbox:{label:"Collect folder metadata"}}]}}},t={args:{...e.args,value:void 0,mode:s,controlOptions:{rows:[{field:"field1",checkbox:{label:"checkbox list with default value true",defaultValue:!0}},{field:"field2",checkbox:{label:"checkbox list with default value false",defaultValue:!1}}]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const j=["Base","Multiline","WithSingleGroup","MixedWithGroups","MultilineWithGroups","CreateMode"];export{e as Base,t as CreateMode,a as MixedWithGroups,l as Multiline,n as MultilineWithGroups,o as WithSingleGroup,j as __namedExportsOrder,R as default};
