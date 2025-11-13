import{j as e}from"./jsx-runtime-1FKYbnEZ.js";import{q as n}from"./omit-CSe7u5nZ.js";import{C as d}from"./CollapsiblePanel-aG-BiLiH.js";import{v as o}from"./variables-BwqdKhvQ.js";const p=n.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`,l=n(d)`
    span {
        button {
            background-color: ${o.neutral200};
            font-size: 14px;

            &:hover:not([disabled]),
            &:focus:not([disabled]),
            &:active:not([disabled]) {
                background-color: ${o.neutral300};
                box-shadow: none;
            }
        }
    }
    div[data-test='body'] > div {
        padding: ${o.spacingMedium} 0px;
    }
    background-color: transparent;
`,c=n.div`
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background-color: ${o.neutral200};
    &:hover:not([disabled]) {
        background-color: ${o.neutral300};
    }
    font-size: 14px;
    margin-bottom: 10px;
`,u=n.span`
    padding-right: 20px;
    margin-left: 10px;
    font-size: 12px;
    min-width: 35px;
`;function x({isExpandable:s,defaultOpen:t,children:r,title:i,description:a}){return e.jsx(p,{children:s?e.jsx(l,{title:i,defaultOpen:t,description:a,children:r}):e.jsxs(e.Fragment,{children:[e.jsxs(c,{children:[e.jsx("span",{children:i}),e.jsx(u,{children:a})]}),e.jsx("div",{children:r})]})})}x.__docgenInfo={description:"",methods:[],displayName:"Group",props:{title:{required:!0,tsType:{name:"ReactNode"},description:""},description:{required:!1,tsType:{name:"string"},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:""},isExpandable:{required:!1,tsType:{name:"boolean"},description:""},defaultOpen:{required:!1,tsType:{name:"boolean"},description:""}}};export{x as G};
