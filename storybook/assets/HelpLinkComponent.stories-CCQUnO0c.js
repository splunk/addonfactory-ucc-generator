import{H as s}from"./HelpLinkComponent-BUlM-ARy.js";import{w as i}from"./withControlGroup-BJQrrEa9.js";import"./textUtils-BSxsNS3U.js";import"./jsx-runtime-ClejQJRV.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./Link-BHUv1Tn8.js";import"./Link-em2tLaYv.js";import"./Clickable-Bwca2DKB.js";import"./index-C6Xwkj2v.js";import"./index-NODxQXf6.js";import"./ScreenReaderContent-BTHKdSEY.js";import"./ArrowSquareTopRight-B5BPln_L.js";import"./IconProvider-BEtmCpKb.js";import"./External-N3vgloA-.js";import"./ControlGroup-DNw1xQ1K.js";import"./ControlGroup-BdgR-Lfo.js";import"./find-gWtmx_xX.js";import"./Box-ikMjEsld.js";import"./Tooltip-C8RPrfb3.js";const M={component:s,title:"HelpLinkComponent",decorators:[i]},n={args:{controlOptions:{text:"example text",link:"example/reflink"}}},t={args:{controlOptions:{text:"Help as text with link assigned to [[here]] word",links:[{slug:"here",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"this"}]}}},e={args:{controlOptions:{text:`Help text 
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
}`,...r.parameters?.docs?.source}}};const A=["Base","HelpAsTextWithLinks","HelpNoLinksInManyLines","HelpManyLinesAndLink","OneLinkManyLines"];export{n as Base,t as HelpAsTextWithLinks,o as HelpManyLinesAndLink,e as HelpNoLinksInManyLines,r as OneLinkManyLines,A as __namedExportsOrder,M as default};
