import{j as m}from"./jsx-runtime-ojCMydbh.js";import{r as v}from"./index-DI6txC9U.js";import{f as l,w as M,a as b,u as w}from"./index-DpwipV_e.js";import{M as R}from"./MenuInput-C4QYufxg.js";import{s as S,i as g}from"./util-CGkFfNTa.js";import{g as O}from"./globalConfigMock-D5-GCOWV.js";import{P as C}from"./PageContext-BspKImV7.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-BVJboWvC.js";import"./index-BAMY2Nnw.js";import"./index-DBQfC_yZ.js";import"./Clickable-m7b-p22w.js";import"./omit-ztEEjYnI.js";import"./Menu-B_JWJb-T.js";import"./Dropdown-ChHUzFro.js";import"./Popover-CmySphiq.js";import"./_arrayIncludesWith-D7mRho23.js";import"./includes-Clo6__ke.js";import"./Box-dCuMX_uk.js";import"./index-CujC5SV_.js";import"./AnimationToggle-Dgpdi4Ip.js";import"./_baseIteratee-BgljbWfr.js";import"./ScrollContainerContext-Cdp9tX0F.js";import"./ChevronRight-B2uYXglV.js";import"./isEqual-Q2uatnfO.js";import"./Menu-DJUgZFWQ.js";import"./Divider-wHm8s2UO.js";import"./ScreenReaderContent-DYUfzbCm.js";import"./ChevronLeft-CjhuJSXo.js";import"./messageUtil-8kA0E4H4.js";import"./variables-BfrwVMxe.js";import"./pageContext-DllO6PNg.js";import"./UCCButton-C-pV6XSt.js";import"./Button-zWON0gNY.js";import"./Button-BVwbUX9I.js";import"./ButtonSimple-Bnkbn06o.js";import"./WaitSpinner-BSmPTg-B.js";function k(e){const[n,t]=v.useState(!1);return v.useEffect(()=>{S(e.config),t(!0)},[e.config]),n?m.jsx(C,{platform:"enterprise",children:m.jsx(R,{handleRequestOpen:e.handleRequestOpen})}):m.jsx("span",{children:"loading"})}function f(e){const n=b(e),t=e.parentElement;g(t);const i=b(t),r=w.setup();return{canvas:n,body:i,user:r}}const de={component:k,title:"MenuInput"},p={actions:[],header:[{field:"",label:""}]},W=[{name:"test-service-name1",title:"test-service-title1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",entity:[]},{name:"test-service-name2",title:"test-service-title2",entity:[]}],P=[{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]}],s=O(),{inputs:d}=s.pages;g(d);const{services:q}=d;g(q);const o={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:d.title,services:W,table:p}}}}},a={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{services:[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]}],groupsMenu:P,title:"",table:p}}}}},h=[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]},{name:"test-service-hide-cloud-name1",title:"test-service-hide-cloud-title1",subTitle:"test-service-hide-cloud-subTitle1",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-cloud-name2",title:"test-service-hide-cloud-title2",subTitle:"test-service-hide-cloud-subTitle2",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-enterprise-name1",title:"test-service-hide-enterprise-title1",subTitle:"test-service-hide-enterprise-subTitle1",entity:[],hideForPlatform:"enterprise"},{name:"test-service-hide-enterprise-name2",title:"test-service-hide-enterprise-title2",subTitle:"test-service-hide-enterprise-subTitle2",entity:[],hideForPlatform:"enterprise"}],y=[{groupName:"test-service-hide-cloud-name1",groupTitle:"test-service-hide-cloud-title1"},{groupName:"test-service-hide-enterprise-name1",groupTitle:"test-service-hide-enterprise-title1"},{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]},{groupName:"test-group-hide-for-platform",groupTitle:"test-group hide for platform",groupServices:["test-service-hide-enterprise-name2","test-service-hide-cloud-name2"]}],u={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r),await t.findByRole("menuitem",{name:"test-group-title1"})}},c={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r);const T=await t.findByRole("menuitem",{name:"test-group hide for platform"});await i.click(T),await M(()=>!t.queryByRole("menuitem",{name:"test-group hide for platform"}))}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const ve=["Base","WithSubMenu","WithOpenedMenu","WithOpenedSubMenu"];export{o as Base,u as WithOpenedMenu,c as WithOpenedSubMenu,a as WithSubMenu,ve as __namedExportsOrder,de as default};
