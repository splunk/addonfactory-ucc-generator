import{j as m}from"./jsx-runtime-ClejQJRV.js";import{r as v}from"./index-BnZYiL63.js";import{f as l,w as M,a as b,u as w}from"./index-CvFo5rXR.js";import{M as R}from"./MenuInput-DSG2Yqjg.js";import{s as S}from"./util-9s_bzyAI.js";import{g as O}from"./globalConfigMock-DihuT9Zd.js";import{i as g}from"./invariant-Cbo0Fu-i.js";import{P as C}from"./PageContext-BOYMoToK.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./index-_oAP7ge6.js";import"./Clickable-Bwca2DKB.js";import"./index-C6Xwkj2v.js";import"./index-NODxQXf6.js";import"./Menu-D-mvnwT1.js";import"./Menu-RgiCwolK.js";import"./Divider-PTLijbug.js";import"./Heading-9qvZOIYU.js";import"./ChevronRight-DdqaOJ2q.js";import"./IconProvider-BEtmCpKb.js";import"./Switch-DviBBIIV.js";import"./ScreenReaderContent-BTHKdSEY.js";import"./Box-ikMjEsld.js";import"./ArrowSquareTopRight-B5BPln_L.js";import"./External-N3vgloA-.js";import"./ChevronLeft-B87AvXjM.js";import"./messageUtil-1EVq4BLQ.js";import"./variables-DE_hyTtg.js";import"./iframe-Cyl4MB6s.js";import"./script-B1alSWUh.js";import"./url-DcGE77xy.js";import"./find-gWtmx_xX.js";import"./pageContext-DllO6PNg.js";import"./UCCButton-QVuTRROB.js";import"./Button-CGXuhmos.js";import"./Button-CaNu-0_n.js";import"./style-Df2q8Zk_.js";import"./WaitSpinner-CNexVZJK.js";import"./CustomComponentContext-DUBuY9CR.js";function k(e){const[n,t]=v.useState(!1);return v.useEffect(()=>{S(e.config),t(!0)},[e.config]),n?m.jsx(C,{platform:"enterprise",children:m.jsx(R,{handleRequestOpen:e.handleRequestOpen})}):m.jsx("span",{children:"loading"})}function f(e){const n=b(e),t=e.parentElement;g(t);const i=b(t),r=w.setup();return{canvas:n,body:i,user:r}}const ve={component:k,title:"MenuInput"},p={actions:[],header:[{field:"",label:""}],customRow:{}},W=[{name:"test-service-name1",title:"test-service-title1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",entity:[]},{name:"test-service-name2",title:"test-service-title2",entity:[]}],P=[{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]}],s=O(),{inputs:d}=s.pages;g(d);const{services:q}=d;g(q);const o={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:d.title,services:W,table:p}}}}},a={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{services:[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]}],groupsMenu:P,title:"",table:p}}}}},h=[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]},{name:"test-service-hide-cloud-name1",title:"test-service-hide-cloud-title1",subTitle:"test-service-hide-cloud-subTitle1",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-cloud-name2",title:"test-service-hide-cloud-title2",subTitle:"test-service-hide-cloud-subTitle2",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-enterprise-name1",title:"test-service-hide-enterprise-title1",subTitle:"test-service-hide-enterprise-subTitle1",entity:[],hideForPlatform:"enterprise"},{name:"test-service-hide-enterprise-name2",title:"test-service-hide-enterprise-title2",subTitle:"test-service-hide-enterprise-subTitle2",entity:[],hideForPlatform:"enterprise"}],y=[{groupName:"test-service-hide-cloud-name1",groupTitle:"test-service-hide-cloud-title1"},{groupName:"test-service-hide-enterprise-name1",groupTitle:"test-service-hide-enterprise-title1"},{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]},{groupName:"test-group-hide-for-platform",groupTitle:"test-group hide for platform",groupServices:["test-service-hide-enterprise-name2","test-service-hide-cloud-name2"]}],u={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r),await t.findByRole("menuitem",{name:"test-group-title1"})}},c={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r);const T=await t.findByRole("menuitem",{name:"test-group hide for platform"});await i.click(T),await M(()=>!t.queryByRole("menuitem",{name:"test-group hide for platform"}))}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    handleRequestOpen: fn(),
    config: {
      ...globalConfigMock,
      pages: {
        ...globalConfigMock.pages,
        inputs: {
          title: inputs.title,
          services: commonServices,
          table
        }
      }
    }
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    handleRequestOpen: fn(),
    config: {
      ...globalConfigMock,
      pages: {
        ...globalConfigMock.pages,
        inputs: {
          services: [{
            name: 'test-service-name1',
            title: 'test-service-title1',
            subTitle: 'test-service-subTitle1',
            entity: []
          }, {
            name: 'test-subservice1-name1',
            title: 'test-subservice1-title1',
            subTitle: 'test-subservice-subTitle1',
            entity: []
          }, {
            name: 'test-subservice1-name2',
            title: 'test-subservice1-title2',
            subTitle: 'test-subservice-subTitle2',
            entity: []
          }, {
            name: 'test-service-name2',
            title: 'test-service-title2',
            subTitle: 'test-service-subTitle2',
            entity: []
          }],
          groupsMenu: commonGroups,
          title: '',
          table
        }
      }
    } satisfies z.input<typeof GlobalConfigSchema>
  }
}`,...a.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    handleRequestOpen: fn(),
    config: {
      ...globalConfigMock,
      pages: {
        ...globalConfigMock.pages,
        inputs: {
          title: 'WithOpenedSubMenu',
          services: servicesWithHideForPlatform,
          groupsMenu: groupMenuHideForPlatform,
          table
        }
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const {
      canvas,
      body,
      user
    } = setup(canvasElement);
    const menuDropdown = await canvas.findByRole('button', {
      name: 'Create New Input'
    });
    await user.click(menuDropdown);
    await body.findByRole('menuitem', {
      name: 'test-group-title1'
    });
  }
}`,...u.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    handleRequestOpen: fn(),
    config: {
      ...globalConfigMock,
      pages: {
        ...globalConfigMock.pages,
        inputs: {
          title: 'WithOpenedSubMenu',
          services: servicesWithHideForPlatform,
          groupsMenu: groupMenuHideForPlatform,
          table
        }
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const {
      canvas,
      body,
      user
    } = setup(canvasElement);
    const menuDropdown = await canvas.findByRole('button', {
      name: 'Create New Input'
    });
    await user.click(menuDropdown);
    const groupMenuItem = await body.findByRole('menuitem', {
      name: 'test-group hide for platform'
    });
    await user.click(groupMenuItem);
    await waitFor(() => !body.queryByRole('menuitem', {
      name: 'test-group hide for platform'
    }));
  }
}`,...c.parameters?.docs?.source}}};const be=["Base","WithSubMenu","WithOpenedMenu","WithOpenedSubMenu"];export{o as Base,u as WithOpenedMenu,c as WithOpenedSubMenu,a as WithSubMenu,be as __namedExportsOrder,ve as default};
