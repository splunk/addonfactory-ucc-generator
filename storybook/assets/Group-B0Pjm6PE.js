import{j as e}from"./jsx-runtime-ClejQJRV.js";import{q as o}from"./Clickable-wzamu0qE.js";import{C as p}from"./CollapsiblePanel-BPnrRfFA.js";import{v as n}from"./variables-BlEdyhR1.js";const d=o.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`,l=o(p)`
    span {
        button {
            background-color: ${n.neutral100};
            font-size: 14px;

            &:hover:not([disabled]),
            &:focus:not([disabled]),
            &:active:not([disabled]) {
                background-color: ${n.neutral300};
                box-shadow: none;
            }
        }
    }
`,c=o.div`
    padding-top: 8px;
    padding-bottom: 8px;
`,x=o.div`
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background-color: ${n.neutral100};
    font-size: 14px;
    margin-bottom: 10px;
`,u=o.span`
    padding-right: 20px;
    margin-left: 10px;
    font-size: 12px;
    min-width: 35px;
`;function m({isExpandable:t,defaultOpen:a,children:i,title:r,description:s}){return e.jsx(d,{children:t?e.jsx(l,{title:r,defaultOpen:a,description:s,children:e.jsx(c,{children:i})}):e.jsxs(e.Fragment,{children:[e.jsxs(x,{children:[e.jsx("span",{children:r}),e.jsx(u,{children:s})]}),e.jsx("div",{children:i})]})})}m.__docgenInfo={description:"",methods:[],displayName:"Group",props:{title:{required:!0,tsType:{name:"ReactNode"},description:""},description:{required:!1,tsType:{name:"string"},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:""},isExpandable:{required:!1,tsType:{name:"boolean"},description:""},defaultOpen:{required:!1,tsType:{name:"boolean"},description:""}}};export{m as G};
