import{H as i}from"./ControlWrapper-8LmMu1gh.js";import{w as s}from"./withControlGroup-RXTCRBts.js";import"./iframe-CkO-8h3X.js";import"./preload-helper-BWMXw09x.js";import"./Date-BPwjYypH.js";import"./lodash-DC5tP0FI.js";import"./includes-CeWRCqDz.js";import"./ChevronLeft-CFN5hHG6.js";import"./ChevronRight-DlBO1xqA.js";import"./isEqual-D_kYa9Y5.js";import"./_baseIsEqual-BA1SpDro.js";import"./Popover-CCWJKSFR.js";import"./_arrayIncludesWith-CKt2KOEb.js";import"./ScrollContainerContext-B3z9T_lz.js";import"./Box-C3_NwA3u.js";import"./_baseIteratee-CKKdKeVM.js";import"./ExclamationTriangle-BPrZIRtp.js";import"./Tooltip-Nygr4oAo.js";import"./InformationCircle-dv8wnI9A.js";import"./MarkdownMessage-B9v76_pw.js";import"./Link-CETJi4Jo.js";import"./Divider-CkbYBkxJ.js";import"./CollapsiblePanel-CN6WDnk5.js";import"./pick-Toh7DJ-o.js";import"./Menu-Bq9H8ILd.js";import"./Dropdown-DdfZSMfv.js";import"./textUtils-Bj3ckYR9.js";import"./Number-DcvxqngO.js";import"./url-BGnD4wdp.js";import"./_baseDifference-BpZKW9m7.js";import"./api-brTVIpnl.js";import"./url-DqCSShB-.js";import"./util-DhnbgUjE.js";import"./messageUtil-CjQtoyHX.js";import"./DatePickerComponent-BAU-o5w3.js";import"./script-C_nnifbq.js";import"./Group-CG6LE1cd.js";const K={component:i,title:"HelpLinkComponent",decorators:[s]},n={args:{controlOptions:{text:"example text",link:"example/reflink"}}},t={args:{controlOptions:{text:"Help as text with link assigned to [[here]] word",links:[{slug:"here",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"this"}]}}},e={args:{controlOptions:{text:`Help text 
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
}`,...r.parameters?.docs?.source}}};const P=["Base","HelpAsTextWithLinks","HelpNoLinksInManyLines","HelpManyLinesAndLink","OneLinkManyLines"];export{n as Base,t as HelpAsTextWithLinks,o as HelpManyLinesAndLink,e as HelpNoLinksInManyLines,r as OneLinkManyLines,P as __namedExportsOrder,K as default};
