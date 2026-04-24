import{j as e,q as o,v as n}from"./iframe-dpjTMnOC.js";import{C as d}from"./CollapsiblePanel-DVzU4Rpc.js";const p=o.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`,l=o(d)`
    span {
        button {
            background-color: ${n.neutral200};
            font-size: 14px;

            &:hover:not([disabled]),
            &:focus:not([disabled]),
            &:active:not([disabled]) {
                background-color: ${n.neutral300};
                box-shadow: none;
            }
        }
    }
    div[data-test='body'] > div {
        padding: ${n.spacingMedium} 0px;
    }
    background-color: transparent;
`,c=o.div`
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background-color: ${n.neutral200};
    &:hover:not([disabled]) {
        background-color: ${n.neutral300};
    }
    font-size: 14px;
    margin-bottom: 10px;
`,u=o.span`
    padding-right: 20px;
    margin-left: 10px;
    font-size: 12px;
    min-width: 35px;
`;function x({isExpandable:i,defaultOpen:t,children:r,title:a,description:s}){return e.jsx(p,{children:i?e.jsx(l,{title:a,defaultOpen:t,description:s,children:r}):e.jsxs(e.Fragment,{children:[e.jsxs(c,{children:[e.jsx("span",{children:a}),e.jsx(u,{children:s})]}),e.jsx("div",{children:r})]})})}x.__docgenInfo={description:"",methods:[],displayName:"Group",props:{title:{required:!0,tsType:{name:"ReactNode"},description:""},description:{required:!1,tsType:{name:"string"},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:""},isExpandable:{required:!1,tsType:{name:"boolean"},description:""},defaultOpen:{required:!1,tsType:{name:"boolean"},description:""}}};export{x as G};
