import{H as i}from"./HelpLinkComponent-DIfiPZKf.js";import{w as s}from"./withControlGroup-DEXNoma6.js";import"./textUtils-CvJd_8qc.js";import"./jsx-runtime-D55GQ3BV.js";import"./index-CtTTUaxh.js";import"./_commonjsHelpers-CE1G-McA.js";import"./Link-CFB-t7hC.js";import"./Link-DTBEsgMb.js";import"./Clickable-gBf45GFR.js";import"./_arrayIncludesWith-Cf8RQZ1L.js";import"./index-BAMY2Nnw.js";import"./index-TwQu68rg.js";import"./index-BKv2EDKS.js";import"./ScreenReaderContent-qsyEXMyy.js";import"./ArrowSquareTopRight-2nx1XQBJ.js";import"./IconProvider-DfXPuXoa.js";import"./External-CYO48bYj.js";import"./ControlGroup-Dz58dqqR.js";import"./ControlGroup-h1kJxx7z.js";import"./find-DOPPtTO5.js";import"./Box-BaDtlhAb.js";import"./Tooltip-nNqhIvge.js";const F={component:i,title:"HelpLinkComponent",decorators:[s]},n={args:{controlOptions:{text:"example text",link:"example/reflink"}}},t={args:{controlOptions:{text:"Help as text with link assigned to [[here]] word",links:[{slug:"here",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"this"}]}}},e={args:{controlOptions:{text:`Help text 
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
}`,...r.parameters?.docs?.source}}};const C=["Base","HelpAsTextWithLinks","HelpNoLinksInManyLines","HelpManyLinesAndLink","OneLinkManyLines"];export{n as Base,t as HelpAsTextWithLinks,o as HelpManyLinesAndLink,e as HelpNoLinksInManyLines,r as OneLinkManyLines,C as __namedExportsOrder,F as default};
