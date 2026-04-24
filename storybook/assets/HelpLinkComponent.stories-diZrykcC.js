import{H as i}from"./ControlWrapper-BM5zRGNC.js";import{w as s}from"./withControlGroup-BbgsCEf2.js";import"./iframe-dpjTMnOC.js";import"./index-nuYtCEEu.js";import"./Date-XutZtAHB.js";import"./id-Db1E8M8a.js";import"./ScrollContainerContext-DogtmX69.js";import"./Box-DE7m460s.js";import"./ChevronLeft-0NIlqeDI.js";import"./ChevronRight-CAKwgwce.js";import"./Popover-D3MLdcR2.js";import"./ExclamationTriangle-CApgSVdg.js";import"./Tooltip-D0dtXLIo.js";import"./InformationCircle-B-WxxbMa.js";import"./MarkdownMessage-Botp4GAi.js";import"./Link-DETRhvtj.js";import"./Divider-BI7HZr8y.js";import"./CollapsiblePanel-DVzU4Rpc.js";import"./pick-JbkSLyfC.js";import"./Menu-BaV4-Toi.js";import"./Dropdown-BSmjb7Ht.js";import"./textUtils-D6rK6Eep.js";import"./Number-EeQbK4AB.js";import"./api-CjZPq5JP.js";import"./url-cmzogVIW.js";import"./url-DGkq2p2F.js";import"./util-DakudGGz.js";import"./messageUtil-DTEwCut0.js";import"./DatePickerComponent-DH2M6FjX.js";import"./script-DFaIqjR1.js";import"./Group-Bp5WCcDP.js";const j={component:i,title:"HelpLinkComponent",decorators:[s]},n={args:{controlOptions:{text:"example text",link:"example/reflink"}}},t={args:{controlOptions:{text:"Help as text with link assigned to [[here]] word",links:[{slug:"here",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"this"}]}}},e={args:{controlOptions:{text:`Help text 
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
}`,...r.parameters?.docs?.source}}};const q=["Base","HelpAsTextWithLinks","HelpNoLinksInManyLines","HelpManyLinesAndLink","OneLinkManyLines"];export{n as Base,t as HelpAsTextWithLinks,o as HelpManyLinesAndLink,e as HelpNoLinksInManyLines,r as OneLinkManyLines,q as __namedExportsOrder,j as default};
