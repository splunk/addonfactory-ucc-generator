import{H as i}from"./HelpLinkComponent-dsK2_iXH.js";import{w as s}from"./withControlGroup-DhG-ZuCY.js";import"./textUtils-DUUDexJ9.js";import"./jsx-runtime-ClejQJRV.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./Link-COq5B319.js";import"./Link-B3IMA5iK.js";import"./Clickable-wzamu0qE.js";import"./index-C6Xwkj2v.js";import"./index-BAMY2Nnw.js";import"./index-BeaWwRds.js";import"./ScreenReaderContent-DTnCP1nJ.js";import"./ArrowSquareTopRight-cE1IFp2S.js";import"./IconProvider-D1bqsLqQ.js";import"./External-CaozYYRu.js";import"./ControlGroup-a8oyWZe3.js";import"./ControlGroup-D1l7iBTi.js";import"./find-D36SYLnv.js";import"./Box-9y-3oeI2.js";import"./Tooltip-s2-C62Iv.js";const A={component:i,title:"HelpLinkComponent",decorators:[s]},n={args:{controlOptions:{text:"example text",link:"example/reflink"}}},t={args:{controlOptions:{text:"Help as text with link assigned to [[here]] word",links:[{slug:"here",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"this"}]}}},e={args:{controlOptions:{text:`Help text 
 displayed 
 in many lines`,links:[{slug:"here",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"this"}]}}},o={args:{controlOptions:{text:`First Line
 Second Line 
[[link]]
 Last line`,links:[{slug:"link",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"Link Line"}]}}},r={args:{controlOptions:{text:`First Line
 Second Line 
 Last line`,link:"https://splunk.github.io/addonfactory-ucc-generator/"}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    controlOptions: {
      text: 'example text',
      link: 'example/reflink'
    }
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    controlOptions: {
      text: 'Help as text with link assigned to [[here]] word',
      links: [{
        slug: 'here',
        link: 'https://splunk.github.io/addonfactory-ucc-generator/',
        linkText: 'this'
      }]
    }
  }
}`,...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    controlOptions: {
      text: 'Help text \\n displayed \\n in many lines',
      links: [{
        slug: 'here',
        link: 'https://splunk.github.io/addonfactory-ucc-generator/',
        linkText: 'this'
      }]
    }
  }
}`,...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    controlOptions: {
      text: 'First Line\\n Second Line \\n[[link]]\\n Last line',
      links: [{
        slug: 'link',
        link: 'https://splunk.github.io/addonfactory-ucc-generator/',
        linkText: 'Link Line'
      }]
    }
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    controlOptions: {
      text: 'First Line\\n Second Line \\n Last line',
      link: 'https://splunk.github.io/addonfactory-ucc-generator/'
    }
  }
}`,...r.parameters?.docs?.source}}};const F=["Base","HelpAsTextWithLinks","HelpNoLinksInManyLines","HelpManyLinesAndLink","OneLinkManyLines"];export{n as Base,t as HelpAsTextWithLinks,o as HelpManyLinesAndLink,e as HelpNoLinksInManyLines,r as OneLinkManyLines,F as __namedExportsOrder,A as default};
