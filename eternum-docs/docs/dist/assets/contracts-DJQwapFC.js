import{d as r,j as s}from"./index-Ca64bMZ6.js";const a={title:"Contracts",description:"undefined"};function l(e){const i={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...r(),...e.components};return s.jsxs(s.Fragment,{children:[s.jsx(i.header,{children:s.jsxs(i.h1,{id:"contracts",children:["Contracts",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#contracts",children:s.jsx(i.div,{"data-autolink-icon":!0})})]})}),`
`,s.jsxs(i.h2,{id:"rules-of-thumb",children:["Rules of thumb",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#rules-of-thumb",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Note that every field you add in a model will raise the storage cost of each transaction that modifies the model."}),`
`,s.jsx(i.li,{children:`Try to make models as small as possible, and re-use existing models as much as possible, every model and system that
you add raises the size of the CASM, and there is a limit to the size of a declared contract on Starknet.`}),`
`,s.jsx(i.li,{children:"Keep systems stateless. Store your game state in models."}),`
`,s.jsx(i.li,{children:`When implementing a new game logic, you will need to keep in mind that the game already has physics implemented, such
as weight, position, movement, speed, etc. If creating something that needs to have any of this logic, re-use
components so everything stays logical.`}),`
`]}),`
`,s.jsxs(i.h2,{id:"models",children:["Models",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#models",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(i.h3,{id:"keys",children:["Keys",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#keys",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(i.p,{children:["Use the ",s.jsx(i.code,{children:"ID"})," type alias for keys that require a unique identifier."]}),`
`,s.jsxs(i.h3,{id:"model-design",children:["Model design",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#model-design",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(i.p,{children:"entity_id: u32"}),`
`,s.jsxs(i.h3,{id:"implementations",children:["Implementations",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#implementations",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(i.p,{children:"Where possible make traits for the models so they are stateless for unit testing."}),`
`,s.jsx(i.p,{children:"Always use generate trait where possible to minimise code."}),`
`,s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsx(i.code,{children:s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[generate_trait]"})})})}),`
`,s.jsxs(i.h3,{id:"adding-a-model",children:["Adding a model",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#adding-a-model",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[derive("}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Copy"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Drop"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Serde"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:")]"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[dojo"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"model]"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"pub"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" struct"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" Structure"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    #[key]"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    entity_id"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" ID"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    category"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" StructureCategory"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    created_at"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" u64"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}"})})]})}),`
`,s.jsxs(i.p,{children:["To test this model, you need to add it to the ",s.jsx(i.code,{children:"contracts/src/utils/testing/world.cairo"}),` file so it can be instantiated
in the tests.`]}),`
`,s.jsxs(i.h2,{id:"event-models",children:["Event models",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#event-models",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(i.p,{children:`If you need some data to be available in the client, but it doesn't need to be stored onchain, you can use an event
model.`}),`
`,s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[derive("}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Introspect"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Copy"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Drop"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Serde"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:")]"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[dojo"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"event]"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[dojo"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"model]"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"pub"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" struct"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" ExampleEvent"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    #[key]"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    id"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" ID"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    #[key]"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    event_id"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" EventType"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"	my_data_field"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" u8"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}"})})]})}),`
`,s.jsxs(i.h2,{id:"adding-a-system",children:["Adding a system",s.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#adding-a-system",children:s.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(i.p,{children:"Design systems like this in the directory"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["SystemName",`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"system_name.cairo"}),`
`,s.jsx(i.li,{children:"tests.cairo"}),`
`]}),`
`]}),`
`]}),`
`,s.jsxs(i.p,{children:[s.jsx(i.code,{children:"system.cairo"})," should include the implementation of the system like this."]}),`
`,s.jsx(i.p,{children:"Things to note:"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Interface at top of File"}),`
`,s.jsxs(i.li,{children:["use of ",s.jsx(i.code,{children:"super::IBuildingContract"})," to minimise imports and make it clear where the interface is defined."]}),`
`]}),`
`,s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[dojo"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"interface]"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"trait"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" IBuildingContract"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"<"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"TContractState"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"> {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"    fn"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:" create"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"        entity_id"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" ID"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"        building_coord"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" s0_eternum"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"models"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"position"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Coord"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"        building_category"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" s0_eternum"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"models"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"buildings"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"BuildingCategory"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"        produce_resource_type"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" Option"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"<"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"u8"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:">"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    );"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}"})}),`
`,s.jsx(i.span,{className:"line","data-empty-line":!0,children:" "}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"#[dojo"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"contract]"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"mod"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" building_systems"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"    use"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" s0_eternum"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"alias"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"ID"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"    use"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" s0_eternum"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"models"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"{"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"        resources"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"{"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Resource"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"ResourceCost"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}, "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"owner"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Owner"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"hyperstructure"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"HyperStructure"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"        order"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Orders"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"position"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"{"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Coord"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Position"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"PositionTrait"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Direction"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"},"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"        buildings"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"{"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"BuildingCategory"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Building"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"BuildingImpl"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"},"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"        production"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"{"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Production"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"ProductionRateTrait"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}, "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"realm"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"{"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"Realm"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:", "}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"RealmImpl"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    };"})}),`
`,s.jsx(i.span,{className:"line","data-empty-line":!0,children:" "}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    #[abi(embed_v0)]"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"    impl"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" BuildingContractImpl"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" of "}),s.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:"super"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"::"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"IBuildingContract"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"<"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"ContractState"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"> {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"        fn"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:" create"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"            world"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" IWorldDispatcher"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"            entity_id"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" ID"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"            building_coord"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" Coord"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"            building_category"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" BuildingCategory"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"            produce_resource_type"}),s.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" Option"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"<"}),s.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:"u8"}),s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:">,"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"        ) {"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"        }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}"})})]})}),`
`,s.jsxs(i.p,{children:["To test this system, you need to add it to the ",s.jsx(i.code,{children:"contracts/src/utils/testing/world.cairo"}),` file so it can be instantiated
in the tests.`]})]})}function d(e={}){const{wrapper:i}={...r(),...e.components};return i?s.jsx(i,{...e,children:s.jsx(l,{...e})}):l(e)}export{d as default,a as frontmatter};
