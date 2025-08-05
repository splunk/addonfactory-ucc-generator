import{j as a}from"./jsx-runtime-D55GQ3BV.js";import{r as u}from"./index-CtTTUaxh.js";import{a as O,C}from"./modes-C8SQrryx.js";import{B as j}from"./Button-CSLC7xhu.js";import{q as m,M as $}from"./_arrayIncludesWith-Cf8RQZ1L.js";import{C as D}from"./CollapsiblePanel-BLdGK9UY.js";import{v as c}from"./variables-BqwaEspd.js";import{p as g}from"./pick-Bf73G4N4.js";import{S}from"./Switch-SM58S-Wg.js";function A(e){return"label"in e}function G({groups:e,rows:n}){const t=new Map;return n.reduce((r,o)=>{const l=e?.find(d=>d.fields.includes(o.field));if(!l)return r.push(o),r;let s=t.get(l.label);return s?s.rows.push(o):(s={...l,rows:[o]},t.set(l.label,s),r.push(s)),r},[])}function T(e,n){const t=new Map(e),r="allRows"in n&&n.allRows||"groupFields"in n&&n.groupFields||"field"in n&&[n.field]||[];let o=!1;return r.forEach(l=>{e.get(l)?.checkbox!==n.checkbox&&(o=!0,t.set(l,{checkbox:n.checkbox}))}),o?t:e}function N(e,n){let t=0;return e.rows.forEach(r=>{n.get(r.field)?.checkbox&&(t+=1)}),t}function I(e){const n=new Map;return e.forEach(t=>{const r=t.checkbox?.defaultValue;typeof r=="boolean"&&n.set(t.field,{checkbox:r})}),n}const V=$`
    align-self: center;
    background-color: ${g({enterprise:c.neutral100})};
`,L=m.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`,P=m(D)`
    & > *:not(:last-child) {
        // expander
        [data-test='toggle'] {
            background-color: ${g({enterprise:c.neutral300})};
        }
        // checkbox
        [data-test='button'] {
            ${V}
        }
        margin-bottom: ${c.spacingXSmall};
        background-color: ${g({enterprise:c.neutral300,prisma:c.neutral200})};
        display: flex;
        align-items: center;
        // for prisma styling
        & > span {
            align-content: center;
        }
    }
`,W=m.div`
    margin: 0 0 ${c.spacingSmall}
        ${g({enterprise:"30px",prisma:"53px"})};
`,z=m.div`
    display: flex;
    justify-content: space-between;
    padding: 6px ${c.spacingSmall};
    background-color: ${g({enterprise:c.neutral300,prisma:c.neutral200})};

    button {
        ${V}
    }
`,R=g({enterprise:c.textColor,prisma:c.contentColorActive}),B=m.div`
    font-size: ${c.fontSizeSmall};
    text-align: right;
    align-content: center;
    flex-shrink: 0;
    color: ${R};
`,M=m(S)`
    color: ${R};
    flex-shrink: 1;
`;function _(e){const{field:n,label:t,checkbox:r,disabled:o,handleChange:l}=e,s=(d,b)=>{l({field:n,checkbox:!b.selected})};return a.jsx(M,{"aria-label":`${t} checkbox`,"data-test-field":n,selected:r,onClick:s,appearance:"checkbox",disabled:o,children:t})}_.__docgenInfo={description:"",methods:[],displayName:"CheckboxRow",props:{field:{required:!0,tsType:{name:"string"},description:""},label:{required:!0,tsType:{name:"string"},description:""},checkbox:{required:!0,tsType:{name:"boolean"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:""},handleChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: { field: string; checkbox: boolean }) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:"{ field: string; checkbox: boolean }",signature:{properties:[{key:"field",value:{name:"string",required:!0}},{key:"checkbox",value:{name:"boolean",required:!0}}]}},name:"value"}],return:{name:"void"}}},description:""}}};function q({row:e,values:n,handleRowChange:t,disabled:r}){const o=n.get(e.field);return a.jsx(_,{field:e.field,label:e.checkbox?.label||e.field,checkbox:!!o?.checkbox,handleChange:t,disabled:r})}q.__docgenInfo={description:"",methods:[],displayName:"CheckboxRowWrapper",props:{row:{required:!0,tsType:{name:"Row"},description:""},values:{required:!0,tsType:{name:"Map",elements:[{name:"string"},{name:"signature",type:"object",raw:`{
    checkbox: boolean;
    error?: string;
}`,signature:{properties:[{key:"checkbox",value:{name:"boolean",required:!0}},{key:"error",value:{name:"string",required:!1}}]}}],raw:"Map<Field, Value>"},description:""},handleRowChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(newValue: { field: string; checkbox: boolean; text?: string }) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:"{ field: string; checkbox: boolean; text?: string }",signature:{properties:[{key:"field",value:{name:"string",required:!0}},{key:"checkbox",value:{name:"boolean",required:!0}},{key:"text",value:{name:"string",required:!1}}]}},name:"newValue"}],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:""}}};const F=({group:e,values:n,handleRowChange:t,disabled:r,handleParentCheckboxForGroup:o})=>{const[l,s]=u.useState(e.options?.expand),d=u.useMemo(()=>e.rows.every(i=>n.get(i.field)?.checkbox),[e.rows,n]),b=u.useMemo(()=>N(e,n),[e,n]);u.useEffect(()=>{s(e.options?.expand)},[e.options?.expand,e.rows]);const f=()=>s(i=>!i),h=a.jsx(M,{"aria-label":`Toggle for ${e.label}`,selected:d,onClick:()=>o(e.label,!d),appearance:"checkbox",disabled:r,children:e.label}),w=a.jsx(W,{children:e.rows.map(i=>a.jsx(q,{disabled:r,row:i,values:n,handleRowChange:t},`row_${i.field}`))}),x=a.jsxs(B,{children:[b," of ",e.rows.length]});return a.jsx(L,{children:e.options?.isExpandable?a.jsx(P,{open:l,onChange:f,title:h,actions:x,children:w}):a.jsxs(a.Fragment,{children:[a.jsxs(z,{children:[h,x]}),w]})})};F.__docgenInfo={description:"",methods:[],displayName:"CheckboxSubTree",props:{group:{required:!0,tsType:{name:"intersection",raw:"Group & { rows: Row[] }",elements:[{name:"Group"},{name:"signature",type:"object",raw:"{ rows: Row[] }",signature:{properties:[{key:"rows",value:{name:"Array",elements:[{name:"Row"}],raw:"Row[]",required:!0}}]}}]},description:""},values:{required:!0,tsType:{name:"Map",elements:[{name:"string"},{name:"signature",type:"object",raw:`{
    checkbox: boolean;
    error?: string;
}`,signature:{properties:[{key:"checkbox",value:{name:"boolean",required:!0}},{key:"error",value:{name:"string",required:!1}}]}}],raw:"Map<Field, Value>"},description:""},handleRowChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(newValue: { field: string; checkbox: boolean; text?: string }) => void",signature:{arguments:[{type:{name:"signature",type:"object",raw:"{ field: string; checkbox: boolean; text?: string }",signature:{properties:[{key:"field",value:{name:"string",required:!0}},{key:"checkbox",value:{name:"boolean",required:!0}},{key:"text",value:{name:"string",required:!1}}]}},name:"newValue"}],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:""},handleParentCheckboxForGroup:{required:!0,tsType:{name:"signature",type:"function",raw:"(groupLabel: string, newCheckboxValue: boolean) => void",signature:{arguments:[{type:{name:"string"},name:"groupLabel"},{type:{name:"boolean"},name:"newCheckboxValue"}],return:{name:"void"}}},description:""}}};function H(e,n=","){return e?new Map(e.split(n).map(t=>[t.trim(),{checkbox:!0}])):new Map}function v(e,n=","){return Array.from(e.entries()).filter(([,t])=>t.checkbox).map(([t])=>`${t}`).join(n)}const U=m.div`
    width: 100%;
`;function X(e){const{field:n,handleChange:t,controlOptions:r,disabled:o}=e,l=u.useMemo(()=>G(r),[r]),s=u.useMemo(()=>e.mode===O&&(e.value===null||e.value===void 0),[e.mode,e.value]),d=u.useMemo(()=>s?I(r.rows):H(e.value,r?.delimiter),[s,r.rows,e.value]),[b,f]=u.useState(d);u.useEffect(()=>{s&&t(n,v(d,r?.delimiter),"checkboxTree")},[n,t,s,d,r?.delimiter]);const h=u.useCallback(i=>{f(k=>{const p=T(k,i);return t(n,v(p,r?.delimiter),"checkboxTree"),p})},[r?.delimiter,n,t]),w=u.useCallback((i,k)=>{if(!r?.groups)return;const p=r.groups.find(y=>y.label===i);p&&f(y=>{const E=T(y,{groupFields:p.fields,checkbox:k});return t(n,v(E,r?.delimiter),"checkboxTree"),E})},[r?.delimiter,r.groups,n,t]),x=u.useCallback(i=>{o!==!0&&f(k=>{const p=T(k,{allRows:r.rows.map(y=>y.field),checkbox:i});return t(n,v(p,r?.delimiter),"checkboxTree"),p})},[r?.delimiter,r.rows,o,n,t]);return a.jsxs(U,{children:[a.jsxs(C,{gutter:5,children:[l.map(i=>i&&A(i)?a.jsx(C.Row,{children:a.jsx(F,{group:i,values:b,handleRowChange:h,disabled:o,handleParentCheckboxForGroup:w})},`group_${i.label}`):i&&a.jsx(C.Row,{children:a.jsx(q,{row:i,values:b,handleRowChange:h,disabled:o})},`row_${i.field}`)),a.jsx(C.Row,{})]}),a.jsxs("div",{children:[a.jsx(j,{label:"Select All",appearance:"subtle",onClick:()=>x(!0)}),a.jsx(j,{label:"Clear All",appearance:"subtle",onClick:()=>x(!1)})]})]})}X.__docgenInfo={description:"",methods:[],displayName:"CheckboxTree",props:{field:{required:!0,tsType:{name:"string"},description:""},value:{required:!1,tsType:{name:"string"},description:""},controlOptions:{required:!0,tsType:{name:"signature",type:"object",raw:`{
    delimiter?: string;
    groups?: Group[];
    rows: Row[];
}`,signature:{properties:[{key:"delimiter",value:{name:"string",required:!1}},{key:"groups",value:{name:"Array",elements:[{name:"Group"}],raw:"Group[]",required:!1}},{key:"rows",value:{name:"Array",elements:[{name:"Row"}],raw:"Row[]",required:!0}}]}},description:""},mode:{required:!0,tsType:{name:"union",raw:`| typeof MODE_CLONE
| typeof MODE_CREATE
| typeof MODE_DELETE
| typeof MODE_EDIT
| typeof MODE_CONFIG`,elements:[{name:"MODE_CLONE"},{name:"MODE_CREATE"},{name:"MODE_DELETE"},{name:"MODE_EDIT"},{name:"MODE_CONFIG"}]},description:""},addCustomValidator:{required:!1,tsType:{name:"signature",type:"function",raw:"(field: string, validator: CustomValidatorFunc) => void",signature:{arguments:[{type:{name:"string"},name:"field"},{type:{name:"signature",type:"function",raw:`(
    submittedField: string,
    submittedValue: AcceptableFormValueOrNullish
) => string | boolean | undefined`,signature:{arguments:[{type:{name:"string"},name:"submittedField"},{type:{name:"union",raw:"AcceptableFormValueOrNull | undefined",elements:[{name:"union",raw:"AcceptableFormValue | null",elements:[{name:"union",raw:"string | number | boolean | { fileContent?: string }",elements:[{name:"string"},{name:"number"},{name:"boolean"},{name:"signature",type:"object",raw:"{ fileContent?: string }",signature:{properties:[{key:"fileContent",value:{name:"string",required:!1}}]}}]},{name:"null"}]},{name:"undefined"}]},name:"submittedValue"}],return:{name:"union",raw:"string | boolean | undefined",elements:[{name:"string"},{name:"boolean"},{name:"undefined"}]}}},name:"validator"}],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:""},label:{required:!0,tsType:{name:"string"},description:""},handleChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(field: string, value: string, componentType: 'checkboxTree') => void",signature:{arguments:[{type:{name:"string"},name:"field"},{type:{name:"string"},name:"value"},{type:{name:"literal",value:"'checkboxTree'"},name:"componentType"}],return:{name:"void"}}},description:""}}};export{X as C};
