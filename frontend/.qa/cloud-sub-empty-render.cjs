const fs=require('node:fs'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=(p,map={})=>{let m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText)(id=>id in map?(id.endsWith('.css')?{default:map[id]}:id==='next/link'?{default:map[id]}:map[id]):require(id),m,m.exports);return m.exports};
const pages=load('src/content/cloud-sub-services/pages.ts'),sections=load('src/content/cloud-sub-services/sections.ts');
const css=new Proxy({},{get:(_,key)=>String(key)}),none=()=>null;
const imports={
 'next/link':({href,children,...rest})=>React.createElement('a',{href,...rest},children),
 '@/components/ui/container':{Container:({children,...props})=>React.createElement('div',props,children)},
 '@/components/ui/scroll-reveals':{ScrollReveals:none},
 '@/components/pages/service-pillar-sections':{ServicePillarApproach:none},'@/components/pages/service-tools':{ServiceTools:none},'@/components/pages/service-case-study-gallery':{ServiceCaseStudyGallery:none},'@/components/pages/related-blog-card':{RelatedBlogCard:none},'@/components/pages/faq-content':{FaqContent:none},'@/components/sections/home/contact-cta':{ContactCta:none},
 '@/content/cloud-sub-services/pages':pages,'@/content/cloud-sub-services/sections':sections,
 '@/content/cloud-sub-services/references':{getCloudReferences:async()=>({}),resolveCloudReferenceSections:()=>({studies:[],insights:[],studiesState:'empty',insightsState:'empty'})},
 '@/content/cloud-sub-services/seo':{cloudSubStructuredData:()=>({})},'./hero':{CloudSubHero:none},'./draft-sections':{DraftCardSection:none,DraftArchitectureDiagram:none,DraftToolLinks:none},
 '@/app/(marketing)/services/data/page.module.css':css,'@/app/(marketing)/services/cloud/page.module.css':css,'@/app/(marketing)/case-studies/page.module.css':css,'./service-sub.module.css':css
};
(async()=>{const {CloudSubServicePage}=load('src/components/service-sub/cloud-sub-service-page.tsx',imports);let html=renderToStaticMarkup(await CloudSubServicePage({pageKey:'migration'}));if(!html.includes(sections.cloudReferenceSections.caseStudies.emptyText.replaceAll("'", "&#x27;"))||!html.includes(sections.cloudReferenceSections.insights.emptyText.replaceAll("'", "&#x27;")))throw Error('Missing empty state');fs.writeFileSync('.qa/cloud-sub-empty-render.html',html);console.log('Both empty states render the configured exact text and links.');})();
