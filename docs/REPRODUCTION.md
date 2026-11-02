# PayClear: reproduction of the live run

Contract on GenLayer Studio: [`0x42E002dc4360752C37408F6755c6E0f94716dBfc`](https://explorer-studio.genlayer.com/address/0x42E002dc4360752C37408F6755c6E0f94716dBfc) (source: `contracts/pay_clear.py`, checked
byte-identical with `node scripts/verify-code.mjs 0x42E002dc4360752C37408F6755c6E0f94716dBfc`).

`scripts/demo.mjs` funded a **demo program** with test wallets and audited **real employers' public job boards** on Greenhouse and Ashby.
Every step is real validator consensus: each validator read the board, placed every posting in code (12 US jurisdictions with
pay-in-posting laws, plus US-remote jobs under Colorado's), read listed pay in code, and read the pay passages of the rest.

Accounts: sponsor `0x3C8a9dD24Dd2c4A5386D99B0BCa7a239C828c206`, cofunder `0x04a8b6a6eB72977E15040564B70b497D68c881A4`, auditor `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5`, bystander `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe`.

## Audits

| Audit | Employer | Board | Read | In scope | Show pay | No pay shown | Unverified | Unclear | Score | Steps |
|---|---|---|---|---|---|---|---|---|---|---|
| audit_0 | [Figma](https://job-boards.greenhouse.io/figma) | greenhouse | 140 | 94 | 93 | **1** | 0 | 0 | 98.9% | 6 |
| audit_1 | [supabase](https://jobs.ashbyhq.com/supabase) | ashby | 68 | 5 | 1 | **4** | 0 | 0 | 20.0% | 3 |
| audit_2 | [linear](https://jobs.ashbyhq.com/linear) | ashby | 31 | 17 | 0 | **17** | 0 | 0 | 0.0% | 2 |
| audit_3 | [Airtable](https://job-boards.greenhouse.io/airtable) | greenhouse | 5 | 4 | 4 | **0** | 0 | 0 | 100.0% | 1 |
| audit_4 | [Asana](https://job-boards.greenhouse.io/asana) | greenhouse | 110 | 47 | 47 | **0** | 0 | 0 | 100.0% | 5 |

The score is postings that show pay out of those whose page could be checked (unverified and unclear postings are left out).

## Postings with no pay shown

| Audit | Employer | Posting | Location | Jurisdictions | Note |
|---|---|---|---|---|---|
| audit_0 | Figma | [Brand Designer, Web](https://boards.greenhouse.io/figma/jobs/6216211004?gh_jid=6216211004) | San Francisco, CA • New York, NY • United States | CA NY US-REMOTE | read again, still none |
| audit_1 | supabase | [Video Producer (San Francisco, CA)](https://jobs.ashbyhq.com/supabase/05226c15-0501-4559-833d-3815fdf01f56) | Remote, San Francisco, CA | CA US-REMOTE |  |
| audit_1 | supabase | [Developer Relations Engineer (New York, NY)](https://jobs.ashbyhq.com/supabase/98ae5c78-eab7-4879-b143-96b98e4d0dbb) | Remote, New York, US | NY US-REMOTE |  |
| audit_1 | supabase | [Developer Relations Engineer ](https://jobs.ashbyhq.com/supabase/a1320bbf-bfae-49a8-a1b7-12eeccaf39ca) | Remote, San Francisco, CA | CA US-REMOTE |  |
| audit_1 | supabase | [Member of Technical Staff](https://jobs.ashbyhq.com/supabase/cb04ae3a-3a47-4e21-928f-c2456b7b214e) | Remote, Bay Area, CA / Remote, San Francisco, CA / Remote, AMER | CA US-REMOTE |  |
| audit_2 | linear | [Product Engineer](https://jobs.ashbyhq.com/linear/0c7c2e26-0a98-42cf-a47c-9a3999fb513b) | North America | US-REMOTE |  |
| audit_2 | linear | [Senior / Staff Product Engineer](https://jobs.ashbyhq.com/linear/12f8f208-0b9c-4569-bb3d-41c8a197029e) | North America | US-REMOTE |  |
| audit_2 | linear | [Deal Desk](https://jobs.ashbyhq.com/linear/1aa6f672-5917-49aa-b015-70ebff901923) | North America | US-REMOTE |  |
| audit_2 | linear | [Developer Relations](https://jobs.ashbyhq.com/linear/1d652292-04d9-405c-8101-578efd020e94) | North America / Europe | US-REMOTE |  |
| audit_2 | linear | [Senior / Staff Security Engineer](https://jobs.ashbyhq.com/linear/493579ff-3198-420f-ab6a-b8bb971cb513) | North America | US-REMOTE |  |
| audit_2 | linear | [Field Marketing Manager](https://jobs.ashbyhq.com/linear/4c4f5bf5-0628-4145-b211-eb533edab8d1) | North America | US-REMOTE |  |
| audit_2 | linear | [Senior / Staff Product Designer](https://jobs.ashbyhq.com/linear/a264869e-f058-487c-ab7f-9b77dffa427c) | North America | US-REMOTE |  |
| audit_2 | linear | [Production Designer](https://jobs.ashbyhq.com/linear/b32de590-06ce-47d4-8994-66b936df908d) | North America / Europe | US-REMOTE |  |
| audit_2 | linear | [Senior / Staff Product Engineer, Applied AI](https://jobs.ashbyhq.com/linear/b4a7764e-c680-4bdf-9956-dc78f2ca94d5) | North America | US-REMOTE |  |
| audit_2 | linear | [Product Manager](https://jobs.ashbyhq.com/linear/b7669c4b-eeca-421d-ba9a-d90203f6fcb2) | North America | US-REMOTE |  |
| audit_2 | linear | [Product Marketing Manager](https://jobs.ashbyhq.com/linear/c0abc97e-b4d7-4ad7-bd13-bc40f4023227) | North America | US-REMOTE |  |
| audit_2 | linear | [Account Executive, Startups](https://jobs.ashbyhq.com/linear/c21af93e-210f-4969-8eaa-90fb16a5b720) | North America | US-REMOTE |  |
| audit_2 | linear | [Senior / Staff Fullstack Engineer](https://jobs.ashbyhq.com/linear/cd5ae036-0223-427a-b038-ba16ef9dcb32) | North America | US-REMOTE |  |
| audit_2 | linear | [Product Support Specialist, Pacific/Mountain Time](https://jobs.ashbyhq.com/linear/d062065e-05bb-42ce-a430-ec205695cc2e) | North America | US-REMOTE |  |
| audit_2 | linear | [Mobile Product Designer](https://jobs.ashbyhq.com/linear/eac7f181-d658-4943-9430-51bae2bcd110) | North America | US-REMOTE |  |
| audit_2 | linear | [Creative Producer](https://jobs.ashbyhq.com/linear/f16dd5e9-ed10-4b8e-b5d7-1b8b5e3f002f) | North America / Europe | US-REMOTE |  |
| audit_2 | linear | [Analytics Engineer](https://jobs.ashbyhq.com/linear/f272fc4a-91a7-4dcf-9cb5-3600ebaf14e1) | North America | US-REMOTE |  |

## Every posting in scope

| Audit | Posting id | Title | Jurisdictions | Result | Listed pay |
|---|---|---|---|---|---|
| audit_0 | 5426468004 | Account Executive, Enterprise | CA NY US-REMOTE | pay listed | 165,000-190,000 USD |
| audit_0 | 5551532004 | Software Engineer - Machine Learning | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5551686004 | Software Engineer - Data Infrastructure | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5551730004 | Software Engineer - AI Product | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5552530004 | Software Engineer - C++ | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5552549004 | Software Engineer - Distributed Systems | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5552560004 | Software Engineer - Growth & Monetization | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5552580004 | Data Scientist   | CA NY US-REMOTE | pay listed | 140,000-348,000 USD |
| audit_0 | 5558737004 | Account Executive, Strategic | CA NY US-REMOTE | pay listed | 200,000-200,000 USD |
| audit_0 | 5565447004 | Senior Account Executive, SMB | CA NY US-REMOTE | pay listed | 82,500-82,500 USD |
| audit_0 | 5620034004 | Manager, Strategic Sales | CA NY | pay listed | 155,500-230,500 USD |
| audit_0 | 5651744004 | Researcher, Figma Agentic Experiences | CA NY US-REMOTE | pay listed | 169,000-250,000 USD |
| audit_0 | 5691886004 | Software Engineer - AI Platforms | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5691911004 | Software Engineer - Full Stack | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5694259004 | Account Executive, SMB  | CA NY | pay listed | 70,500-70,500 USD |
| audit_0 | 5707966004 | AI Applied Scientist | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5711595004 | Product Designer, Growth & Monetization | CA NY US-REMOTE | pay listed | 169,000-303,000 USD |
| audit_0 | 5711913004 | Product Designer, AI Models | CA NY US-REMOTE | pay listed | 169,000-303,000 USD |
| audit_0 | 5722244004 | Manager, Software Engineering - Billing | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 5783377004 | Solutions Consultant | CA NY US-REMOTE | pay listed | 152,800-296,000 USD |
| audit_0 | 5790627004 | Software Engineer - Developer Experience | CA NY US-REMOTE | pay listed | 185,000-376,000 USD |
| audit_0 | 5792631004 | Strategic Finance | CA NY US-REMOTE | pay listed | 115,000-245,000 USD |
| audit_0 | 5802956004 | Support Engineer, AI Infrastructure & Tooling | CA NY US-REMOTE | pay listed | 169,000-245,000 USD |
| audit_0 | 5807963004 | Manager, Software Engineering - AI Observability | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 5813967004 | Distribution Partner Manager | CA NY US-REMOTE | pay listed | 140,000-296,000 USD |
| audit_0 | 5829751004 | Security Engineer | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 5969046004 | Executive Assistant, People | CA | pay listed | 127,000-269,000 USD |
| audit_0 | 5989185004 | Product Manager, AI Growth | CA NY US-REMOTE | pay listed | 169,000-303,000 USD |
| audit_0 | 5996930004 | Manager, Enterprise Sales | CA NY US-REMOTE | pay listed | 155,500-230,500 USD |
| audit_0 | 6008343004 | Voice of the Customer Program Manager | CA NY US-REMOTE | pay listed | 127,000-269,000 USD |
| audit_0 | 6008752004 | Manager, Software Engineering - DevEx AI Tools | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 6010279004 | Manager, Software Engineering - Growth Platform  | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 6020719004 | Technical Program Manager - Infrastructure | CA NY US-REMOTE | pay listed | 185,000-317,000 USD |
| audit_0 | 6104919004 | Manager, Product Management - Roundtripping | NY US-REMOTE | pay listed | 204,000-348,000 USD |
| audit_0 | 6111166004 | Solutions Consultant, Payload | CA NY US-REMOTE | pay listed | 152,800-296,000 USD |
| audit_0 | 6112961004 | Strategic Finance, AI Innovation | CA NY US-REMOTE | pay listed | 169,000-245,000 USD |
| audit_0 | 6118332004 | Manager, Distribution Partnerships | CA NY US-REMOTE | pay listed | 185,000-317,000 USD |
| audit_0 | 6119781004 | Product Manager, Acquisition | CA NY US-REMOTE | pay listed | 169,000-303,000 USD |
| audit_0 | 6126976004 | Product Designer, CMS | CA NY US-REMOTE | pay listed | 169,000-303,000 USD |
| audit_0 | 6130865004 | Director, Data Science | CA NY US-REMOTE | pay listed | 290,000-376,000 USD |
| audit_0 | 6135656004 | Manager, Design - Systems & Infrastructure | CA NY US-REMOTE | pay listed | 204,000-348,000 USD |
| audit_0 | 6138981004 | Manager, Software Engineering - AI Infrastructure | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 6143238004 | Software Engineer Intern (Summer 2027) | CA NY | pay listed | 55-55 USD |
| audit_0 | 6150074004 | Executive Communications Manager | CA NY | pay listed | 153,000-269,000 USD |
| audit_0 | 6150563004 | Director, People Partners - Product, Design & Engineering | CA US-REMOTE | pay listed | 235,000-317,000 USD |
| audit_0 | 6158162004 | Forward Deployed Engineer | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 6160732004 | Manager, Product Management - Figma Platform Experience | CA NY US-REMOTE | pay listed | 204,000-348,000 USD |
| audit_0 | 6166608004 | Manager, SMB Sales | CA NY US-REMOTE | pay listed | 102,000-139,000 USD |
| audit_0 | 6173031004 | Immigration Program Manager | CA NY US-REMOTE | pay listed | 127,000-269,000 USD |
| audit_0 | 6174190004 | Early Career, Inside Sales Representative (2027) | CA NY | pay listed | 26-26 USD |
| audit_0 | 6178851004 | Data Engineer Intern (2027) | CA NY | pay listed | 46-46 USD |
| audit_0 | 6178857004 | Data Science Intern (2027) | CA NY | pay listed | 46-46 USD |
| audit_0 | 6180005004 | Product Design Intern (2027) | CA NY | pay listed | 46-46 USD |
| audit_0 | 6180053004 | Early Career, Product Designer (2027) | CA NY | pay listed | 140,000-140,000 USD |
| audit_0 | 6180172004 | Security Scientist | CA NY US-REMOTE | pay listed | 140,000-348,000 USD |
| audit_0 | 6181922004 | Field Engineer | CA NY US-REMOTE | pay listed | 140,000-296,000 USD |
| audit_0 | 6191697004 | Manager, Recruiting - Sales | CA NY US-REMOTE | pay listed | 169,000-245,000 USD |
| audit_0 | 6199185004 | Executive Assistant, Growth Marketing | CA | pay listed | 127,000-269,000 USD |
| audit_0 | 6200626004 | PhD Intern, Data Science (2027) | CA NY | pay listed | 68-68 USD |
| audit_0 | 6201114004 | Director, Product Design - AI & Context | CA NY US-REMOTE | pay listed | 290,000-376,000 USD |
| audit_0 | 6201385004 | HRIS Analyst | CA NY US-REMOTE | pay listed | 140,000-202,000 USD |
| audit_0 | 6201407004 | Data Platform Engineer | CA NY US-REMOTE | pay listed | 153,000-376,000 USD |
| audit_0 | 6204360004 | Researcher - Rapid Research | CA NY US-REMOTE | pay listed | 169,000-250,000 USD |
| audit_0 | 6204556004 | Video Strategist | CA NY US-REMOTE | pay listed | 153,000-269,000 USD |
| audit_0 | 6207801004 | PhD Intern, AI Applied Scientist (2027) | CA NY | pay listed | 74-74 USD |
| audit_0 | 6207950004 | Content Strategist, Product | CA NY US-REMOTE | pay listed | 153,000-221,000 USD |
| audit_0 | 6208862004 | Corporate Communications Manager | CA NY | pay listed | 153,000-269,000 USD |
| audit_0 | 6208999004 | Manager, Tech & Ecosystem Partnerships | CA NY US-REMOTE | pay listed | 185,000-317,000 USD |
| audit_0 | 6211088004 | Director, Governance Risk & Compliance | CA NY US-REMOTE | pay listed | 235,000-317,000 USD |
| audit_0 | 6211910004 | Technical Program Manager - AI Tooling | CA NY US-REMOTE | pay listed | 169,000-245,000 USD |
| audit_0 | 6212642004 | Researcher, Figma Design | CA NY US-REMOTE | pay listed | 169,000-250,000 USD |
| audit_0 | 6215865004 | Business Systems Analyst | CA NY US-REMOTE | pay listed | 105,000-245,000 USD |
| audit_0 | 6216211004 | Brand Designer, Web | CA NY US-REMOTE | no pay shown |  |
| audit_0 | 6217137004 | Senior Order Management Analyst  | CA NY US-REMOTE | pay listed | 50-73 USD |
| audit_0 | 6219995004 | PhD Intern, Software Engineer - Graphics (2027) | CA NY | pay listed | 74-74 USD |
| audit_0 | 6223155004 | Compliance Engineer | CA NY US-REMOTE | pay listed | 169,000-296,000 USD |
| audit_0 | 6223657004 | Manager, Software Engineering - Production Engineering | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 6223693004 | Manager, Solutions Consulting | NY US-REMOTE | pay listed | 185,600-316,800 USD |
| audit_0 | 6224661004 | Manager, Software Engineering - External Platform | NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 6225818004 | Distribution Partner Manager, LATAM | CA NY US-REMOTE | pay listed | 140,000-296,000 USD |
| audit_0 | 6227402004 | Product Builder, AI Insights | CA NY US-REMOTE | pay listed | 169,000-250,000 USD |
| audit_0 | 6228774004 | Product Manager, Figma Pattern Library  | CA NY US-REMOTE | pay listed | 169,000-303,000 USD |
| audit_0 | 6230952004 | Account Executive, Public Sector - State & Local | CA | pay listed | 165,000-190,000 USD |
| audit_0 | 6231027004 | Product Designer, Core Experience | CA NY US-REMOTE | pay listed | 169,000-303,000 USD |
| audit_0 | 6232410004 | Business Systems Architect | CA NY US-REMOTE | pay listed | 140,000-269,000 USD |
| audit_0 | 6232422004 | Manager, Customer Enablement - Figma Weave (New York, United States) | NY | pay listed | 153,000-269,000 USD |
| audit_0 | 6232541004 | Customer Success Manager - Figma Weave (New York, United States) | NY US-REMOTE | pay listed | 127,000-269,000 USD |
| audit_0 | 6233040004 | Data & Integration Engineer, Business Systems | CA NY US-REMOTE | pay listed | 153,000-296,000 USD |
| audit_0 | 6233043004 | AI Engineer, Internal Tools | CA NY US-REMOTE | pay listed | 153,000-296,000 USD |
| audit_0 | 6235005004 | Product Partner Manager, Scaled | CA NY US-REMOTE | pay listed | 115,000-245,000 USD |
| audit_0 | 6235282004 | Manager, Software Engineering - Design Systems Adherence | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 6235320004 | Sales Operations Manager | NY US-REMOTE | pay listed | 140,000-296,000 USD |
| audit_0 | 6237757004 | Manager, Software Engineering - UX Platform | CA NY US-REMOTE | pay listed | 258,000-376,000 USD |
| audit_0 | 6238015004 | PhD Intern, Security Engineer (2027) | CA NY | pay listed | 74-74 USD |
| audit_1 | 05226c15-0501-4559-833d-3815fdf01f56 | Video Producer (San Francisco, CA) | CA US-REMOTE | no pay shown |  |
| audit_1 | 68a397e7-8a1a-4566-ae41-e8c61dd6ed93 | Product Manager - Strategic Partner Integrations (regular travel to Bay Area) | CA | pay listed | $200K - $270K |
| audit_1 | 98ae5c78-eab7-4879-b143-96b98e4d0dbb | Developer Relations Engineer (New York, NY) | NY US-REMOTE | no pay shown |  |
| audit_1 | a1320bbf-bfae-49a8-a1b7-12eeccaf39ca | Developer Relations Engineer  | CA US-REMOTE | no pay shown |  |
| audit_1 | cb04ae3a-3a47-4e21-928f-c2456b7b214e | Member of Technical Staff | CA US-REMOTE | no pay shown |  |
| audit_2 | 0c7c2e26-0a98-42cf-a47c-9a3999fb513b | Product Engineer | US-REMOTE | no pay shown |  |
| audit_2 | 12f8f208-0b9c-4569-bb3d-41c8a197029e | Senior / Staff Product Engineer | US-REMOTE | no pay shown |  |
| audit_2 | 1aa6f672-5917-49aa-b015-70ebff901923 | Deal Desk | US-REMOTE | no pay shown |  |
| audit_2 | 1d652292-04d9-405c-8101-578efd020e94 | Developer Relations | US-REMOTE | no pay shown |  |
| audit_2 | 493579ff-3198-420f-ab6a-b8bb971cb513 | Senior / Staff Security Engineer | US-REMOTE | no pay shown |  |
| audit_2 | 4c4f5bf5-0628-4145-b211-eb533edab8d1 | Field Marketing Manager | US-REMOTE | no pay shown |  |
| audit_2 | a264869e-f058-487c-ab7f-9b77dffa427c | Senior / Staff Product Designer | US-REMOTE | no pay shown |  |
| audit_2 | b32de590-06ce-47d4-8994-66b936df908d | Production Designer | US-REMOTE | no pay shown |  |
| audit_2 | b4a7764e-c680-4bdf-9956-dc78f2ca94d5 | Senior / Staff Product Engineer, Applied AI | US-REMOTE | no pay shown |  |
| audit_2 | b7669c4b-eeca-421d-ba9a-d90203f6fcb2 | Product Manager | US-REMOTE | no pay shown |  |
| audit_2 | c0abc97e-b4d7-4ad7-bd13-bc40f4023227 | Product Marketing Manager | US-REMOTE | no pay shown |  |
| audit_2 | c21af93e-210f-4969-8eaa-90fb16a5b720 | Account Executive, Startups | US-REMOTE | no pay shown |  |
| audit_2 | cd5ae036-0223-427a-b038-ba16ef9dcb32 | Senior / Staff Fullstack Engineer | US-REMOTE | no pay shown |  |
| audit_2 | d062065e-05bb-42ce-a430-ec205695cc2e | Product Support Specialist, Pacific/Mountain Time | US-REMOTE | no pay shown |  |
| audit_2 | eac7f181-d658-4943-9430-51bae2bcd110 | Mobile Product Designer | US-REMOTE | no pay shown |  |
| audit_2 | f16dd5e9-ed10-4b8e-b5d7-1b8b5e3f002f | Creative Producer | US-REMOTE | no pay shown |  |
| audit_2 | f272fc4a-91a7-4dcf-9cb5-3600ebaf14e1 | Analytics Engineer | US-REMOTE | no pay shown |  |
| audit_3 | 8368711002 | Sales Manager, Strategic Accounts | US-REMOTE | pay in the ad |  |
| audit_3 | 8403107002 | Account Executive, Corporate | US-REMOTE | pay in the ad |  |
| audit_3 | 8403127002 | Account Executive, Strategic | US-REMOTE | pay in the ad |  |
| audit_3 | 8905022002 | Renewals Associate | US-REMOTE | pay in the ad |  |
| audit_4 | 6981655 | Corporate Account Executive | IL | pay in the ad |  |
| audit_4 | 7392983 | Enterprise Account Executive, SLED | US-REMOTE | pay in the ad |  |
| audit_4 | 7594694 | Corporate Account Executive | IL | pay in the ad |  |
| audit_4 | 7867211 | People Partner, GTM | IL | pay in the ad |  |
| audit_4 | 7959069 | Senior Security Technical Program Manager | CA | pay in the ad |  |
| audit_4 | 7962412 | Software Engineer, Data Loading Infrastructure  | CA | pay in the ad |  |
| audit_4 | 7964388 | Staff Software Engineer, AI Developer Experience | NY | pay in the ad |  |
| audit_4 | 8044815 | Senior Product Manager, AI Context | NY | pay in the ad |  |
| audit_4 | 8054355 | Strategic Enterprise Account Executive, Amazon | WA | pay in the ad |  |
| audit_4 | 8078142 | Head of Digital and Scaled Customer Success | CA | pay in the ad |  |
| audit_4 | 8095543 | Developer Advocate | CA | pay in the ad |  |
| audit_4 | 8095555 | Senior Staff Software Engineer, Developer Productivity | CA | pay in the ad |  |
| audit_4 | 8098020 | Senior Staff Engineer, AI | CA | pay in the ad |  |
| audit_4 | 8137748 | Benefits Manager, NAMER | CA | pay in the ad |  |
| audit_4 | 8154796 | Design Leader, Emerging Products | CA | pay in the ad |  |
| audit_4 | 8165185 | Strategic Enterprise Account Executive, Amazon | NY | pay in the ad |  |
| audit_4 | 8180874 | Senior Product Manager, AI Studio | CA | pay in the ad |  |
| audit_4 | 8189390 | Revenue Manager | CA | pay in the ad |  |
| audit_4 | 8193555 | Head of Research | CA | pay in the ad |  |
| audit_4 | 8194380 | AI GTM Specialist | CA | pay in the ad |  |
| audit_4 | 8194410 | Technical Consultant | IL | pay in the ad |  |
| audit_4 | 8194522 | Software Engineer - AI Teammates Platform | CA | pay in the ad |  |
| audit_4 | 8204614 | Lead Product Manager, Enterprise Services Management  | CA | pay in the ad |  |
| audit_4 | 8212172 | Senior Staff Software Engineer, Developer Productivity | NY | pay in the ad |  |
| audit_4 | 8214906 | Pricing Strategy Director | CA | pay in the ad |  |
| audit_4 | 8226969 | Staff Software Engineer, Data Loading Infrastructure | CA | pay in the ad |  |
| audit_4 | 8227150 | Global Design & Project Manager | CA | pay in the ad |  |
| audit_4 | 8227362 | Manager, Customer Success | CA | pay in the ad |  |
| audit_4 | 8234428 | Emerging Enterprise Account Executive, Nonprofit | CA | pay in the ad |  |
| audit_4 | 8241249 | Digital & Scaled Customer Success Program Manager | IL | pay in the ad |  |
| audit_4 | 8244205 | Corporate Strategy and Planning Lead | CA | pay in the ad |  |
| audit_4 | 8257456 | Developer Advocate | NY | pay in the ad |  |
| audit_4 | 8275152 | Senior Manager, Payroll | CA | pay in the ad |  |
| audit_4 | 8279085 | Emerging Enterprise Account Executive | CA | pay in the ad |  |
| audit_4 | 8279133 | Manager, Customer Success | IL | pay in the ad |  |
| audit_4 | 8282374 | Business Value Consultant | CA | pay in the ad |  |
| audit_4 | 8282422 | Sales Engineer | IL | pay in the ad |  |
| audit_4 | 8282518 | Legal Operations Analyst | IL | pay in the ad |  |
| audit_4 | 8282522 | Corporate and Strategic Finance, FP&A | CA | pay in the ad |  |
| audit_4 | 8282680 | Renewal Manager | US-REMOTE | pay in the ad |  |
| audit_4 | 8293698 | Commercial Counsel | CA | pay in the ad |  |
| audit_4 | 8303385 | Head of Global Campaigns | CA | pay in the ad |  |
| audit_4 | 8304591 | Senior Implementation Manager | IL | pay in the ad |  |
| audit_4 | 8311197 | Senior Implementation Manager | US-REMOTE | pay in the ad |  |
| audit_4 | 8311577 | Customer Success Manager (AI Success Architect) | IL | pay in the ad |  |
| audit_4 | 8315830 | CX Technical Enablement Partner | IL | pay in the ad |  |
| audit_4 | 8318046 | People Partner  | CA | pay in the ad |  |

## Steps

Each step stores who ran it, how many postings it read, what it paid, and the sha256 of its evidence packet and of its results.

| Step | At (UTC) | By | Read | Paid | packet | results |
|---|---|---|---|---|---|---|
| audit_0 #1 | 2026-11-02T07:22:20 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 25 | 0.05 GEN | `28d027d9da7b79262e6523c55fc601aa1f645be724f612a41073f53d0e15a490` | `6e6e81f8ab0db66f1621a2efc970f83ca8705bbceb06cd199ea807653daaa5f5` |
| audit_0 #2 | 2026-11-02T07:22:45 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 25 | 0.05 GEN | `ed21db91ecb954263ed638eb1f56b34b1d841bf66648b9548c57350d84b1b532` | `f2a4769a3b658a7f18e7b8e056daa972ae4dc6fead5bf5356fac5c262940e4e2` |
| audit_0 #3 | 2026-11-02T07:23:18 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 25 | 0.05 GEN | `e6b810f422fd7ccb6f921d0bf7620413af2b74bf1e9044fb5d29a39fb4df0e14` | `351e4b2579c509911f3127c1370c9f8e4851d2088afda25dca9d41bb36590cc7` |
| audit_0 #4 | 2026-11-02T07:23:30 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 25 | 0.05 GEN | `c783dce4ebfbef0d38b8cb3411a61340f5755ce6a3e730e7e1833a309c14df46` | `84023600452afd691740c7bc8b221361039da4ad7e6b0bafe5ddf63b1dd39f4d` |
| audit_0 #5 | 2026-11-02T07:23:42 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 25 | 0.05 GEN | `5e123d481052becb48a69ca1a94882dd425056d33b41f196bc119e293d998d85` | `4ff046da3f139a0d253c7184feff05328590ca55426eaf0ed39342ead8332b0f` |
| audit_0 #6 | 2026-11-02T07:23:59 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 15 | 0.05 GEN | `8ee3738bd0049f8763d870349bd8855ac67f69481230d6909eb11a58a3c18208` | `1e532f84fc81a4f39ff3592e324ffbbd5550fe77328b1fe8af8b0dfb171a025b` |
| audit_1 #1 | 2026-11-02T07:25:29 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 25 | 0.05 GEN | `a7daf831fcfa7c30150a8b9e76dbec9f980fc9fa41597b307a08709c84420049` | `032cd0e2f26e52b0388835881b27a8a649cfe837bc46d05fc829cd17ed346b4a` |
| audit_1 #2 | 2026-11-02T07:25:53 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 25 | 0.05 GEN | `4a324134445b7523e26913aeb7f7f321e2ad6ae1a2362dc6ed4a3a6ad12fd627` | `0d704b735a14e0aba28c56b75741f167e8a1cc6dfb9a0b91c7135d11e211cf0d` |
| audit_1 #3 | 2026-11-02T07:26:15 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 18 | 0.05 GEN | `0828e4a43b24ecf0ff4503119e299b83c3cd2efc42554cf096f7f6ecfa2250ac` | `e33377546999050ad3711707740d6dd5e2941ba779cce8de0a655af64a2f6282` |
| audit_2 #1 | 2026-11-02T07:26:34 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 25 | 0.05 GEN | `f7a90dc34da1bdee591c99be64f4a305ba6f56ba67501bddcf197e1846aec624` | `8d89f483e29ffa0ab1dafa03f6fda684ed4fb3d13d71b908170b91372943e6a2` |
| audit_2 #2 | 2026-11-02T07:26:52 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 6 | 0.05 GEN | `ca3529010fe105b3eaac0d22ff6ad3bb55a5553881be9e5c4b19f2a74a593fbe` | `744e31d99929aa94fea338f816e60488bcb0204b16021260fd82a2e0dd413d79` |
| audit_3 #1 | 2026-11-02T07:27:10 | `0xf14DBAe92946654b40889B65f2de3b819aC8e8f5` | 5 | 0.05 GEN | `0edc75e6b1068ee4c4ec7e75dd3bbdd5baac6b2c8b4c504d6ee8c9522a788ee1` | `87b4d421b8c50f91dd8c318f897898aee757488bc4eb7203e37fe120e8d151d0` |
| audit_4 #1 | 2026-11-02T07:27:30 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 25 | 0.05 GEN | `280da7d55fa0c0c9ca8d4c00b4a2a9b5f5ad302a08053bc18ad650d19e6fd941` | `65c30b71603c160b5d43fdc7d90a2aa6a07a3a47c1cca5d6dafec82c1d9f5b0a` |
| audit_4 #2 | 2026-11-02T07:27:49 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 25 | 0.05 GEN | `dc9a222d3c43900239f865d1b046638ed0069a5e48635aa0201bcf858e01aefe` | `716b323ca73dab8c076d11a3714781eead21334d0dffc830b6af4e0e962b8f7d` |
| audit_4 #3 | 2026-11-02T07:28:06 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 25 | 0.05 GEN | `9e5687139c0793cca2896740284a109e1873bbe75d908dfd5b8e664aa2fb1b70` | `b4fff8acd61fb8b12f76480e578f6bd27120ea8d1b953cd5743080dc71f83d02` |
| audit_4 #4 | 2026-11-02T07:28:45 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 25 | 0.05 GEN | `6b51f6cb12bbb1071793435a2c60770968a604ed054382e7254fce55a422880f` | `b4c7a7ebba144664f94ab321cb3871716829a1034194651ddf5ca2ebc2bae868` |
| audit_4 #5 | 2026-11-02T07:29:10 | `0xC0b3E7D6588F995Cc5Ec3392fCFFA1784d68F3Fe` | 10 | 0.05 GEN | `7b6db53a0302610b90be24797812065feb61ae17453acfe3e75b82618afe04cb` | `40e05535abc10deac67d58da22cad94abe2850a57842d888107733481cab2c87` |

## Balance reconciliation

`totals()` (open program pots) against the contract's on-chain balance, each time after every transfer had finalized:

| Point | Expected | Contract balance | Match |
|---|---|---|---|
| after the refused programs: the contract kept nothing | 0 GEN | 0 GEN | yes |
| after the Figma audit | 2.7 GEN | 2.7 GEN | yes |
| end of run | 2.15 GEN | 2.15 GEN | yes |

Final wallet balances: sponsor 18 GEN, cofunder 4 GEN, auditor 2.4 GEN, bystander 1.45 GEN.

## Wallet test from the live app

MetaMask test from the production app (payclear-bars26.vercel.app): the tester reads greenhouse/discord in the wallet-free checker, opens an on-chain audit of it, runs the second step that finishes it, and asks for a fresh reading of one posting. The tester is not a funder of program_0, so both steps were paid. Wallet `0x4f80b5c475fced34fc9a07ffccf39e1adc1406bf`. Every transaction is FINALIZED with execution result SUCCESS.

| Step | GEN sent | Result | Tx |
|---|---|---|---|
| Audit on-chain: open_audit(program_0, greenhouse, discord) from the "Check a job board" panel |  | audit_5 opened; validators read the first 25 of 41 postings; step paid 0.05 GEN to the tester | [`0x6cfc1a4e…`](https://explorer-studio.genlayer.com/tx/0x6cfc1a4ebcedccf6f2885693e4151f738d17c37d9beb294c92a7447f956a8c13) |
| Read the next 25 (step) |  | the last 16 postings read; audit done: 35 postings in scope, 33 with Greenhouse's pay field, 2 with a range in the text read by the validators, 0 without pay (score 100%); step paid 0.05 GEN | [`0xc55a0414…`](https://explorer-studio.genlayer.com/tx/0xc55a0414c0f403eb794d636e6dd1d30fbefd4eed0dd6335fb0137b70e8d24d55) |
| Read again: posting 8214127002 (Staff Software Engineer, Safety Processing, CA) |  | read again: range_listed, unchanged | [`0x9a526879…`](https://explorer-studio.genlayer.com/tx/0x9a526879f5200833e2392c852bbfbe22c51f8b9fa8b2ba77b6f0077aa05b5b78) |

## Every transaction

| Who | Call | GEN | Status | Result | Returned / refused | Tx |
|---|---|---|---|---|---|---|
| sponsor | `create_program("US pay transparency, fall 2026", "2026-02-31", 0.05 GEN, 40)` | 2 | ACCEPTED | SUCCESS | REFUNDED: ends must be a real calendar date written YYYY-MM-DD | [`0x46a9dc6d…`](https://explorer-studio.genlayer.com/tx/0x46a9dc6db8770b384d7a0557631d65a04aa0f531cf4cffd23f3fe17d4a9b047b) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-01", 0.001 GEN, 40)` | 2 | ACCEPTED | SUCCESS | REFUNDED: reward must be at least 0.01 GEN | [`0xfc1e6e40…`](https://explorer-studio.genlayer.com/tx/0xfc1e6e40bbf3b075d18824b55b21bb29f654fde3f195d358ec203aa4eaa28d61) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-01", 0.05 GEN, 0)` | 2 | ACCEPTED | SUCCESS | REFUNDED: per_auditor must be a whole number from 1 to 1000 | [`0xe3c49e7c…`](https://explorer-studio.genlayer.com/tx/0xe3c49e7ce359e667976f7347b33e54fa5276782351acc2910fd06dc614549639) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-01", 0.05 GEN, 40)` | 0.05 | ACCEPTED | SUCCESS | REFUNDED: fund the program with at least one reward and at least 0.1 GEN | [`0x9c3768eb…`](https://explorer-studio.genlayer.com/tx/0x9c3768eb458115cc794e03233c3e9bb8c9f7da04801448bbcce1da1fb738c75f) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-01", 0.05 GEN, 40)` | 2 | ACCEPTED | SUCCESS | program_0 | [`0xfd39b05f…`](https://explorer-studio.genlayer.com/tx/0xfd39b05fda38c1aa839154fa704fd17f79223c26750e2018393b29f4283283f6) |
| cofunder | `fund("program_0")` | 1 | ACCEPTED | SUCCESS | funded | [`0x55061a62…`](https://explorer-studio.genlayer.com/tx/0x55061a625d9f6c6660af843726d5921d2e2de5f234c286a05d4c06e567a3de0e) |
| bystander | `fund("program_0")` | 0.05 | ACCEPTED | SUCCESS | REFUNDED: Send at least 0.1 GEN to fund the program | [`0x7b25c705…`](https://explorer-studio.genlayer.com/tx/0x7b25c70598715c5a25953ad2f92fd78bf96dfca308614752a552b17da6072c46) |
| auditor | `open_audit("program_0", "lever", "figma")` | 0 | ACCEPTED | ERROR | ats must be greenhouse or ashby | [`0x72a3462b…`](https://explorer-studio.genlayer.com/tx/0x72a3462b95b29eae1fb37d2a2d2f15bf76b0f95a74fcb5ccc2a40348ef2a5260) |
| auditor | `open_audit("program_0", "greenhouse", "no-such-board-payclear")` | 0 | ACCEPTED | ERROR | greenhouse has no public job board named no-such-board-payclear | [`0x2fe46029…`](https://explorer-studio.genlayer.com/tx/0x2fe4602955bb329948db9e3f6b55d82366ffcbd622203b882cc86ed47a07d5ed) |
| auditor | `open_audit("program_0", "greenhouse", "figma")` | 0 | ACCEPTED | SUCCESS | audit_0 | [`0x7a95d1ed…`](https://explorer-studio.genlayer.com/tx/0x7a95d1ede70250060a5a9f7f3cf2b796c6d5bf16e7394f49c7a00131f23a5860) |
| bystander | `open_audit("program_0", "greenhouse", "figma")` | 0 | ACCEPTED | ERROR | audit_0 is still auditing this board | [`0x96772b82…`](https://explorer-studio.genlayer.com/tx/0x96772b827bf18b33219fb6d54cb4a1d2a333230dc435205de440d2443b692d30) |
| auditor | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0x749c1956…`](https://explorer-studio.genlayer.com/tx/0x749c195668a88b472862bd6d1f23e7e1864479acc6699b72438d71df6e54e5d9) |
| bystander | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0x182e801a…`](https://explorer-studio.genlayer.com/tx/0x182e801aee7b2f6952a325df09dd75884b5828dee3bd7246bf588225bf272077) |
| auditor | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0xdfdc6b42…`](https://explorer-studio.genlayer.com/tx/0xdfdc6b428b5c32437ae3fbf333f7c7ebf85c03e45c295039811eabcc6811a96e) |
| bystander | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0xcc4dab68…`](https://explorer-studio.genlayer.com/tx/0xcc4dab68aeb52ab1b6e7880f4f5d486776f610d3fb82de60c562f5c2b80932cb) |
| auditor | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | done | [`0x97050b01…`](https://explorer-studio.genlayer.com/tx/0x97050b0154dcbc13e5b99fe8dfd5267e9ef28a79b067c5b041a4e555bfad85dd) |
| auditor | `recheck("audit_0", "6216211004")` | 0 | ACCEPTED | SUCCESS | no_range | [`0x0f85ea19…`](https://explorer-studio.genlayer.com/tx/0x0f85ea19686f229a1ab943005a505ef28c7fdb8c9ab23e6fb1d80621281b18b9) |
| bystander | `recheck("audit_0", "6216211004")` | 0 | ACCEPTED | ERROR | This posting has already been read again | [`0x476578b7…`](https://explorer-studio.genlayer.com/tx/0x476578b7a05a4cc3b73e3c2d9d5f09e2efceda148db811449d89c7d11725e15d) |
| auditor | `open_audit("program_0", "greenhouse", "figma")` | 0 | ACCEPTED | ERROR | audit_0 audited this board on 2026-11-02; audit it again after 7 days | [`0x810f6324…`](https://explorer-studio.genlayer.com/tx/0x810f6324026e5d595858060a2ba8304f700d872ba0988065e05212a826af77e7) |
| auditor | `open_audit("program_0", "ashby", "supabase")` | 0 | ACCEPTED | SUCCESS | audit_1 | [`0x9d276c5b…`](https://explorer-studio.genlayer.com/tx/0x9d276c5b486eaefa09f0a5b825204bc15b137186798184ac02bb6e273af12570) |
| auditor | `step("audit_1")` | 0 | ACCEPTED | SUCCESS | running | [`0x565ef89f…`](https://explorer-studio.genlayer.com/tx/0x565ef89f115d9b4df629e2c0b1313df46f515699bc9fa29d11618676f72c3bbb) |
| auditor | `step("audit_1")` | 0 | ACCEPTED | SUCCESS | done | [`0xa9c9d113…`](https://explorer-studio.genlayer.com/tx/0xa9c9d113d7b5437dcdd2ade8eed0079f305034412ce62f628270fe2d85ec85fa) |
| bystander | `open_audit("program_0", "ashby", "linear")` | 0 | ACCEPTED | SUCCESS | audit_2 | [`0x78e46a24…`](https://explorer-studio.genlayer.com/tx/0x78e46a243395d6efb59497aea7ad17e03a0860e45efb82de9af0b3295d4aec6e) |
| bystander | `step("audit_2")` | 0 | ACCEPTED | SUCCESS | done | [`0xbbb0ec90…`](https://explorer-studio.genlayer.com/tx/0xbbb0ec90c6fffc3199fd6179f64449c9c2cd87b0bf2701f5bf3d759a0be57fba) |
| auditor | `open_audit("program_0", "greenhouse", "airtable")` | 0 | ACCEPTED | SUCCESS | audit_3 | [`0xa1692178…`](https://explorer-studio.genlayer.com/tx/0xa16921784e7669f5b04f9c6b7c00e9a3bc319801bd0b7bb58abe4976e642fd8c) |
| bystander | `open_audit("program_0", "greenhouse", "asana")` | 0 | ACCEPTED | SUCCESS | audit_4 | [`0xf8c7dc91…`](https://explorer-studio.genlayer.com/tx/0xf8c7dc91ba7b3b0cb522c9104c1f1f5e13a0f7087251413cfd5cc408e709775a) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | running | [`0xb8ed6c1a…`](https://explorer-studio.genlayer.com/tx/0xb8ed6c1a0c74a24a0a9cfd050b6a12958c0a23f72700593131c08a31b7f0845a) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | running | [`0x3dcb6c97…`](https://explorer-studio.genlayer.com/tx/0x3dcb6c97daa14c718cd8a92ab2015452f8a0fe75b14d60d2cb3cebe179f40ad6) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | running | [`0x61b77349…`](https://explorer-studio.genlayer.com/tx/0x61b773496be99b619bc124075c602536d05157ea5f775bcd8740c62b92603295) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | done | [`0x9dc3cef1…`](https://explorer-studio.genlayer.com/tx/0x9dc3cef1c15b3c8de6d136e69e15134ff5772ef6a5c383b626f5d3b41427516c) |
| bystander | `close("program_0")` | 0 | ACCEPTED | ERROR | Audit steps are paid until 2027-01-01 | [`0xd20fa4ef…`](https://explorer-studio.genlayer.com/tx/0xd20fa4eff7aef843e3368197cac3d6a3bba07194af7fc6ab42ac0e413a8d1da7) |
