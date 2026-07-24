import{r as v,j as m,P as M}from"./iframe-CkO-8h3X.js";import{M as w}from"./MenuInput-DxycPOdt.js";import{s as O,i as g}from"./util-DhnbgUjE.js";import{g as S}from"./globalConfigMock-C68BzUr-.js";import"./preload-helper-BWMXw09x.js";import"./index-D-HgIHUW.js";import"./Menu-BAonAjFZ.js";import"./Dropdown-DdfZSMfv.js";import"./Popover-CCWJKSFR.js";import"./_arrayIncludesWith-CKt2KOEb.js";import"./includes-CeWRCqDz.js";import"./ScrollContainerContext-B3z9T_lz.js";import"./Box-C3_NwA3u.js";import"./lodash-DC5tP0FI.js";import"./_baseIteratee-CKKdKeVM.js";import"./_baseIsEqual-BA1SpDro.js";import"./ChevronRight-DlBO1xqA.js";import"./isEqual-D_kYa9Y5.js";import"./Menu-Bq9H8ILd.js";import"./Divider-CkbYBkxJ.js";import"./ChevronLeft-CFN5hHG6.js";import"./messageUtil-CjQtoyHX.js";import"./pageContext-DllO6PNg.js";import"./UCCButton-Bug0tiA6.js";const{fn:l,userEvent:R,waitFor:C,within:b}=__STORYBOOK_MODULE_TEST__;function k(e){const[n,t]=v.useState(!1);return v.useEffect(()=>{O(e.config),t(!0)},[e.config]),n?m.jsx(M,{platform:"enterprise",children:m.jsx(w,{handleRequestOpen:e.handleRequestOpen})}):m.jsx("span",{children:"loading"})}function f(e){const n=b(e),t=e.parentElement;g(t);const i=b(t),r=R.setup();return{canvas:n,body:i,user:r}}const te={component:k,title:"MenuInput"},p={actions:[],header:[{field:"",label:""}]},W=[{name:"test-service-name1",title:"test-service-title1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",entity:[]},{name:"test-service-name2",title:"test-service-title2",entity:[]}],B=[{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]}],s=S(),{inputs:d}=s.pages;g(d);const{services:P}=d;g(P);const o={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:d.title,services:W,table:p}}}}},a={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{services:[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]}],groupsMenu:B,title:"",table:p}}}}},h=[{name:"test-service-name1",title:"test-service-title1",subTitle:"test-service-subTitle1",entity:[]},{name:"test-subservice1-name1",title:"test-subservice1-title1",subTitle:"test-subservice-subTitle1",entity:[]},{name:"test-subservice1-name2",title:"test-subservice1-title2",subTitle:"test-subservice-subTitle2",entity:[]},{name:"test-service-name2",title:"test-service-title2",subTitle:"test-service-subTitle2",entity:[]},{name:"test-service-hide-cloud-name1",title:"test-service-hide-cloud-title1",subTitle:"test-service-hide-cloud-subTitle1",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-cloud-name2",title:"test-service-hide-cloud-title2",subTitle:"test-service-hide-cloud-subTitle2",entity:[],hideForPlatform:"cloud"},{name:"test-service-hide-enterprise-name1",title:"test-service-hide-enterprise-title1",subTitle:"test-service-hide-enterprise-subTitle1",entity:[],hideForPlatform:"enterprise"},{name:"test-service-hide-enterprise-name2",title:"test-service-hide-enterprise-title2",subTitle:"test-service-hide-enterprise-subTitle2",entity:[],hideForPlatform:"enterprise"}],y=[{groupName:"test-service-hide-cloud-name1",groupTitle:"test-service-hide-cloud-title1"},{groupName:"test-service-hide-enterprise-name1",groupTitle:"test-service-hide-enterprise-title1"},{groupName:"test-group-name1",groupTitle:"test-group-title1",groupServices:["test-subservice1-name1","test-subservice1-name2"]},{groupName:"test-group-name2",groupTitle:"test-group-title2",groupServices:["test-service-name2","test-service-name1"]},{groupName:"test-group-hide-for-platform",groupTitle:"test-group hide for platform",groupServices:["test-service-hide-enterprise-name2","test-service-hide-cloud-name2"]}],u={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r),await t.findByRole("menuitem",{name:"test-group-title1"})}},c={args:{handleRequestOpen:l(),config:{...s,pages:{...s.pages,inputs:{title:"WithOpenedSubMenu",services:h,groupsMenu:y,table:p}}}},play:async({canvasElement:e})=>{const{canvas:n,body:t,user:i}=f(e),r=await n.findByRole("button",{name:"Create New Input"});await i.click(r);const T=await t.findByRole("menuitem",{name:"test-group hide for platform"});await i.click(T),await C(()=>!t.queryByRole("menuitem",{name:"test-group hide for platform"}))}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const se=["Base","WithSubMenu","WithOpenedMenu","WithOpenedSubMenu"];export{o as Base,u as WithOpenedMenu,c as WithOpenedSubMenu,a as WithSubMenu,se as __namedExportsOrder,te as default};
