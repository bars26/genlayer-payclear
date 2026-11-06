# PayClear v2: reproduction of the live runs

The same contract ran on two GenLayer networks: `contracts/pay_clear.py` on GenLayer Studio and
`contracts/pay_clear.bradbury.py` on Bradbury testnet (the same program with the Bradbury runner's header, without comments
and docstrings: `python3 scripts/bradbury_source.py --check` proves it). Each deployment is checked byte-identical with its file.

A **demo program** funded by test wallets paid audit steps of **real employers' public job boards** on Greenhouse and Ashby.
Every step is validator consensus: each validator read the board, placed every posting in code (12 US jurisdictions with
pay-in-posting laws, plus US-remote jobs under Colorado's), read listed pay in code, and read the pay passages of the rest.
In v2 every GEN that leaves the contract goes through `withdraw`, to the caller; rewards, refused payments and returned shares
are credited first. The v1 run is in [docs/v1/REPRODUCTION.md](v1/REPRODUCTION.md).

## Bradbury testnet (Phase 2, chain 4221)

Contract [`0xae3C8CfC29CDf8842EEadd3F51E88684C47918d7`](https://explorer-bradbury.genlayer.com/address/0xae3C8CfC29CDf8842EEadd3F51E88684C47918d7), source `contracts/pay_clear.bradbury.py`. Accounts:
sponsor `0xDe19AD65B1155CafB2C7133bdBcf3076683c8a22`, auditorA `0x1cfF3f6F0E1aeA4665D1E133372171637e6f0Fc2`, auditorB `0x463Dc91Ce7fFDDade35866d89E0a4EbA410f62d6`.

### Audits

| Audit | Employer | Board | Read | In scope | Show pay | No pay shown | Unverified | Unclear | Score | Steps |
|---|---|---|---|---|---|---|---|---|---|---|
| audit_0 | [Airtable](https://job-boards.greenhouse.io/airtable) | greenhouse | 5 | 4 | 4 | **0** | 0 | 0 | 100.0% | 1 |
| audit_1 | [linear](https://jobs.ashbyhq.com/linear) | ashby | 32 | 18 | 13 | **5** | 0 | 0 | 72.2% | 2 |
| audit_2 | [Discord](https://job-boards.greenhouse.io/discord) | greenhouse | 27 | 23 | 22 | **1** | 0 | 0 | 95.7% | 2 |

### Postings with no pay shown

| Audit | Employer | Posting | Location | Jurisdictions | Note |
|---|---|---|---|---|---|
| audit_1 | linear | [Developer Relations](https://jobs.ashbyhq.com/linear/1d652292-04d9-405c-8101-578efd020e94) | North America / Europe | US-REMOTE | read again, still none |
| audit_1 | linear | [Production Designer](https://jobs.ashbyhq.com/linear/b32de590-06ce-47d4-8994-66b936df908d) | North America / Europe | US-REMOTE |  |
| audit_1 | linear | [Senior / Staff Product Engineer, Applied AI](https://jobs.ashbyhq.com/linear/b4a7764e-c680-4bdf-9956-dc78f2ca94d5) | North America | US-REMOTE |  |
| audit_1 | linear | [Senior / Staff Fullstack Engineer](https://jobs.ashbyhq.com/linear/cd5ae036-0223-427a-b038-ba16ef9dcb32) | North America | US-REMOTE |  |
| audit_1 | linear | [Creative Producer](https://jobs.ashbyhq.com/linear/f16dd5e9-ed10-4b8e-b5d7-1b8b5e3f002f) | North America / Europe | US-REMOTE |  |
| audit_2 | Discord | [Senior Staff Brand Designer](https://job-boards.greenhouse.io/discord/jobs/8933480002) | San Francisco Bay Area | CA |  |

### Steps

| Step | At (UTC) | By | Read | Paid | packet | results |
|---|---|---|---|---|---|---|
| audit_0 #1 | 2026-11-06T20:52:49 | `0x1cfF3f6F0E1aeA4665D1E133372171637e6f0Fc2` | 5 | 0.05 GEN | `55bbf118e5aa475031239c015a717c5397f8a85412e789ea1a997cb0d4a069c8` | `875c5760d77556585413c146dc814c448fad028aabcebf95e026659963a56df4` |
| audit_1 #1 | 2026-11-06T20:53:42 | `0x463Dc91Ce7fFDDade35866d89E0a4EbA410f62d6` | 25 | 0.05 GEN | `8e379a9eaca08570e2ec70617dcfc989a1852de6a5defd26b5035ff5e5d32609` | `f01be750775f3e8989c8705d8d94b25a51e7205514e68cef01d3f6a9a03e1ad2` |
| audit_1 #2 | 2026-11-06T20:54:48 | `0x463Dc91Ce7fFDDade35866d89E0a4EbA410f62d6` | 7 | 0.05 GEN | `0cda22e2220445e320b71cc9b43c9960e01581335e13f05dee8567b46c7ef496` | `1ae76c3dbcaf18355f3655858ff498fb1c1deb174b2a741e35c689f1f4f74f4a` |
| audit_2 #1 | 2026-11-06T20:57:16 | `0x1cfF3f6F0E1aeA4665D1E133372171637e6f0Fc2` | 25 | 0.05 GEN | `09a36c6265dc4080f883ba94f3be6b69471f353efa37c5b9deadba9688b5ace1` | `f0ffe17be914476e7b8df6a08fb1ea453fe7c089242dd92534fdb0eeb1b2b370` |
| audit_2 #2 | 2026-11-06T20:57:58 | `0x1cfF3f6F0E1aeA4665D1E133372171637e6f0Fc2` | 2 | 0.05 GEN | `11a5c75b36583ec2adf9726573be98799c3c3756be3f9a9c2676bf095f5fcbf5` | `48096576256914c58ae1beed99dd8c3119f15a983a7e52d9f8fcb6dcf31afebf` |

### Balance reconciliation

`totals()` (open program pots plus GEN credited and not yet withdrawn) against the contract's on-chain balance, after every
transfer had finalized:

| Point | Expected | Contract balance | Match |
|---|---|---|---|
| after a refused program: its GEN is credited to the sponsor | 0.5 GEN | 0.5 GEN | yes |
| after the sponsor withdrew | 0 GEN | 0 GEN | yes |
| after the audits: step rewards are credited | 2.05 GEN | 2.05 GEN | yes |
| end of run, after the auditors withdrew | 1.75 GEN | 1.75 GEN | yes |

Withdrawals: auditorA was credited 0.15 GEN and its wallet balance rose by 0.2498 GEN; auditorB was credited 0.15 GEN and its wallet balance rose by 0.1499 GEN.

### Wallet test from the live app

A tester switched MetaMask to Bradbury (chain 4221), read greenhouse/dropbox in the wallet-free checker, opened an on-chain audit and ran its second step (33 postings: 14 in scope, all 14 with Greenhouse's pay field, score 100%), was credited 0.05 GEN per step, and withdrew the 0.10 GEN. Each transaction was FINALIZED with all five validators voting FINISHED_WITH_RETURN. Wallet `0x4F80B5C475fCED34fc9A07FFccF39E1aDC1406bf`.

| Step | GEN sent | Result | Tx |
|---|---|---|---|
| open_audit(program_0, greenhouse, dropbox): first 25 postings | 0 | FINALIZED, 5/5, audit_3 opened, 0.05 GEN credited | [`0x28322112…`](https://explorer-bradbury.genlayer.com/tx/0x28322112f6fa8ba099f0b522e65806b7ec29eef6055b601eb032c3c4e01acbb6) |
| step(audit_3): last 8 postings | 0 | FINALIZED, 5/5, audit done, 0.05 GEN credited | [`0x2c88b662…`](https://explorer-bradbury.genlayer.com/tx/0x2c88b66218f428e7d88d80d3e72d110ba5b91d170cbe1144add15f30058758f4) |
| withdraw() with the prepaid transfer fee | 0 | FINALIZED, 5/5, 0.10 GEN sent to the wallet | [`0xbd6551c3…`](https://explorer-bradbury.genlayer.com/tx/0xbd6551c3f17c5850502270bf9a6e3b0fd09b778158bb29be472dbc38a8e0b1fe) |

### Every transaction

| Who | Call | GEN | Decision | Execution | Validator votes | Seconds | Tx |
|---|---|---|---|---|---|---|---|
| sponsor | `create_program("US pay transparency on Bradbury", "2026-02-31", "50000000000000000", 40)` | 0.5000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 34 | [`0x9a03b25e…`](https://explorer-bradbury.genlayer.com/tx/0x9a03b25e25d5099794096f4ed096ec476bdf72393aec6dbb4d1581f58ab9bdef) |
| sponsor | `withdraw()` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 32 | [`0x76564037…`](https://explorer-bradbury.genlayer.com/tx/0x7656403796b82d150e5ae5d819cd7be9e7833f60a516d3e738fcaca79be01659) |
| sponsor | `withdraw()` | 0.0000 | ACCEPTED | ERROR | ERROR / ERROR / ERROR / ERROR / ERROR | 33 | [`0xe0da6890…`](https://explorer-bradbury.genlayer.com/tx/0xe0da6890a21072c222ed5f2f1a8f7ce74e98c0a66b7fc66316c4a6060e6fba12) |
| sponsor | `create_program("US pay transparency on Bradbury", "2027-01-05", "50000000000000000", 40)` | 2.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 91 | [`0x890c7f94…`](https://explorer-bradbury.genlayer.com/tx/0x890c7f94189d6b09291075f78bdf1814bf2115047b5cb14ab35945df2a7815b6) |
| auditorB | `fund("program_0")` | 0.0500 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 39 | [`0x7a679528…`](https://explorer-bradbury.genlayer.com/tx/0x7a67952896aae3beb549e2955e0487134f8a7adabec8ff8501def049d94ea0bc) |
| auditorA | `open_audit("program_0", "lever", "figma")` | 0.0000 | ACCEPTED | ERROR | ERROR / ERROR / ERROR / ERROR / ERROR | 26 | [`0xc1e0cc4c…`](https://explorer-bradbury.genlayer.com/tx/0xc1e0cc4c3aa112fb25953bac2ae86612384337013c7b6c6c6bca91c1e64862ab) |
| auditorA | `open_audit("program_0", "greenhouse", "airtable")` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 42 | [`0x9a459eba…`](https://explorer-bradbury.genlayer.com/tx/0x9a459eba97e54f1ba17e21e1506f309c6ca9202b4182afd0ad0cfd1dc6d4daff) |
| auditorB | `open_audit("program_0", "ashby", "linear")` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 55 | [`0x50037853…`](https://explorer-bradbury.genlayer.com/tx/0x50037853158009ce1de2f86445df7a395bc5f0dd73cd674ae2997b272e920a30) |
| auditorB | `step("audit_1")` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 139 | [`0xd31cdb24…`](https://explorer-bradbury.genlayer.com/tx/0xd31cdb2478b7fe93e5ad105df0e7573df4c5db983c4b432ef2d8eea65146187a) |
| auditorA | `open_audit("program_0", "greenhouse", "discord")` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 33 | [`0x4d3f84d0…`](https://explorer-bradbury.genlayer.com/tx/0x4d3f84d0be5522361f320ac26b92b8742fd5ca7bc178a030e70c207876bed0d4) |
| auditorA | `step("audit_2")` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 32 | [`0x69f0c966…`](https://explorer-bradbury.genlayer.com/tx/0x69f0c966b4cc8a8fac638ea1bf17dec50fb8e72a5e7cd0583ecb69ddd48bea59) |
| auditorB | `open_audit("program_0", "ashby", "linear")` | 0.0000 | ACCEPTED | ERROR | ERROR / ERROR / ERROR / ERROR / ERROR | 40 | [`0x5ed32492…`](https://explorer-bradbury.genlayer.com/tx/0x5ed324923e5e27916c5f17959f710debc22fb43918efeca9f0fd09c27d5339f4) |
| auditorA | `recheck("audit_1", "1d652292-04d9-405c-8101-578efd020e94")` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 26 | [`0x83a0485e…`](https://explorer-bradbury.genlayer.com/tx/0x83a0485e43787ef08af046257318084d7bfd14208153f721be3d456c4fb91efc) |
| auditorB | `recheck("audit_1", "1d652292-04d9-405c-8101-578efd020e94")` | 0.0000 | ACCEPTED | ERROR | ERROR / ERROR / ERROR / ERROR / ERROR | 26 | [`0xfc92b08c…`](https://explorer-bradbury.genlayer.com/tx/0xfc92b08cc1caf6a4ccfe324c0a39f6d85164dd55334bbcc32ed9d186d4afc1cc) |
| auditorA | `withdraw()` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 32 | [`0x65e5a37a…`](https://explorer-bradbury.genlayer.com/tx/0x65e5a37aba2ac327a1cc4003c27acd3642490d26c442fb081bfa027812850bcb) |
| auditorB | `withdraw()` | 0.0000 | ACCEPTED | RETURN | RETURN / RETURN / RETURN / RETURN / RETURN | 23 | [`0x82e4b397…`](https://explorer-bradbury.genlayer.com/tx/0x82e4b39792377080db7361283b170ae5f03c01d92d57ff334e051479ff09a5d8) |

## GenLayer Studio

Contract [`0x6dEc38B51C07120b910fe6b0a6c07b3Cf92A238D`](https://explorer-studio.genlayer.com/address/0x6dEc38B51C07120b910fe6b0a6c07b3Cf92A238D), source `contracts/pay_clear.py`. Accounts:
sponsor `0x77dEcb784bA9Cc6eC6E5d55Fd3C60E7619b57f4a`, cofunder `0x88EFAae08d3CC882071d22f4d1eB4f57f35F5f5f`, auditor `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135`, bystander `0x366046226F69872feEB43127423C208eE915bD1e`.

### Audits

| Audit | Employer | Board | Read | In scope | Show pay | No pay shown | Unverified | Unclear | Score | Steps |
|---|---|---|---|---|---|---|---|---|---|---|
| audit_0 | [Figma](https://job-boards.greenhouse.io/figma) | greenhouse | 143 | 93 | 93 | **0** | 0 | 0 | 100.0% | 6 |
| audit_1 | [supabase](https://jobs.ashbyhq.com/supabase) | ashby | 69 | 5 | 1 | **4** | 0 | 0 | 20.0% | 3 |
| audit_2 | [linear](https://jobs.ashbyhq.com/linear) | ashby | 31 | 18 | 13 | **5** | 0 | 0 | 72.2% | 2 |
| audit_3 | [Airtable](https://job-boards.greenhouse.io/airtable) | greenhouse | 5 | 4 | 4 | **0** | 0 | 0 | 100.0% | 1 |
| audit_4 | [Asana](https://job-boards.greenhouse.io/asana) | greenhouse | 110 | 44 | 44 | **0** | 0 | 0 | 100.0% | 5 |

### Postings with no pay shown

| Audit | Employer | Posting | Location | Jurisdictions | Note |
|---|---|---|---|---|---|
| audit_1 | supabase | [Video Producer](https://jobs.ashbyhq.com/supabase/05226c15-0501-4559-833d-3815fdf01f56) | Remote, San Francisco, CA, US | CA US-REMOTE |  |
| audit_1 | supabase | [Developer Relations Engineer (New York, NY)](https://jobs.ashbyhq.com/supabase/98ae5c78-eab7-4879-b143-96b98e4d0dbb) | Remote, New York, NY, US | NY US-REMOTE |  |
| audit_1 | supabase | [Developer Relations Engineer ](https://jobs.ashbyhq.com/supabase/a1320bbf-bfae-49a8-a1b7-12eeccaf39ca) | Remote, San Francisco, CA, US | CA US-REMOTE |  |
| audit_1 | supabase | [Member of Technical Staff](https://jobs.ashbyhq.com/supabase/cb04ae3a-3a47-4e21-928f-c2456b7b214e) | Remote, Bay Area, CA, US / Remote, San Francisco, CA, US / Remote, AMER | CA US-REMOTE |  |
| audit_2 | linear | [Developer Relations](https://jobs.ashbyhq.com/linear/1d652292-04d9-405c-8101-578efd020e94) | North America / Europe | US-REMOTE |  |
| audit_2 | linear | [Production Designer](https://jobs.ashbyhq.com/linear/b32de590-06ce-47d4-8994-66b936df908d) | North America / Europe | US-REMOTE |  |
| audit_2 | linear | [Senior / Staff Product Engineer, Applied AI](https://jobs.ashbyhq.com/linear/b4a7764e-c680-4bdf-9956-dc78f2ca94d5) | North America | US-REMOTE |  |
| audit_2 | linear | [Senior / Staff Fullstack Engineer](https://jobs.ashbyhq.com/linear/cd5ae036-0223-427a-b038-ba16ef9dcb32) | North America | US-REMOTE |  |
| audit_2 | linear | [Creative Producer](https://jobs.ashbyhq.com/linear/f16dd5e9-ed10-4b8e-b5d7-1b8b5e3f002f) | North America / Europe | US-REMOTE |  |

### Steps

| Step | At (UTC) | By | Read | Paid | packet | results |
|---|---|---|---|---|---|---|
| audit_0 #1 | 2026-11-06T08:15:39 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 25 | 0.05 GEN | `76b4e8723c69cecd90845f2c016d902ca50255c716ce76572ffed7d6e57019d4` | `08a645f14aefaa8e6918d96016b3782bbe390e66e22871b3854081f45eae91c1` |
| audit_0 #2 | 2026-11-06T08:16:04 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 25 | 0.05 GEN | `09f65a8a744b9653dc1f93527ebac0c93f128e9332b4d02f30a497951a8e2bf4` | `466e99a63a5ffffdb469ec9fdc02b7f913c6fa6f73aa489db8df8495e7ccf655` |
| audit_0 #3 | 2026-11-06T08:16:21 | `0x366046226F69872feEB43127423C208eE915bD1e` | 25 | 0.05 GEN | `c1734588f9b943e8c0fb4351c4bdfe3f8a23c2f85aeb6b72968d9bbd89ab8d35` | `45a8c672dd640649817c5ef76750aa0ab00ee3d9c482376ed9eb8ef4514f62e4` |
| audit_0 #4 | 2026-11-06T08:16:39 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 25 | 0.05 GEN | `3a1ed2cf246ac2365fcf52b54e0e92c0b6329c8096abde24906aff96e14d7a49` | `3d909d0a2ced9ed4a347ad7c509ebdcd30ad7fd91cef604cd79fa37a82be99c2` |
| audit_0 #5 | 2026-11-06T08:16:56 | `0x366046226F69872feEB43127423C208eE915bD1e` | 25 | 0.05 GEN | `247c3439aa6a577c94cd99307e631d3c8771c38442bffce6d1ba7d5e6ab21e8b` | `7ccc0ea8103d62b8be1d817ba159c948d8595d2bedfe7f1950b8a5953015d287` |
| audit_0 #6 | 2026-11-06T08:17:13 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 18 | 0.05 GEN | `e50dc4c4bedba7a679c6ddaccc893232b7005991534055db33bed86037f22ea9` | `52f318d10057cff503378cc0c8be7c3dc4bd2d13ac82afbbcb765596445bccb1` |
| audit_1 #1 | 2026-11-06T08:19:03 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 25 | 0.05 GEN | `245afa5a99094320d42d880a20b3ce324adc98b5839de0f2c972a411a51a6fe2` | `ab9b537fd4eb35fb610038505879b8670b4562b23f21ef5f7f11ea0b807b48dd` |
| audit_1 #2 | 2026-11-06T08:19:27 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 25 | 0.05 GEN | `d646d57d8bb9026794474b3189a5664c594e2233af3c3e2901fc82a7db1a1e39` | `8e4ba73641ffb64e7f0fd550b936e2e953784514fccf80c35304797955f7430f` |
| audit_1 #3 | 2026-11-06T08:20:01 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 19 | 0.05 GEN | `c3bdc4177d1cbd40f3a064c5117a26036ad866e3a7ace6960dd8397a1b30beb9` | `538b6772449fd9aa12170818ce30fd421eaf40cec559d7135d951eecd9e9f610` |
| audit_2 #1 | 2026-11-06T08:20:41 | `0x366046226F69872feEB43127423C208eE915bD1e` | 25 | 0.05 GEN | `0f436a47ca634fec0266ad965718c22679178897a15c5045b1dcdb36d181f2ca` | `3382db5a96fb425160a12e3d510a847b8de4e7fcd698bebe105b9f855bd9aad0` |
| audit_2 #2 | 2026-11-06T08:21:04 | `0x366046226F69872feEB43127423C208eE915bD1e` | 6 | 0.05 GEN | `4fa741b3199c511c5b0d68fa0926d0f04cba5365d378d31a3f03006629287905` | `1c45f518b292046aad54c498c70ea1b5b19a506f3c12e4ed359527b9d6f5ae36` |
| audit_3 #1 | 2026-11-06T08:21:28 | `0x4E4D92080D2BC09A39ED398030FfDEC7588Fb135` | 5 | 0.05 GEN | `55ea4862148e1eef3275fc1556dc4d74da48ad23f000fb9e330e72e60c3b753e` | `875c5760d77556585413c146dc814c448fad028aabcebf95e026659963a56df4` |
| audit_4 #1 | 2026-11-06T08:22:14 | `0x366046226F69872feEB43127423C208eE915bD1e` | 25 | 0.05 GEN | `449d5a2e28a05debf9697474a500385bde48d2276b1a56524bd64559c56f2d29` | `f828be7ae14bd037c92fe885de5fdaa4031a26417dbc8df7442d38b19b10cbad` |
| audit_4 #2 | 2026-11-06T08:22:43 | `0x366046226F69872feEB43127423C208eE915bD1e` | 25 | 0.05 GEN | `b0c121e3cfdbb360c2a1b4bcafdfa9524a5fed286c92ddb6b15e7eb059cac331` | `cf990451a18e81dda37e7ddff4d313188252dcf618a726ac868075e6136ffac1` |
| audit_4 #3 | 2026-11-06T08:23:00 | `0x366046226F69872feEB43127423C208eE915bD1e` | 25 | 0.05 GEN | `42b698fbb5c2c57fe07f997585181fdd5fe1441aa08f9e94f431c47c652e6205` | `b3f05b98ae6ea97d89ff4f77e0797c66988914d0bed6b3518e5a6c703bbd1a78` |
| audit_4 #4 | 2026-11-06T08:23:23 | `0x366046226F69872feEB43127423C208eE915bD1e` | 25 | 0.05 GEN | `8d91c662430314f9c6ce04c578fc00378c6ed15d202ed82fa8f8f0453ab423c2` | `d4567733e036522c38cec8f67747f7f0620254c5ed82b46053039b2f0da0dfd8` |
| audit_4 #5 | 2026-11-06T08:23:56 | `0x366046226F69872feEB43127423C208eE915bD1e` | 10 | 0.05 GEN | `a220c0165a6cc60787149cad328794b508471794bb174cc6081ee7f0363f3cd9` | `77a6ca2f907496ca5fc06258edc66afcd3a4e894f3c5f6e45fbbaca66a91c01e` |

### Balance reconciliation

`totals()` (open program pots plus GEN credited and not yet withdrawn) against the contract's on-chain balance, after every
transfer had finalized:

| Point | Expected | Contract balance | Match |
|---|---|---|---|
| after the refused programs: their GEN is credited to the sponsor | 6.05 GEN | 6.05 GEN | yes |
| after the sponsor withdrew: the contract kept nothing | 0 GEN | 0 GEN | yes |
| after the Figma audit | 3.05 GEN | 3.05 GEN | yes |
| after the audits: step rewards are credited | 3.05 GEN | 3.05 GEN | yes |
| end of run, after the auditors withdrew | 2.15 GEN | 2.15 GEN | yes |

Withdrawals: auditor was credited 0.4 GEN and its wallet balance rose by 0.4 GEN; bystander was credited 0.5 GEN and its wallet balance rose by 0.5 GEN.


### Every transaction

| Who | Call | GEN | Status | Result | Returned / refused | Tx |
|---|---|---|---|---|---|---|
| sponsor | `create_program("US pay transparency, fall 2026", "2026-02-31", 0.05 GEN, 40)` | 2 | ACCEPTED | SUCCESS | REFUNDED: ends must be a real calendar date written YYYY-MM-DD (your GEN is credited back: withdraw it) | [`0x54b22e0e…`](https://explorer-studio.genlayer.com/tx/0x54b22e0ef8ca9238faf3be8516a3a67857c41b1dc6db262d4e76613d5a36c377) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-05", 0.001 GEN, 40)` | 2 | ACCEPTED | SUCCESS | REFUNDED: reward must be at least 0.01 GEN (your GEN is credited back: withdraw it) | [`0x87720bf1…`](https://explorer-studio.genlayer.com/tx/0x87720bf12d35715446f76b7eb81daa15201df2473266528d5c4a2d2c4cea5454) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-05", 0.05 GEN, 0)` | 2 | ACCEPTED | SUCCESS | REFUNDED: per_auditor must be a whole number from 1 to 1000 (your GEN is credited back: withdraw it) | [`0xe4294f79…`](https://explorer-studio.genlayer.com/tx/0xe4294f79f0d251c683fed38e59dbf8265dc316fa6a0cebdadcb3f2100773b856) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-05", 0.05 GEN, 40)` | 0.05 | ACCEPTED | SUCCESS | REFUNDED: fund the program with at least one reward and at least 0.1 GEN (your GEN is credited back: withdraw it) | [`0xa0834a80…`](https://explorer-studio.genlayer.com/tx/0xa0834a802f8c5e5e4e5567744ba9ed2d0d1fd5ff89fc5cdfc5a8f3dcab718a10) |
| sponsor | `withdraw()` | 0 | ACCEPTED | SUCCESS | 6050000000000000000 | [`0x681e7c9f…`](https://explorer-studio.genlayer.com/tx/0x681e7c9f96424df038d0b18d1b561b85fe7a0d16ff3d20e1560b207e0cccafd1) |
| sponsor | `withdraw()` | 0 | ACCEPTED | ERROR | Nothing to withdraw | [`0x5ca90ec4…`](https://explorer-studio.genlayer.com/tx/0x5ca90ec4e36c4e1619515d877956682bfe5fc5aa475eca6924619946b64ca3b3) |
| sponsor | `create_program("US pay transparency, fall 2026", "2027-01-05", 0.05 GEN, 40)` | 2 | ACCEPTED | SUCCESS | program_0 | [`0x26634c83…`](https://explorer-studio.genlayer.com/tx/0x26634c83bf322a29ae0ae01f333511f336ff1574d1a09582f38bb383168549ec) |
| cofunder | `fund("program_0")` | 1 | ACCEPTED | SUCCESS | funded | [`0xf99695f5…`](https://explorer-studio.genlayer.com/tx/0xf99695f563027ce15d3ba3d3088ffe6f45bcb90b8b5108b700d1e827e3a60902) |
| bystander | `fund("program_0")` | 0.05 | ACCEPTED | SUCCESS | REFUNDED: Send at least 0.1 GEN to fund the program (your GEN is credited back: withdraw it) | [`0x06ca21ef…`](https://explorer-studio.genlayer.com/tx/0x06ca21ef3b7cd9b911d0b52b1d77547b404e62cf31fbf8e3bc69ced0c5459c2b) |
| auditor | `open_audit("program_0", "lever", "figma")` | 0 | ACCEPTED | ERROR | ats must be greenhouse or ashby | [`0xd9a3263b…`](https://explorer-studio.genlayer.com/tx/0xd9a3263b53f1eee709795b3a34906fa03f1493966d02ea78afd607d5caa170d4) |
| auditor | `open_audit("program_0", "greenhouse", "no-such-board-payclear")` | 0 | ACCEPTED | ERROR | greenhouse has no public job board named no-such-board-payclear | [`0xa785b19a…`](https://explorer-studio.genlayer.com/tx/0xa785b19a1e2f4c310ea747c4d6bbf967568e210f1f9ce6c3375255f60c2642b1) |
| auditor | `open_audit("program_0", "greenhouse", "figma")` | 0 | ACCEPTED | SUCCESS | audit_0 | [`0x0b1232fe…`](https://explorer-studio.genlayer.com/tx/0x0b1232fec3f7ca5ff8238c554d93bff2d26b49b55758369b0376b9b7a4a1a037) |
| bystander | `open_audit("program_0", "greenhouse", "figma")` | 0 | ACCEPTED | ERROR | audit_0 is still auditing this board | [`0x0e5835a5…`](https://explorer-studio.genlayer.com/tx/0x0e5835a508319cba5a8bd32ae7c506ae89dc672db452eeec3e9c8c9561e21145) |
| auditor | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0x97964d03…`](https://explorer-studio.genlayer.com/tx/0x97964d03c3cc6e9d7340602cb65d09d94d0a312b0d617f0fe0ec19b11db9f0b8) |
| bystander | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0x1a59c8ea…`](https://explorer-studio.genlayer.com/tx/0x1a59c8eab1e01108c86c8433acfcab726740ea285fe8098f836c8d2ed2a3e4c7) |
| auditor | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0xef3b072a…`](https://explorer-studio.genlayer.com/tx/0xef3b072a2d5c927d03cf9156d6f0c4767906a823011637450cf82bb214c36a76) |
| bystander | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | running | [`0x0b34e06f…`](https://explorer-studio.genlayer.com/tx/0x0b34e06fb0b280e1b7d8b47a46638d23669e68bb2ae2b89d2794f998eaa2a512) |
| auditor | `step("audit_0")` | 0 | ACCEPTED | SUCCESS | done | [`0x75251e1a…`](https://explorer-studio.genlayer.com/tx/0x75251e1add0a66b8cf18b778420f97634e2eeac1f7a33b58c9e55e669debafcc) |
| auditor | `recheck("audit_0", "5426468004")` | 0 | ACCEPTED | SUCCESS | range_listed | [`0x0d05a03f…`](https://explorer-studio.genlayer.com/tx/0x0d05a03fd26515080f6672718d5af16e21c406d092e2157de2c0028231fd5396) |
| bystander | `recheck("audit_0", "5426468004")` | 0 | ACCEPTED | ERROR | This posting has already been read again | [`0x2080b680…`](https://explorer-studio.genlayer.com/tx/0x2080b680d186ded79e4d692efde445274726a21496cee5378fb0566addb6d73f) |
| auditor | `open_audit("program_0", "greenhouse", "figma")` | 0 | ACCEPTED | ERROR | audit_0 audited this board on 2026-11-06; audit it again after 7 days | [`0x6590bd0e…`](https://explorer-studio.genlayer.com/tx/0x6590bd0e3d36ba15a24b3a7bc225e50e5dd5fb66ba4ff628b2fe5ec3c348e357) |
| auditor | `open_audit("program_0", "ashby", "supabase")` | 0 | ACCEPTED | SUCCESS | audit_1 | [`0x37f9f27d…`](https://explorer-studio.genlayer.com/tx/0x37f9f27d0a8009cf7235f924059a25959224d996feba429c77bc9225908b09ea) |
| auditor | `step("audit_1")` | 0 | ACCEPTED | SUCCESS | running | [`0x8bd3c52a…`](https://explorer-studio.genlayer.com/tx/0x8bd3c52a47d38928d3c9ca442118e8d34ebd6bc5d82211fca4eb59e88261ed42) |
| auditor | `step("audit_1")` | 0 | ACCEPTED | SUCCESS | done | [`0x3c62789e…`](https://explorer-studio.genlayer.com/tx/0x3c62789e672a9b8da8836b7c604a4a392d6c71981f667c52e9b55959cfe98535) |
| bystander | `open_audit("program_0", "ashby", "linear")` | 0 | ACCEPTED | SUCCESS | audit_2 | [`0x053fc3ba…`](https://explorer-studio.genlayer.com/tx/0x053fc3ba7c2a9ad7fe94220538b258ba8f1475ee6e5c0cb8741284e686e0bd5b) |
| bystander | `step("audit_2")` | 0 | ACCEPTED | SUCCESS | done | [`0x40efc4ae…`](https://explorer-studio.genlayer.com/tx/0x40efc4aed113aab0fa1ea853d82abb4af5d9d9e7330c904b8630cab5f3f85c9b) |
| auditor | `open_audit("program_0", "greenhouse", "airtable")` | 0 | ACCEPTED | SUCCESS | audit_3 | [`0x773e1481…`](https://explorer-studio.genlayer.com/tx/0x773e1481ecd068d6788902221e11559b1a993c2a6638f0a63b1f5fe26fe56346) |
| bystander | `open_audit("program_0", "greenhouse", "asana")` | 0 | ACCEPTED | SUCCESS | audit_4 | [`0x8a0a8fd5…`](https://explorer-studio.genlayer.com/tx/0x8a0a8fd5a8baaee26ab7bf6b208082ebe27834c0d2c5145372968f1e04e1be97) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | running | [`0xc9b1a27b…`](https://explorer-studio.genlayer.com/tx/0xc9b1a27b51a41a3614770932a8318378d653cb0f96710f399366a50e178d0445) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | running | [`0x47e8cc5a…`](https://explorer-studio.genlayer.com/tx/0x47e8cc5acaf9aef9a1d7cf4811b92e009cd540c0f02f2e5aefee8673c0c0db3f) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | running | [`0xb2ec0978…`](https://explorer-studio.genlayer.com/tx/0xb2ec09786d282b2d4e22dc8e8270695f7e862571794edd74c4372dfc0976e1b4) |
| bystander | `step("audit_4")` | 0 | ACCEPTED | SUCCESS | done | [`0x01759125…`](https://explorer-studio.genlayer.com/tx/0x01759125ded09a5c6f77a877cd113cc4e0e75160f3e7f7ef96833dc2c45a2ed8) |
| bystander | `close("program_0")` | 0 | ACCEPTED | ERROR | Audit steps are paid until 2027-01-05 | [`0xdb17d7de…`](https://explorer-studio.genlayer.com/tx/0xdb17d7dea301bdbafd80112e536eeefe6a4c8bf2f5866372fd2a11b4f33f4fea) |
| auditor | `withdraw()` | 0 | ACCEPTED | SUCCESS | 400000000000000000 | [`0xbd43661b…`](https://explorer-studio.genlayer.com/tx/0xbd43661b639cb56fe5842e212acba262de737cd4adce218cb3f352e2959a05d3) |
| bystander | `withdraw()` | 0 | ACCEPTED | SUCCESS | 500000000000000000 | [`0xca48bde1…`](https://explorer-studio.genlayer.com/tx/0xca48bde131873e293599d07af9c3592447ba6755e9521e90da224438f7937b4f) |
