import{r as v,j as m,P as M}from"./iframe-dpjTMnOC.js";import{M as w}from"./MenuInput-BI12IA6H.js";import{s as O,i as g}from"./util-DakudGGz.js";import{g as S}from"./globalConfigMock-BVxEarns.js";import"./index-nuYtCEEu.js";import"./index-BcW2T4We.js";import"./Menu-CnrFscFf.js";import"./Dropdown-BSmjb7Ht.js";import"./Popover-D3MLdcR2.js";import"./ScrollContainerContext-DogtmX69.js";import"./Box-DE7m460s.js";import"./id-Db1E8M8a.js";import"./ChevronRight-CAKwgwce.js";import"./Menu-BaV4-Toi.js";import"./Divider-BI7HZr8y.js";import"./ChevronLeft-0NIlqeDI.js";import"./messageUtil-DTEwCut0.js";import"./pageContext-DllO6PNg.js";import"./UCCButton-DTXqduNc.js";const{fn:l,userEvent:R,waitFor:C,within:b}=__STORYBOOK_MODULE_TEST__;function k(e){const[n,t]=v.useState(!1);return v.useEffect(()=>{O(e.config),t(!0)},[e.config]),n?m.jsx(M,{platform:"enterprise",children:m.jsx(w,{handleRequestOpen:e.handleRequestOpen})}):m.jsx("span",{children:"loading"})}function f(e){const n=b(e),t=e.parentElement;g(t);const i=b(t),r=R.setup();return{canvas:n,body:i,user:r}}const V={component:k,title:"MenuInput"},p={actions:[],header:[{field:"",label:""}]},W=[{name:"test-service-name1",title:"test-service-title1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",entity:[]},{name:"test-service-name2",title:"test-service-title2",entity:[]}],B=[{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]}],s=S(),{inputs:d}=s.pages;g(d);const{services:P}=d;g(P);const a={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:d.title,services:W,table:p}}}}},o={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{services:[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]}],groupsMenu:B,title:"",table:p}}}}},h=[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]},{name:"test-service-hide-cloud-name1",title:"test-service-hide-cloud-title1",subTitle:"test-service-hide-cloud-subTitle1",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-cloud-name2",title:"test-service-hide-cloud-title2",subTitle:"test-service-hide-cloud-subTitle2",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-enterprise-name1",title:"test-service-hide-enterprise-title1",subTitle:"test-service-hide-enterprise-subTitle1",entity:[],hideForPlatform:"enterprise"},{name:"test-service-hide-enterprise-name2",title:"test-service-hide-enterprise-title2",subTitle:"test-service-hide-enterprise-subTitle2",entity:[],hideForPlatform:"enterprise"}],y=[{groupName:"test-service-hide-cloud-name1",groupTitle:"test-service-hide-cloud-title1"},{groupName:"test-service-hide-enterprise-name1",groupTitle:"test-service-hide-enterprise-title1"},{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]},{groupName:"test-group-hide-for-platform",groupTitle:"test-group hide for platform",groupServices:["test-service-hide-enterprise-name2","test-service-hide-cloud-name2"]}],u={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r),await t.findByRole("menuitem",{name:"test-group-title1"})}},c={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r);const T=await t.findByRole("menuitem",{name:"test-group hide for platform"});await i.click(T),await C(()=>!t.queryByRole("menuitem",{name:"test-group hide for platform"}))}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const X=["Base","WithSubMenu","WithOpenedMenu","WithOpenedSubMenu"];export{a as Base,u as WithOpenedMenu,c as WithOpenedSubMenu,o as WithSubMenu,X as __namedExportsOrder,V as default};
