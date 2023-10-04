# [5.31.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.30.0...v5.31.0) (2023-10-04)


### Bug Fixes

* Add ci ([#1](https://github.com/splunk/addonfactory-ucc-generator/issues/1)) ([41c5a1a](https://github.com/splunk/addonfactory-ucc-generator/commit/41c5a1a92a6d98bdf434be45399507e677ffadb5))
* add classNames and data-test attributes to elements for SmartX ([254a1d1](https://github.com/splunk/addonfactory-ucc-generator/commit/254a1d15d86be98746415390fc357e2a2f1acf19))
* add CSS id to  button ([6859943](https://github.com/splunk/addonfactory-ucc-generator/commit/6859943026f0b1c5b709e574d56b162fd2d1871c))
* add data-name attribute in ControlGroup for ease in writing automated UI tests ([10da489](https://github.com/splunk/addonfactory-ucc-generator/commit/10da489849040452dc2ace5bf728b68169edabe6))
* add data-test-loading for Select ([42a165d](https://github.com/splunk/addonfactory-ucc-generator/commit/42a165d5c8ce952aff03c7dee4baa0de3eb4d198))
* add ids to tab container in configuration page ([2a29d2f](https://github.com/splunk/addonfactory-ucc-generator/commit/2a29d2f6b084d4c718e50d2bb580fea5bde37e5f))
* add notice in release tarball ([a4590e5](https://github.com/splunk/addonfactory-ucc-generator/commit/a4590e56367ac3a2e49b09fb27344e01f655a91a))
* add schema.json in release tarball ([c474e7b](https://github.com/splunk/addonfactory-ucc-generator/commit/c474e7b3ca4e3e7001584674bdfc019435bfe908))
* added comment ([f96adf1](https://github.com/splunk/addonfactory-ucc-generator/commit/f96adf179aa8f0be76c3abc8d67e2f49b0c5d41a))
* added help text link support ([6c94df9](https://github.com/splunk/addonfactory-ucc-generator/commit/6c94df91297083b5ae505cf96ed1d5068019587e))
* ADDON-61204 Remove support of placeholder property ([2677cf9](https://github.com/splunk/addonfactory-ucc-generator/commit/2677cf9b19288f7121e9b01ee3b296bddc9edbe7))
* ADDON-61381 Fixed the design issue in Safari browser ([#386](https://github.com/splunk/addonfactory-ucc-generator/issues/386)) ([b6a7195](https://github.com/splunk/addonfactory-ucc-generator/commit/b6a7195dee7a91523782da7566b37d275ed5c6cf))
* ADDON-62193 encoded the redirect_uri upon opening the popup ([#401](https://github.com/splunk/addonfactory-ucc-generator/issues/401)) ([3be7506](https://github.com/splunk/addonfactory-ucc-generator/commit/3be7506255947ca4385eb8c4c24cf1963bf8288a))
* ADDON-62948 Added support for subTitle field in service ([#403](https://github.com/splunk/addonfactory-ucc-generator/issues/403)) ([d1a5af1](https://github.com/splunk/addonfactory-ucc-generator/commit/d1a5af12bcef08d66ccd1d85d8e166a2a1fd3222))
* ADDON-64637 add input value to query for menu navigation ([3ca0c43](https://github.com/splunk/addonfactory-ucc-generator/commit/3ca0c43ea571e483bcb3edfa14757f474b9ff465))
* bug fixes related to input and configuration page ([ca21343](https://github.com/splunk/addonfactory-ucc-generator/commit/ca2134350d4935cc6d5792e5b59c675d56f409cc))
* bugs ([56f5a79](https://github.com/splunk/addonfactory-ucc-generator/commit/56f5a79bc0545e1e251e404faf72f12708e84843))
* bump version ([90719c4](https://github.com/splunk/addonfactory-ucc-generator/commit/90719c4c9340ebe7146ce625936d16256dea49d7))
* change in order of validations ([1d10657](https://github.com/splunk/addonfactory-ucc-generator/commit/1d10657932fd9a5e2f99b3c8c08d0723e7dadbea))
* changed let to const to fix eslint error ([65ba327](https://github.com/splunk/addonfactory-ucc-generator/commit/65ba3274bcd128cffe9b2814f86cc43004ba1915))
* className missing in styled title and subtitle ([9328e85](https://github.com/splunk/addonfactory-ucc-generator/commit/9328e85b0d5f3440d626da1ae1a5cfce9dd27845))
* cleared fields for other authentication methods when using one ([deb2a54](https://github.com/splunk/addonfactory-ucc-generator/commit/deb2a541987cce747f2856200bf132c2aff22e66))
* **code:** ADDON-46211 Fiixed the issue to set the dynmic placeholder ([#117](https://github.com/splunk/addonfactory-ucc-generator/issues/117)) ([37e5488](https://github.com/splunk/addonfactory-ucc-generator/commit/37e54883a00369213b5007083cb9d3568925d2c3))
* **code:** ADDON-47626 Fixed the sorting issue for custom mapping ([#118](https://github.com/splunk/addonfactory-ucc-generator/issues/118)) ([97b5cb2](https://github.com/splunk/addonfactory-ucc-generator/commit/97b5cb2708234e2fd052fd0b7acf0919e66d0241))
* **CODE:** ADDON-47714 Fixed dependent field reset issue ([#120](https://github.com/splunk/addonfactory-ucc-generator/issues/120)) ([51d9f58](https://github.com/splunk/addonfactory-ucc-generator/commit/51d9f585b7fa0a19230672c89da31a33b27cd0b9))
* **CODE:** ADDON-56621 Fixed the account/appliance with same name as tabs name conflict ([#121](https://github.com/splunk/addonfactory-ucc-generator/issues/121)) ([ff1db3a](https://github.com/splunk/addonfactory-ucc-generator/commit/ff1db3ad14c0d2e62d8fd4a902d479925f6b2c6e))
* **CODE:** ADDON-56881 Fixed the line breaker issue ([#134](https://github.com/splunk/addonfactory-ucc-generator/issues/134)) ([28cff26](https://github.com/splunk/addonfactory-ucc-generator/commit/28cff265a373044bc3ede8be1f2960fe6c08473d))
* **CODE:** ADDON-57152 Fixed tabs clicking issue when style is set to page ([#170](https://github.com/splunk/addonfactory-ucc-generator/issues/170)) ([4974d59](https://github.com/splunk/addonfactory-ucc-generator/commit/4974d590f40a381a4c0cbc4e4c55832c42daea44))
* **CODE:** ADDON-57949 Fixed the custom menu with style property related issue ([#167](https://github.com/splunk/addonfactory-ucc-generator/issues/167)) ([cecb3f1](https://github.com/splunk/addonfactory-ucc-generator/commit/cecb3f1c412682e5ce5984faa6197446dbf7f183))
* **CODE:** ADDON-58763 Fixed typo ([#179](https://github.com/splunk/addonfactory-ucc-generator/issues/179)) ([1c74fae](https://github.com/splunk/addonfactory-ucc-generator/commit/1c74faee35389804e8cde9866299d2664c2a32a5))
* **CODE:** ADDON-58867 Fixed cancelling selected dropdown value ([#188](https://github.com/splunk/addonfactory-ucc-generator/issues/188)) ([0144432](https://github.com/splunk/addonfactory-ucc-generator/commit/0144432d20c11de1df353d96f962318e7e9b25ac))
* custom cell/row should re-render when row is updated ([d285772](https://github.com/splunk/addonfactory-ucc-generator/commit/d285772083de4639ea64cb09e3b43ca443657cc7))
* default to `basic` oauth_type if `undefined` to handle upgrade scenario for some add-ons ([db009eb](https://github.com/splunk/addonfactory-ucc-generator/commit/db009eb28ba405e60f101e7e3d40fbcfdd980bf8))
* dependabot alert for `postcss` ([b4126b7](https://github.com/splunk/addonfactory-ucc-generator/commit/b4126b7dbb002ea87d9b2a4ac842430ef33f64b0))
* dependabot reported security issues for `css-what` and `glob-parent` packages ([228b4c9](https://github.com/splunk/addonfactory-ucc-generator/commit/228b4c9b9faef6e6f20ebf8244935f3af6cd595d))
* downgrade splunkui to 4.0.0 ([80ef18f](https://github.com/splunk/addonfactory-ucc-generator/commit/80ef18fb852ae5d3c743e0adf01b1cf55c6d6c62))
* dynamically cleared out fields ([d12a970](https://github.com/splunk/addonfactory-ucc-generator/commit/d12a970d0119a34862829b29fcaaf20a8ca784cd))
* enforce logic for displaying clear button for singleselect when its disabled ([d430c85](https://github.com/splunk/addonfactory-ucc-generator/commit/d430c85ed03a9966bf2fbcd271509edfe1123379))
* enhance toast message for `MODE_CONFIG`, surround entity names in double quotes and remove optional placeholder for oauth fields as its conflicting ([e5fe24d](https://github.com/splunk/addonfactory-ucc-generator/commit/e5fe24dbaa7a4e4204c8f1398965bf0b802f5cc9))
* eslint and semgrep ([9b36bea](https://github.com/splunk/addonfactory-ucc-generator/commit/9b36beaaa90dbbdbbc1dcc4d96cacad60d116493))
* eslint failures ([b5edf0f](https://github.com/splunk/addonfactory-ucc-generator/commit/b5edf0f7805ee490b6f6e28fe9fb1e836426b776))
* fallback to latest form state if resthandler skips some table fields from response ([85a668c](https://github.com/splunk/addonfactory-ucc-generator/commit/85a668c3a9c0b9012cd7dde34b197c49501a8157))
* form submit should wait for state update from custom hook onSave ([9e19fa5](https://github.com/splunk/addonfactory-ucc-generator/commit/9e19fa5b61db7133f8e8ef2b0a1d2677c0c172e5))
* formatted the code ([c736188](https://github.com/splunk/addonfactory-ucc-generator/commit/c736188742a30a951dc8e5b271b21b3adc3c3f7e))
* handle value `undefined` in table sort ([05b854a](https://github.com/splunk/addonfactory-ucc-generator/commit/05b854abb2bfc75ef06ef5d0d058ef2640d8feff))
* handled validation of optional fields in case of null value ([18d0c35](https://github.com/splunk/addonfactory-ucc-generator/commit/18d0c3500043cc5fe7843a67bf4324be1200de0e))
* handled warnings and updated the changes ([c8240d5](https://github.com/splunk/addonfactory-ucc-generator/commit/c8240d53385e32615b2d581501351dda2a354231))
* Include license in pack ([0bcd002](https://github.com/splunk/addonfactory-ucc-generator/commit/0bcd002ae4297ce8c50c4400b6edb781717f307d))
* include license with output ([5fbaf98](https://github.com/splunk/addonfactory-ucc-generator/commit/5fbaf980c3f7c31e69e1c8593ba96404b6d7957a))
* keep only one way routing as done in ucc < 5 ([82b3aa7](https://github.com/splunk/addonfactory-ucc-generator/commit/82b3aa7abc1c6f4d3e2451bdff7986d37fe4ab25))
* load dependent fields on form create ([b85516d](https://github.com/splunk/addonfactory-ucc-generator/commit/b85516d9ddd4d3be6388bd0fa556678b5dbd2b32))
* missing files ([fc5a191](https://github.com/splunk/addonfactory-ucc-generator/commit/fc5a191dae46d7df691fe261b178744243002de1))
* moved location of redirect_page.js ([86b44f5](https://github.com/splunk/addonfactory-ucc-generator/commit/86b44f555044cd582ec9da4d0bfb0dba2b914d30))
* overrun ([570b447](https://github.com/splunk/addonfactory-ucc-generator/commit/570b44713a12543cbe35d94d3bd20d7adb0b9b5d))
* panels are required with at least 1 panel inside ([#382](https://github.com/splunk/addonfactory-ucc-generator/issues/382)) ([eff3566](https://github.com/splunk/addonfactory-ucc-generator/commit/eff3566a1c884726998aab8224a163996c9aa74e))
* parse boolean of `disabled` before setting it in state ([da76a93](https://github.com/splunk/addonfactory-ucc-generator/commit/da76a9380682c23635eea4bcb94145b7d1b9073f))
* pass `count` query param in rest to overcome default thirty records limit ([245a3d8](https://github.com/splunk/addonfactory-ucc-generator/commit/245a3d8a7071bb6c6b9ddfc265200c97d9b41a58))
* pass empty string to i18n if the field is optional ([c045d18](https://github.com/splunk/addonfactory-ucc-generator/commit/c045d1806ac4f0db0bdbc6d8410c177f8a778ec8))
* pass row and field to custom cell/row for processing on re-render ([f5a845e](https://github.com/splunk/addonfactory-ucc-generator/commit/f5a845e8849dbaeec170096ce0f4011bdb5bdb95))
* precedence of autoCompleteFields vs. endpointUrl and label-value mapping for handling form save without click or enter event on combobox option ([0db4606](https://github.com/splunk/addonfactory-ucc-generator/commit/0db4606cc514393fb6475e009e81bb28e4db97f6))
* precendence for multiselect items fetching ([02339bf](https://github.com/splunk/addonfactory-ucc-generator/commit/02339bfba0d2a74937934b97cbbd73d4f7306979))
* priority for placeholder of optional fields ([405db62](https://github.com/splunk/addonfactory-ucc-generator/commit/405db621a24c70dda81e413ccd84702c10af358b))
* remove extra rows which are empty in moreInfo ([5fbda62](https://github.com/splunk/addonfactory-ucc-generator/commit/5fbda626ec4fe0381c41b19a4e7a62fdf148bbfa))
* remove redirect_url field from conf file ([9be7d81](https://github.com/splunk/addonfactory-ucc-generator/commit/9be7d817e778e32dcb23cd6628efc18df98f84e9))
* remove unused code comments ([b4752d3](https://github.com/splunk/addonfactory-ucc-generator/commit/b4752d334c0ab8ef38c7ef9bebe3c70be08e0843))
* resolve missed `type` param for custom input row feature ([#84](https://github.com/splunk/addonfactory-ucc-generator/issues/84)) ([fe17252](https://github.com/splunk/addonfactory-ucc-generator/commit/fe172524fe103a1b06eff0e9120eb770fad83cee))
* revert "feat: ADDON-61556 Introduced checkbox group component ([#394](https://github.com/splunk/addonfactory-ucc-generator/issues/394))" ([#428](https://github.com/splunk/addonfactory-ucc-generator/issues/428)) ([358b1be](https://github.com/splunk/addonfactory-ucc-generator/commit/358b1bed6f590e821644ce654387b0b648aa386c))
* revert 0497ac4e2e961ac141307a3ab7e6790e9bd31705 ([#309](https://github.com/splunk/addonfactory-ucc-generator/issues/309)) ([e77242f](https://github.com/splunk/addonfactory-ucc-generator/commit/e77242f0ac6ad0a5bb0c2425eb99994eace97ecf))
* **routing:** handle record param deletion on wrong tab and fix tab change due to missing dep in useCallback ([a9fe88b](https://github.com/splunk/addonfactory-ucc-generator/commit/a9fe88be2c3576cfdc30ee6e1f4ee60cf54c3800))
* **schema.json:** add required configuration field ([#442](https://github.com/splunk/addonfactory-ucc-generator/issues/442)) ([c3af60b](https://github.com/splunk/addonfactory-ucc-generator/commit/c3af60b9c1c587d5882cc67a99772f9a96711b08))
* security warning for @npmcli/git ([e6847a6](https://github.com/splunk/addonfactory-ucc-generator/commit/e6847a672319b5378c81705c7cdb1357ef53db52))
* singleSelect null value not being posted in form submit and add mapping support for heading in globalConfig ([94e11c3](https://github.com/splunk/addonfactory-ucc-generator/commit/94e11c3207e78bbcf310501ad7ea985c9149b437))
* skip `null` value fields from displaying in table expansion row ([7448eb8](https://github.com/splunk/addonfactory-ucc-generator/commit/7448eb8d84b27cea225b01b72dffc7a8d6922321))
* **smartx:** add selectors for better testing ([ed2c153](https://github.com/splunk/addonfactory-ucc-generator/commit/ed2c153c5c89956c98c06675b9b734002806f158))
* toast notification not displaying when table is missing ([67b3f12](https://github.com/splunk/addonfactory-ucc-generator/commit/67b3f12f68d687d96e75c7850a4f84b4ee252849))
* typo in comment for base form sumbitting ([d8634a1](https://github.com/splunk/addonfactory-ucc-generator/commit/d8634a12f38cf0926296edb3acb1e8a927e72db3))
* UI breaking when globalConfig does not have inputs config ([7cf8708](https://github.com/splunk/addonfactory-ucc-generator/commit/7cf8708ee6730b9bcefa1e0cdcd02b02f737f58a))
* update form hook onCreate error handling ([4a66418](https://github.com/splunk/addonfactory-ucc-generator/commit/4a6641827108055980be62e8920d9652431dff3a))
* update license files ([09ac164](https://github.com/splunk/addonfactory-ucc-generator/commit/09ac164d9248cdb29b3d3fe0e5e752e2523de7a9))
* update license in package ([0778aea](https://github.com/splunk/addonfactory-ucc-generator/commit/0778aeac3e830046b95f0e35265bb9d75150ae43))
* update notice file ([79c5e74](https://github.com/splunk/addonfactory-ucc-generator/commit/79c5e745eff0c0306dc42bf9b36b86b9580f73e6))
* update notice file ([a0b6d3f](https://github.com/splunk/addonfactory-ucc-generator/commit/a0b6d3f1fc34d0f9dd649d1830869f15dfe8d9ec))
* update notice file ([d78e9a3](https://github.com/splunk/addonfactory-ucc-generator/commit/d78e9a339a6355bcaacf04cc9b5698bb42481442))
* update notice file ([840796a](https://github.com/splunk/addonfactory-ucc-generator/commit/840796a0afc14be9b337ef8ced53f1d9a18dd6a6))
* Update NOTICE file ([#29](https://github.com/splunk/addonfactory-ucc-generator/issues/29)) ([676d4c0](https://github.com/splunk/addonfactory-ucc-generator/commit/676d4c0f918d49e9a13dc6186cdaba0b9500442a))
* update react ui version to 4.0.0 ([78c4c10](https://github.com/splunk/addonfactory-ucc-generator/commit/78c4c10c694c600a9f45891f4ad513c3c288db63))
* update react-ui version, add class to title and subtitle components and update error message ([b79a6f5](https://github.com/splunk/addonfactory-ucc-generator/commit/b79a6f50f73a133faac8da02a9faf4fda48f1ea5))
* updated changes and added text with link support ([e14c940](https://github.com/splunk/addonfactory-ucc-generator/commit/e14c940df196e8425541d998ebed469123c5f2fb))
* updated review changes ([85030c3](https://github.com/splunk/addonfactory-ucc-generator/commit/85030c393cd53fdd46f8ee564ae882ec9a7247ca))
* updated review changes ([1ea41a6](https://github.com/splunk/addonfactory-ucc-generator/commit/1ea41a6f97162f8a64e6241a7556e5b5dfeb815b))
* updated textbox width and changed field value for custom cell ([713954e](https://github.com/splunk/addonfactory-ucc-generator/commit/713954eae00bdcd07cce9b361745aed328640a1d))
* variable naming for status mapping ([74c7c6a](https://github.com/splunk/addonfactory-ucc-generator/commit/74c7c6a1eef61abd53ffdce63266dd03d36105a0))


### Features

* add ComboBox and Select conditional rendering based on globalConfig options ([dbca65a](https://github.com/splunk/addonfactory-ucc-generator/commit/dbca65a1949d4e9ad4a2c500d586e26f5d0049d8))
* add DashboardPanel-s to dashboard ([#381](https://github.com/splunk/addonfactory-ucc-generator/issues/381)) ([882f952](https://github.com/splunk/addonfactory-ucc-generator/commit/882f9523d03377c19ca0ec3044008d4c139766c2))
* add label support for ([ccb1a4d](https://github.com/splunk/addonfactory-ucc-generator/commit/ccb1a4deba551b7a94b1e875e4febeb46214d2ba))
* add meta.checkForUpdates field ([#433](https://github.com/splunk/addonfactory-ucc-generator/issues/433)) ([5d92e96](https://github.com/splunk/addonfactory-ucc-generator/commit/5d92e96d65b24332c9b501d81ac5325f2461eaca))
* add new default XML file without input ([#114](https://github.com/splunk/addonfactory-ucc-generator/issues/114)) ([a359a0e](https://github.com/splunk/addonfactory-ucc-generator/commit/a359a0ed9d73eeb5b7648d6081d74c45bb5230c8))
* add support for globalConfig.yaml as well as JSON ([#116](https://github.com/splunk/addonfactory-ucc-generator/issues/116)) ([725bc5c](https://github.com/splunk/addonfactory-ucc-generator/commit/725bc5cf37eabf21e8484e838339aeaedc34d420))
* add support of `required` param in oauth config ([f5bdce3](https://github.com/splunk/addonfactory-ucc-generator/commit/f5bdce31a4f6319f4ce0e855e61c4246483dbc62))
* add UI feature to enable/disable inputs in bulk ([#437](https://github.com/splunk/addonfactory-ucc-generator/issues/437)) ([ab471d0](https://github.com/splunk/addonfactory-ucc-generator/commit/ab471d015fb4fd07e0a8f0d54be04c6293f321f1))
* Added support of group fields ([b297deb](https://github.com/splunk/addonfactory-ucc-generator/commit/b297deb0a257164d92f02aec31ce0db024eac7fd))
* **ADDON-37808:** enhance UX and UI for the error pages ([ec702f5](https://github.com/splunk/addonfactory-ucc-generator/commit/ec702f5a62850ab4de1d3b430042d5f3c24d8dac))
* ADDON-57046: Added file input component ([#187](https://github.com/splunk/addonfactory-ucc-generator/issues/187)) ([e0fb336](https://github.com/splunk/addonfactory-ucc-generator/commit/e0fb33697a2a8c5baa84450f636c2bf50bf2c0dd))
* ADDON-57152 added tabs feature in the Inputs page ([#133](https://github.com/splunk/addonfactory-ucc-generator/issues/133)) ([a3d9cb1](https://github.com/splunk/addonfactory-ucc-generator/commit/a3d9cb16cc2df398f3abf2327e0504ad256b6638))
* ADDON-61556 Introduced checkbox group component ([#394](https://github.com/splunk/addonfactory-ucc-generator/issues/394)) ([9ffed80](https://github.com/splunk/addonfactory-ucc-generator/commit/9ffed80d80d9ac4fbff22fa47d464391c1c14233))
* ADDON-62948 Added support for subTitle field in service ([#402](https://github.com/splunk/addonfactory-ucc-generator/issues/402)) ([6acd7cd](https://github.com/splunk/addonfactory-ucc-generator/commit/6acd7cd5cb9879e93d93d358eab615791a87581c))
* ADDON-65006 add group name to URL when redirecting with Menu ([#429](https://github.com/splunk/addonfactory-ucc-generator/issues/429)) ([9130b01](https://github.com/splunk/addonfactory-ucc-generator/commit/9130b0187787740089e85c3ff5267226c5e66491))
* allow esm JS modules as custom ui extensions to support external deps ([a2cc734](https://github.com/splunk/addonfactory-ucc-generator/commit/a2cc73466c862c6a31ac1e1673c5c313c82734dc))
* apiVersion is not required anymore ([6d4bf23](https://github.com/splunk/addonfactory-ucc-generator/commit/6d4bf2335bf7e1435a9095bec1509ce2591ed697))
* **CODE:** ADDON-57044 Added new support for Textarea field ([#180](https://github.com/splunk/addonfactory-ucc-generator/issues/180)) ([69a62b5](https://github.com/splunk/addonfactory-ucc-generator/commit/69a62b542b9f05722bc395d3c4608e4dbc8ef18a))
* **CODE:** ADDON-58172 Version bump all the deps ([#175](https://github.com/splunk/addonfactory-ucc-generator/issues/175)) ([50d98f8](https://github.com/splunk/addonfactory-ucc-generator/commit/50d98f8152e2f4e327209b7a2875142aeaf944b0))
* **CODE:** ADDON-58506 Improve table using docked property ([#181](https://github.com/splunk/addonfactory-ucc-generator/issues/181)) ([041452f](https://github.com/splunk/addonfactory-ucc-generator/commit/041452f378816f68d4677e4bb13cd0ea418f823e))
* codeql ([729f42e](https://github.com/splunk/addonfactory-ucc-generator/commit/729f42e1b666854e78eb3f403be14631eef1f79d))
* Custom menu implementation ([58b0571](https://github.com/splunk/addonfactory-ucc-generator/commit/58b0571edf2327911cde48f142720a4c440bf6e0))
* First checking ([5648478](https://github.com/splunk/addonfactory-ucc-generator/commit/5648478ea7e3d2f74ad17eea649eea03fd27162e))
* publish JS dependencies to appserver/package/static/js/dependencies.txt ([#103](https://github.com/splunk/addonfactory-ucc-generator/issues/103)) ([3236b1b](https://github.com/splunk/addonfactory-ucc-generator/commit/3236b1b200b4c6c5e38aea07cde3225e4dea4dc7))
* release v1.19.0 ([#218](https://github.com/splunk/addonfactory-ucc-generator/issues/218)) ([e23fbc6](https://github.com/splunk/addonfactory-ucc-generator/commit/e23fbc6f672b4defeb716e3a98933297c0dd492a)), closes [#201](https://github.com/splunk/addonfactory-ucc-generator/issues/201) [#207](https://github.com/splunk/addonfactory-ucc-generator/issues/207) [#208](https://github.com/splunk/addonfactory-ucc-generator/issues/208) [#209](https://github.com/splunk/addonfactory-ucc-generator/issues/209) [#210](https://github.com/splunk/addonfactory-ucc-generator/issues/210) [#211](https://github.com/splunk/addonfactory-ucc-generator/issues/211) [#212](https://github.com/splunk/addonfactory-ucc-generator/issues/212) [#217](https://github.com/splunk/addonfactory-ucc-generator/issues/217)
* release v1.20.0 ([#236](https://github.com/splunk/addonfactory-ucc-generator/issues/236)) ([996a463](https://github.com/splunk/addonfactory-ucc-generator/commit/996a463dd2de9929a379d98938457544e72bcf87)), closes [#224](https://github.com/splunk/addonfactory-ucc-generator/issues/224) [#225](https://github.com/splunk/addonfactory-ucc-generator/issues/225) [#226](https://github.com/splunk/addonfactory-ucc-generator/issues/226)
* release v1.21.0 ([#271](https://github.com/splunk/addonfactory-ucc-generator/issues/271)) ([0e5df40](https://github.com/splunk/addonfactory-ucc-generator/commit/0e5df4022477c6da6dff3bc96034aa9e40a78f46)), closes [#238](https://github.com/splunk/addonfactory-ucc-generator/issues/238) [#239](https://github.com/splunk/addonfactory-ucc-generator/issues/239) [#240](https://github.com/splunk/addonfactory-ucc-generator/issues/240) [#249](https://github.com/splunk/addonfactory-ucc-generator/issues/249) [#250](https://github.com/splunk/addonfactory-ucc-generator/issues/250) [#251](https://github.com/splunk/addonfactory-ucc-generator/issues/251) [#252](https://github.com/splunk/addonfactory-ucc-generator/issues/252) [#258](https://github.com/splunk/addonfactory-ucc-generator/issues/258)
* release v1.22.0 ([#293](https://github.com/splunk/addonfactory-ucc-generator/issues/293)) ([9589e4a](https://github.com/splunk/addonfactory-ucc-generator/commit/9589e4ab4581444750e6e48464c499deb5db7381)), closes [#281](https://github.com/splunk/addonfactory-ucc-generator/issues/281) [#282](https://github.com/splunk/addonfactory-ucc-generator/issues/282) [#283](https://github.com/splunk/addonfactory-ucc-generator/issues/283) [#291](https://github.com/splunk/addonfactory-ucc-generator/issues/291) [#294](https://github.com/splunk/addonfactory-ucc-generator/issues/294)
* release v1.23.0 ([#306](https://github.com/splunk/addonfactory-ucc-generator/issues/306)) ([7af8c06](https://github.com/splunk/addonfactory-ucc-generator/commit/7af8c064a26fb990b2c4ec935623d89bdd8cd5bb)), closes [#295](https://github.com/splunk/addonfactory-ucc-generator/issues/295) [#297](https://github.com/splunk/addonfactory-ucc-generator/issues/297) [#296](https://github.com/splunk/addonfactory-ucc-generator/issues/296) [#305](https://github.com/splunk/addonfactory-ucc-generator/issues/305)
* release v1.24.0 ([#342](https://github.com/splunk/addonfactory-ucc-generator/issues/342)) ([dff3799](https://github.com/splunk/addonfactory-ucc-generator/commit/dff3799fac7549ae213047681b667a2f761a23b5)), closes [#328](https://github.com/splunk/addonfactory-ucc-generator/issues/328) [#333](https://github.com/splunk/addonfactory-ucc-generator/issues/333)
* release v1.25.0 ([#362](https://github.com/splunk/addonfactory-ucc-generator/issues/362)) ([305e13b](https://github.com/splunk/addonfactory-ucc-generator/commit/305e13ba42049b1520cedb60201ae3de3bd81294)), closes [#360](https://github.com/splunk/addonfactory-ucc-generator/issues/360) [#361](https://github.com/splunk/addonfactory-ucc-generator/issues/361)
* Resolved comments ([6e7e424](https://github.com/splunk/addonfactory-ucc-generator/commit/6e7e4242e9715724b8f2eafd2c0968b7f50c725b))
* Resolved review comments ([5998974](https://github.com/splunk/addonfactory-ucc-generator/commit/5998974e828ab710c918dd96112a1c4519066b3d))
* search internal logs button ([#371](https://github.com/splunk/addonfactory-ucc-generator/issues/371)) ([439b0f6](https://github.com/splunk/addonfactory-ucc-generator/commit/439b0f695724cdb87935993452eec4f80b2afa42))
* support custom REST handlers ([#127](https://github.com/splunk/addonfactory-ucc-generator/issues/127)) ([9b7ee29](https://github.com/splunk/addonfactory-ucc-generator/commit/9b7ee29bb82bc6a3f25132557b8182371b38e907))
* support placeholder entity type ([dd79c29](https://github.com/splunk/addonfactory-ucc-generator/commit/dd79c29017ffa37b8ab67488ebf40a9e9374eb63))
* support placeholder in `globalConfig.json` for oauth fields ([8c90380](https://github.com/splunk/addonfactory-ucc-generator/commit/8c903800c9b567292ebc18bb7e070f79dd1f1e79))
* trigger release (checkbox groups feature) ([#440](https://github.com/splunk/addonfactory-ucc-generator/issues/440)) ([3c55957](https://github.com/splunk/addonfactory-ucc-generator/commit/3c559572c7b3db315bd9b0b12a24239ec2dc586b))
* Updated dependencies ([ea02b95](https://github.com/splunk/addonfactory-ucc-generator/commit/ea02b95c6b6647c5928aa2e4d4973e8722531073))
* use lazy loading for custom ui extensions ([7b3f349](https://github.com/splunk/addonfactory-ucc-generator/commit/7b3f3494f5b66ecd997d8b8dba86a993222df8ff))

# [5.30.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.29.0...v5.30.0) (2023-10-01)


### Features

* release v5.30.0 ([#848](https://github.com/splunk/addonfactory-ucc-generator/issues/848)) ([fb93601](https://github.com/splunk/addonfactory-ucc-generator/commit/fb93601573c1083bdb4cdffaea1df8ac00009db8)), closes [#846](https://github.com/splunk/addonfactory-ucc-generator/issues/846) [#847](https://github.com/splunk/addonfactory-ucc-generator/issues/847) [#849](https://github.com/splunk/addonfactory-ucc-generator/issues/849) [#850](https://github.com/splunk/addonfactory-ucc-generator/issues/850)

# [5.29.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.6...v5.29.0) (2023-09-22)


### Features

* release v5.29.0 ([#840](https://github.com/splunk/addonfactory-ucc-generator/issues/840)) ([c874f86](https://github.com/splunk/addonfactory-ucc-generator/commit/c874f861426203d806f928dc7790a670872d8733)), closes [#835](https://github.com/splunk/addonfactory-ucc-generator/issues/835) [#836](https://github.com/splunk/addonfactory-ucc-generator/issues/836) [#838](https://github.com/splunk/addonfactory-ucc-generator/issues/838) [#839](https://github.com/splunk/addonfactory-ucc-generator/issues/839)

## [5.28.6](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.5...v5.28.6) (2023-09-13)


### Bug Fixes

* update UCC UI to v1.29.2 ([#829](https://github.com/splunk/addonfactory-ucc-generator/issues/829)) ([bffdc74](https://github.com/splunk/addonfactory-ucc-generator/commit/bffdc741c09cdeb3e61f6d567eded848cab3afb2))

## [5.28.5](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.4...v5.28.5) (2023-09-06)


### Bug Fixes

* update pip upgrade command ([#825](https://github.com/splunk/addonfactory-ucc-generator/issues/825)) ([b439296](https://github.com/splunk/addonfactory-ucc-generator/commit/b439296ee9c85d0fa1d9c64189bc257c736d1a4b)), closes [#821](https://github.com/splunk/addonfactory-ucc-generator/issues/821)

## [5.28.4](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.3...v5.28.4) (2023-07-19)


### Bug Fixes

* add-on without globalConfig file should not be visible ([#811](https://github.com/splunk/addonfactory-ucc-generator/issues/811)) ([b2017f6](https://github.com/splunk/addonfactory-ucc-generator/commit/b2017f6fe758b86df870396911ddf5b47ee40aa8))

## [5.28.3](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.2...v5.28.3) (2023-07-17)


### Bug Fixes

* resolve failing ucc-gen by pinning pip version ([#809](https://github.com/splunk/addonfactory-ucc-generator/issues/809)) ([33676a9](https://github.com/splunk/addonfactory-ucc-generator/commit/33676a90c1748c0cf5a15f03cba23266116b717b)), closes [#808](https://github.com/splunk/addonfactory-ucc-generator/issues/808)

## [5.28.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.1...v5.28.2) (2023-07-07)


### Bug Fixes

* input.template should not render interval field ([#799](https://github.com/splunk/addonfactory-ucc-generator/issues/799)) ([6375de1](https://github.com/splunk/addonfactory-ucc-generator/commit/6375de1537236fa2eb0d8f62bbc2b0fbafd9e198))

## [5.28.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.0...v5.28.1) (2023-06-22)


### Bug Fixes

* typo in UCC UI v1.28.0 ([#791](https://github.com/splunk/addonfactory-ucc-generator/issues/791)) ([7bb4530](https://github.com/splunk/addonfactory-ucc-generator/commit/7bb4530e87314599a2e71ef985890d585bd0a825))

# [5.28.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.27.3...v5.28.0) (2023-06-22)


### Features

* added support for subTitle field in service ([#790](https://github.com/splunk/addonfactory-ucc-generator/issues/790)) ([378f362](https://github.com/splunk/addonfactory-ucc-generator/commit/378f362109a49e2bb6dc6f01d5b3c4c851a40e19))

## [5.27.3](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.27.2...v5.27.3) (2023-06-06)


### Bug Fixes

* change modular input template according to globalConfig file ([#787](https://github.com/splunk/addonfactory-ucc-generator/issues/787)) ([24c8658](https://github.com/splunk/addonfactory-ucc-generator/commit/24c865828b9df8ef98a9310d0c86398a02e93fb5))

## [5.27.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.27.1...v5.27.2) (2023-06-02)


### Bug Fixes

* update UCC UI to v1.27.1 ([#785](https://github.com/splunk/addonfactory-ucc-generator/issues/785)) ([ce25019](https://github.com/splunk/addonfactory-ucc-generator/commit/ce25019ae0c07551e13da6201d88c16e1acfef6f))

## [5.27.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.27.0...v5.27.1) (2023-05-26)


### Bug Fixes

* require requests 2.31.0 and urllib3 < 2 ([#783](https://github.com/splunk/addonfactory-ucc-generator/issues/783)) ([7f4e778](https://github.com/splunk/addonfactory-ucc-generator/commit/7f4e778015f49cb46009619b9ffbb0d693f5fe2d))

# [5.27.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.26.0...v5.27.0) (2023-05-17)


### Features

* release v5.27.0 ([#765](https://github.com/splunk/addonfactory-ucc-generator/issues/765)) ([5b55833](https://github.com/splunk/addonfactory-ucc-generator/commit/5b55833086966984acb0526a5708abb599fc1899)), closes [#749](https://github.com/splunk/addonfactory-ucc-generator/issues/749) [#750](https://github.com/splunk/addonfactory-ucc-generator/issues/750) [#751](https://github.com/splunk/addonfactory-ucc-generator/issues/751) [#752](https://github.com/splunk/addonfactory-ucc-generator/issues/752) [#753](https://github.com/splunk/addonfactory-ucc-generator/issues/753) [#754](https://github.com/splunk/addonfactory-ucc-generator/issues/754) [/dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/#JSON-schema-200](https://github.com//dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest//issues/JSON-schema-200) [#755](https://github.com/splunk/addonfactory-ucc-generator/issues/755)

# [5.26.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.25.0...v5.26.0) (2023-05-02)


### Features

* create openapi such way that generated client code allows to update configuration and inputs ([#740](https://github.com/splunk/addonfactory-ucc-generator/issues/740)) ([c412a60](https://github.com/splunk/addonfactory-ucc-generator/commit/c412a601deaf3fd5eed79f45724d942328127a64))
* GET methods and responses allow to get data ([#742](https://github.com/splunk/addonfactory-ucc-generator/issues/742)) ([6fe35cd](https://github.com/splunk/addonfactory-ucc-generator/commit/6fe35cd5d46606ef800e708c58646eb7b04b1e31))

# [5.25.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.24.0...v5.25.0) (2023-04-18)


### Features

* release v5.25.0 ([#733](https://github.com/splunk/addonfactory-ucc-generator/issues/733)) ([6b3e649](https://github.com/splunk/addonfactory-ucc-generator/commit/6b3e6496dc78728393737569cc9c1cbd14159e66)), closes [#718](https://github.com/splunk/addonfactory-ucc-generator/issues/718) [#719](https://github.com/splunk/addonfactory-ucc-generator/issues/719) [#722](https://github.com/splunk/addonfactory-ucc-generator/issues/722) [#723](https://github.com/splunk/addonfactory-ucc-generator/issues/723) [#724](https://github.com/splunk/addonfactory-ucc-generator/issues/724) [#726](https://github.com/splunk/addonfactory-ucc-generator/issues/726) [#727](https://github.com/splunk/addonfactory-ucc-generator/issues/727) [#725](https://github.com/splunk/addonfactory-ucc-generator/issues/725) [#728](https://github.com/splunk/addonfactory-ucc-generator/issues/728) [#734](https://github.com/splunk/addonfactory-ucc-generator/issues/734) [#735](https://github.com/splunk/addonfactory-ucc-generator/issues/735)

# [5.24.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.23.2...v5.24.0) (2023-04-04)


### Features

* release v5.24.0 ([#713](https://github.com/splunk/addonfactory-ucc-generator/issues/713)) ([e5bc2f1](https://github.com/splunk/addonfactory-ucc-generator/commit/e5bc2f1a02a496e8abead872641eec047784b17d)), closes [#709](https://github.com/splunk/addonfactory-ucc-generator/issues/709) [#710](https://github.com/splunk/addonfactory-ucc-generator/issues/710) [#711](https://github.com/splunk/addonfactory-ucc-generator/issues/711) [#712](https://github.com/splunk/addonfactory-ucc-generator/issues/712) [#714](https://github.com/splunk/addonfactory-ucc-generator/issues/714)

## [5.23.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.23.1...v5.23.2) (2023-03-23)


### Bug Fixes

* move mkdocs-material to dev dependency ([#707](https://github.com/splunk/addonfactory-ucc-generator/issues/707)) ([504dbfa](https://github.com/splunk/addonfactory-ucc-generator/commit/504dbfae57393340636473c8196b452a1f539972))

## [5.23.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.23.0...v5.23.1) (2023-03-20)


### Bug Fixes

* dropdownlist_splunk_search does not require options ([#706](https://github.com/splunk/addonfactory-ucc-generator/issues/706)) ([ff9e50b](https://github.com/splunk/addonfactory-ucc-generator/commit/ff9e50b36846c7bf7fea6ef30fef0b2251fb6d1a))

# [5.23.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.22.0...v5.23.0) (2023-03-20)


### Features

* release v5.23.0 ([#705](https://github.com/splunk/addonfactory-ucc-generator/issues/705)) ([f8211f6](https://github.com/splunk/addonfactory-ucc-generator/commit/f8211f663bd79ec186a9ebfe0185876f2d40e93b)), closes [#699](https://github.com/splunk/addonfactory-ucc-generator/issues/699) [#700](https://github.com/splunk/addonfactory-ucc-generator/issues/700) [#703](https://github.com/splunk/addonfactory-ucc-generator/issues/703) [#704](https://github.com/splunk/addonfactory-ucc-generator/issues/704) [#702](https://github.com/splunk/addonfactory-ucc-generator/issues/702) [#701](https://github.com/splunk/addonfactory-ucc-generator/issues/701)

# [5.22.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.21.0...v5.22.0) (2023-03-09)


### Features

* v5.22.0 release ([#678](https://github.com/splunk/addonfactory-ucc-generator/issues/678)) ([9efc0c2](https://github.com/splunk/addonfactory-ucc-generator/commit/9efc0c21d300d168f83d4eb06a5d6605f57c081b)), closes [#662](https://github.com/splunk/addonfactory-ucc-generator/issues/662) [#663](https://github.com/splunk/addonfactory-ucc-generator/issues/663) [#664](https://github.com/splunk/addonfactory-ucc-generator/issues/664) [#665](https://github.com/splunk/addonfactory-ucc-generator/issues/665) [#666](https://github.com/splunk/addonfactory-ucc-generator/issues/666) [#667](https://github.com/splunk/addonfactory-ucc-generator/issues/667) [#668](https://github.com/splunk/addonfactory-ucc-generator/issues/668) [#669](https://github.com/splunk/addonfactory-ucc-generator/issues/669) [#670](https://github.com/splunk/addonfactory-ucc-generator/issues/670) [#672](https://github.com/splunk/addonfactory-ucc-generator/issues/672) [#673](https://github.com/splunk/addonfactory-ucc-generator/issues/673) [#671](https://github.com/splunk/addonfactory-ucc-generator/issues/671) [#674](https://github.com/splunk/addonfactory-ucc-generator/issues/674) [#677](https://github.com/splunk/addonfactory-ucc-generator/issues/677) [#679](https://github.com/splunk/addonfactory-ucc-generator/issues/679) [#680](https://github.com/splunk/addonfactory-ucc-generator/issues/680) [#681](https://github.com/splunk/addonfactory-ucc-generator/issues/681) [#682](https://github.com/splunk/addonfactory-ucc-generator/issues/682) [#683](https://github.com/splunk/addonfactory-ucc-generator/issues/683) [#684](https://github.com/splunk/addonfactory-ucc-generator/issues/684) [#685](https://github.com/splunk/addonfactory-ucc-generator/issues/685) [#686](https://github.com/splunk/addonfactory-ucc-generator/issues/686) [#688](https://github.com/splunk/addonfactory-ucc-generator/issues/688) [#689](https://github.com/splunk/addonfactory-ucc-generator/issues/689) [#687](https://github.com/splunk/addonfactory-ucc-generator/issues/687) [#690](https://github.com/splunk/addonfactory-ucc-generator/issues/690) [#691](https://github.com/splunk/addonfactory-ucc-generator/issues/691) [#693](https://github.com/splunk/addonfactory-ucc-generator/issues/693) [#694](https://github.com/splunk/addonfactory-ucc-generator/issues/694) [#695](https://github.com/splunk/addonfactory-ucc-generator/issues/695) [#692](https://github.com/splunk/addonfactory-ucc-generator/issues/692) [#697](https://github.com/splunk/addonfactory-ucc-generator/issues/697)

# [5.21.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.20.0...v5.21.0) (2023-02-22)


### Features

* release v5.21.0 ([#659](https://github.com/splunk/addonfactory-ucc-generator/issues/659)) ([fdd7164](https://github.com/splunk/addonfactory-ucc-generator/commit/fdd7164548e3ac874c50d005e64979576ab38864)), closes [#656](https://github.com/splunk/addonfactory-ucc-generator/issues/656) [#658](https://github.com/splunk/addonfactory-ucc-generator/issues/658) [#657](https://github.com/splunk/addonfactory-ucc-generator/issues/657) [#650](https://github.com/splunk/addonfactory-ucc-generator/issues/650)

# [5.20.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.19.0...v5.20.0) (2023-02-13)


### Features

* release v5.20.0 ([#634](https://github.com/splunk/addonfactory-ucc-generator/issues/634)) ([e2a389d](https://github.com/splunk/addonfactory-ucc-generator/commit/e2a389df3f107dc01f7d2210fc45bbad82ae58b1)), closes [#624](https://github.com/splunk/addonfactory-ucc-generator/issues/624) [#626](https://github.com/splunk/addonfactory-ucc-generator/issues/626) [#615](https://github.com/splunk/addonfactory-ucc-generator/issues/615) [#618](https://github.com/splunk/addonfactory-ucc-generator/issues/618) [#612](https://github.com/splunk/addonfactory-ucc-generator/issues/612) [#629](https://github.com/splunk/addonfactory-ucc-generator/issues/629) [#632](https://github.com/splunk/addonfactory-ucc-generator/issues/632) [#633](https://github.com/splunk/addonfactory-ucc-generator/issues/633)
* trigger v5.20.0 release ([#635](https://github.com/splunk/addonfactory-ucc-generator/issues/635)) ([d07f487](https://github.com/splunk/addonfactory-ucc-generator/commit/d07f4874fdbb04e595045b1f7839c378be555b3e))

# [5.19.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.18.0...v5.19.0) (2023-01-03)


### Features

* release v5.19.0 ([#601](https://github.com/splunk/addonfactory-ucc-generator/issues/601)) ([2dc1ae1](https://github.com/splunk/addonfactory-ucc-generator/commit/2dc1ae16b8b69d09d386802e7030b4d9a1718992)), closes [#593](https://github.com/splunk/addonfactory-ucc-generator/issues/593) [#594](https://github.com/splunk/addonfactory-ucc-generator/issues/594) [#595](https://github.com/splunk/addonfactory-ucc-generator/issues/595) [/github.com/splunk/addonfactory-ucc-base-ui/blob/283d5abcf8f462ac10de876464bc1719fd19ff90/src/main/webapp/util/uccConfigurationValidators.js#L170-L184](https://github.com//github.com/splunk/addonfactory-ucc-base-ui/blob/283d5abcf8f462ac10de876464bc1719fd19ff90/src/main/webapp/util/uccConfigurationValidators.js/issues/L170-L184) [#584](https://github.com/splunk/addonfactory-ucc-generator/issues/584)

# [5.18.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.17.1...v5.18.0) (2022-12-12)


### Features

* v5.18.0 release ([#583](https://github.com/splunk/addonfactory-ucc-generator/issues/583)) ([312839e](https://github.com/splunk/addonfactory-ucc-generator/commit/312839ea0888c673ddd706578a2891d6e9662d37))

## [5.17.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.17.0...v5.17.1) (2022-11-30)


### Bug Fixes

* update UCC UI to v1.15.1 ([#578](https://github.com/splunk/addonfactory-ucc-generator/issues/578)) ([173a8f2](https://github.com/splunk/addonfactory-ucc-generator/commit/173a8f2a33299f66c5d5f5041caf532a4710500f))

# [5.17.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.16.1...v5.17.0) (2022-11-29)


### Features

* update UCC UI to 1.15.0 ([#576](https://github.com/splunk/addonfactory-ucc-generator/issues/576)) ([a2788a2](https://github.com/splunk/addonfactory-ucc-generator/commit/a2788a237f49415707e3c0bef2befb573bae35b1))

## [5.16.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.16.0...v5.16.1) (2022-11-28)


### Bug Fixes

* update UCC UI to 1.14.2 ([#573](https://github.com/splunk/addonfactory-ucc-generator/issues/573)) ([20d2a5c](https://github.com/splunk/addonfactory-ucc-generator/commit/20d2a5c50704d65669028967980712ea6a7939f2))

# [5.16.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.15.1...v5.16.0) (2022-11-23)


### Features

* update UCC UI to v1.14.1 ([#563](https://github.com/splunk/addonfactory-ucc-generator/issues/563)) ([9d9cb86](https://github.com/splunk/addonfactory-ucc-generator/commit/9d9cb8682a7de72e949c23efb782c93d5fa45f36))

## [5.15.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.15.0...v5.15.1) (2022-11-09)


### Bug Fixes

* build add-on if config param is present ([536634a](https://github.com/splunk/addonfactory-ucc-generator/commit/536634af784685b98f563c3ae5543ac63e064825))

# [5.15.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.14.2...v5.15.0) (2022-11-07)


### Features

* add validation for the splunktaucclib to be included ([#549](https://github.com/splunk/addonfactory-ucc-generator/issues/549)) ([b7eacb6](https://github.com/splunk/addonfactory-ucc-generator/commit/b7eacb6678efd26b6fe846c045996e86a562a1ca))

## [5.14.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.14.1...v5.14.2) (2022-11-02)


### Bug Fixes

* update UCC UI to v1.12.4 ([#546](https://github.com/splunk/addonfactory-ucc-generator/issues/546)) ([65da70b](https://github.com/splunk/addonfactory-ucc-generator/commit/65da70bb0c2ac931dbc9f400d9007612e1d17283))

## [5.14.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.14.0...v5.14.1) (2022-10-18)


### Bug Fixes

* **code:** ADDON-56381 Using the latest version of UCC UI ([#540](https://github.com/splunk/addonfactory-ucc-generator/issues/540)) ([d760a31](https://github.com/splunk/addonfactory-ucc-generator/commit/d760a312d04fafa3e5e7f84090cce5c7ef1756ab))

# [5.14.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.13.0...v5.14.0) (2022-10-18)


### Features

* added support for YAML file ([#536](https://github.com/splunk/addonfactory-ucc-generator/issues/536)) ([10eebaa](https://github.com/splunk/addonfactory-ucc-generator/commit/10eebaa4a8d9f51f47b8e86262866d592940054b))

# [5.13.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.12.0...v5.13.0) (2022-08-02)


### Features

* add --python-binary-name flag to specify Python name to install libraries ([#485](https://github.com/splunk/addonfactory-ucc-generator/issues/485)) ([bc46170](https://github.com/splunk/addonfactory-ucc-generator/commit/bc46170d889b31a192fe553bad7ccab3f91001f7))

# [5.12.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.11.0...v5.12.0) (2022-07-08)


### Features

* new version of UCC UI ([#479](https://github.com/splunk/addonfactory-ucc-generator/issues/479)) ([db72816](https://github.com/splunk/addonfactory-ucc-generator/commit/db728163afc208d3fe0f623f3f9653a17fa911e2))

# [5.11.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.10.4...v5.11.0) (2022-07-08)


### Features

* add sc_admin to default.meta ([#477](https://github.com/splunk/addonfactory-ucc-generator/issues/477)) ([4298fa3](https://github.com/splunk/addonfactory-ucc-generator/commit/4298fa39b34e07fa583bb671651fb877066ac935))

## [5.10.4](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.10.3...v5.10.4) (2022-07-04)


### Bug Fixes

* better exception handling when could not get the version from git tags ([#476](https://github.com/splunk/addonfactory-ucc-generator/issues/476)) ([2aafc09](https://github.com/splunk/addonfactory-ucc-generator/commit/2aafc09517982e9c701b073181cdd3b9da6807b0))

## [5.10.3](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.10.2...v5.10.3) (2022-07-03)


### Bug Fixes

* no crash if metadata folder exists ([#474](https://github.com/splunk/addonfactory-ucc-generator/issues/474)) ([03aa2ae](https://github.com/splunk/addonfactory-ucc-generator/commit/03aa2aeb09ee7e536696f08c41c0149fd6ba7cf7))

## [5.10.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.10.1...v5.10.2) (2022-02-01)


### Bug Fixes

* update ucc ui version to 1.9.1 ([#418](https://github.com/splunk/addonfactory-ucc-generator/issues/418)) ([822361c](https://github.com/splunk/addonfactory-ucc-generator/commit/822361c47b5d199ac9944489619b47dddd0c628d))

## [5.10.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.10.0...v5.10.1) (2021-11-29)


### Bug Fixes

* remove generation of `expose:_splunkd_data` stanza in web.conf ([df6441e](https://github.com/splunk/addonfactory-ucc-generator/commit/df6441ebfe9de340c511cb57860e22dc1bc86f1e)), closes [#303](https://github.com/splunk/addonfactory-ucc-generator/issues/303)

# [5.10.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.9.0...v5.10.0) (2021-11-16)


### Features

* migrate to separate conf-parser library ([2ab9fe9](https://github.com/splunk/addonfactory-ucc-generator/commit/2ab9fe94157da0000a2360c008a9c78cb93782c2))

# [5.9.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.8.2...v5.9.0) (2021-10-04)


### Features

* trigger v5.9.0 release ([a01259c](https://github.com/splunk/addonfactory-ucc-generator/commit/a01259cb7006cbad918edd33251133e94c1be24d))



## [5.8.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.8.1...v5.8.2) (2021-08-18)


### Bug Fixes

* add icon_path to each modular alert conf ([c6828b9](https://github.com/splunk/addonfactory-ucc-generator/commit/c6828b9c4488281b0efd9ba00dbdef37c0cf6aa5))



## [5.8.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.8.0...v5.8.1) (2021-08-17)


### Bug Fixes

* alert html generation ([7dc8860](https://github.com/splunk/addonfactory-ucc-generator/commit/7dc8860301d605ab8c05ec3aada6f4da6e615a17))



# [5.8.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.7.0...v5.8.0) (2021-08-16)


### Features

* delete `apiVersion` from globalConfig.json and bump schemaVersion ([6c22704](https://github.com/splunk/addonfactory-ucc-generator/commit/6c22704229b454876715214f1371b2746eee38c7))



# [5.7.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.6.2...v5.7.0) (2021-08-14)


### Bug Fixes

* Dont remove jsonschema metadata files ([539d8f6](https://github.com/splunk/addonfactory-ucc-generator/commit/539d8f6cfedd3a78aa102578f02a922fd2fb2759))
* release ([185dd15](https://github.com/splunk/addonfactory-ucc-generator/commit/185dd1544d6ce9bd9079d96730b7dabda857c5f7))


### Features

* generate metadata/default.meta ([629b248](https://github.com/splunk/addonfactory-ucc-generator/commit/629b2488e0bac01f981a4f4c75586fa5c79b9064))
* **python:** retain dist info files ([7c8616a](https://github.com/splunk/addonfactory-ucc-generator/commit/7c8616a37b5395014777a2fb60163c240bc075d6))



## [5.6.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.6.1...v5.6.2) (2021-08-10)


### Bug Fixes

* dump dunamai to 1.5.5 version ([6cc76bd](https://github.com/splunk/addonfactory-ucc-generator/commit/6cc76bdff683628b77e0368639a3915d947d7eb5))



## [5.6.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.6.0...v5.6.1) (2021-08-09)


### Bug Fixes

* do not ignore UCC UI folder ([25cec26](https://github.com/splunk/addonfactory-ucc-generator/commit/25cec26138c8720c42fa8b9fc8bbb2cfe5a37beb))



# [5.6.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.9...v5.6.0) (2021-08-09)


### Bug Fixes

* update ucc ui version to 1.8.4 ([2daa655](https://github.com/splunk/addonfactory-ucc-generator/commit/2daa65538e37fa47eb56aa66d45eaaa1c994830d))


### Features

* remove splunktaucclib ([661eb64](https://github.com/splunk/addonfactory-ucc-generator/commit/661eb646737f3841351c389352323cf8e3100b74))



## [5.5.8](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.7...v5.5.8) (2021-07-27)


### Bug Fixes

* splunktaucclib update ([26eb068](https://github.com/splunk/addonfactory-ucc-generator/commit/26eb0687d31418e46608a510f4052bafe597d7f3))



## [5.5.7](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.6...v5.5.7) (2021-07-26)


### Bug Fixes

* remove non-valid Python code ([b7adf48](https://github.com/splunk/addonfactory-ucc-generator/commit/b7adf484a1ff24e225828c511bf288f077becd29))



## [5.5.6](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.5...v5.5.6) (2021-07-20)


### Bug Fixes

* **deps:** bump jinja2 from 2.11.3 to 3.0.1 ([#274](https://github.com/splunk/addonfactory-ucc-generator/issues/274)) ([1a736af](https://github.com/splunk/addonfactory-ucc-generator/commit/1a736af6cfe3304051e11463b5e77075910dcafc))



## [5.5.5](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.4...v5.5.5) (2021-07-19)


### Bug Fixes

* TABConfigParser.remove_section() is not working read() ([8c82a45](https://github.com/splunk/addonfactory-ucc-generator/commit/8c82a454c0644a99eed6c83b397f4f3bd09a875b))
* update ucc ui version to 1.8.3 ([49a89d5](https://github.com/splunk/addonfactory-ucc-generator/commit/49a89d59d28bc052ac22a51cb2db0b58d90e6b38))



## [5.5.3](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.2...v5.5.3) (2021-07-12)


### Bug Fixes

* validate that a configuration tab with table has field "name" ([#261](https://github.com/splunk/addonfactory-ucc-generator/issues/261)) ([234f1e9](https://github.com/splunk/addonfactory-ucc-generator/commit/234f1e91f97b8e2b254ef0b04cca9553b12d26da))



## [5.5.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.1...v5.5.2) (2021-07-07)


### Bug Fixes

* issue with indent function ([#257](https://github.com/splunk/addonfactory-ucc-generator/issues/257)) ([898fdb4](https://github.com/splunk/addonfactory-ucc-generator/commit/898fdb479c1eb224137780323c31b577599134ae))



## [5.5.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.0...v5.5.1) (2021-07-07)


### Bug Fixes

* broken import after modular alert code generation ([#255](https://github.com/splunk/addonfactory-ucc-generator/issues/255)) ([a3138ec](https://github.com/splunk/addonfactory-ucc-generator/commit/a3138ec53e82584d7da671cec554b73c97fc9595))
* remove unnecessary dependencies ([6bd263f](https://github.com/splunk/addonfactory-ucc-generator/commit/6bd263f12e6eb6b9759ff762b3e4dd6b75d2f80c))
* update ucc ui version ([e3e5cba](https://github.com/splunk/addonfactory-ucc-generator/commit/e3e5cba010dfb49914adf4d83a7bdf7d98556683))
* update ucc ui version to 1.7.7 ([1f82472](https://github.com/splunk/addonfactory-ucc-generator/commit/1f82472fb8b46cf9822952066d685c7fde20c13d))
* update ucc ui version to 1.8.2 ([300ca6a](https://github.com/splunk/addonfactory-ucc-generator/commit/300ca6a6b53983753720834d5f35e1de95dd5ae7))
* update ucc version to 1.7.6 ([2e47cc3](https://github.com/splunk/addonfactory-ucc-generator/commit/2e47cc32de960b177512cfe9f4e49d1680a9e63a))
* update ucc version to 1.8.1 ([d7fa1c6](https://github.com/splunk/addonfactory-ucc-generator/commit/d7fa1c6728a62792108bd407069a20251490fccb))


### Features

* support app.manifest file with comments ([70eb38e](https://github.com/splunk/addonfactory-ucc-generator/commit/70eb38ee8ed74722d911be19700f92a621428e16)), closes [/github.com/splunk/appinspect/blob/fabd1387cf41e087edd86fb7f28e2f9e69a1467c/splunk_appinspect/checks/check_support_and_installation_standards.py#L169-L180](https://github.com//github.com/splunk/appinspect/blob/fabd1387cf41e087edd86fb7f28e2f9e69a1467c/splunk_appinspect/checks/check_support_and_installation_standards.py/issues/L169-L180)
* update ucc ui version ([cf04fa7](https://github.com/splunk/addonfactory-ucc-generator/commit/cf04fa7b8612188082bc2624be93fd5c22bb702b))



## [5.3.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.3.0...v5.3.1) (2021-06-15)


### Bug Fixes

* remove splunktalib as not used ([#231](https://github.com/splunk/addonfactory-ucc-generator/issues/231)) ([757c260](https://github.com/splunk/addonfactory-ucc-generator/commit/757c260edf57aa9b6a0ee8dbf7f6a5cc86a07d78))



# [5.3.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.2.1...v5.3.0) (2021-06-14)


### Bug Fixes

* update Splunk libraries to latest versions ([#229](https://github.com/splunk/addonfactory-ucc-generator/issues/229)) ([1bddfd6](https://github.com/splunk/addonfactory-ucc-generator/commit/1bddfd62633df52dc001ce3fed61e3147acfc96e))


### Features

* pip causing app inspect failures and NOTICE ([#224](https://github.com/splunk/addonfactory-ucc-generator/issues/224)) ([d83b687](https://github.com/splunk/addonfactory-ucc-generator/commit/d83b6876e485a67a954a4bb17662a1b2a4fe6393))



## [5.2.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.2.0...v5.2.1) (2021-06-13)


### Bug Fixes

* switch to slim docker image ([7bde41c](https://github.com/splunk/addonfactory-ucc-generator/commit/7bde41c6d677fa7c986fa1e71724789da8d2d5c4))



# [5.2.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.1.0...v5.2.0) (2021-06-12)


### Features

* drop support for py2/py3 compatible libraries ([#225](https://github.com/splunk/addonfactory-ucc-generator/issues/225)) ([29fafad](https://github.com/splunk/addonfactory-ucc-generator/commit/29fafadf477a99b2eae1a9dd5a0915ab66e97a76))



# [5.1.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.0.3...v5.1.0) (2021-06-09)


### Features

* Include notice file in distribution ([#220](https://github.com/splunk/addonfactory-ucc-generator/issues/220)) ([fdfdf2b](https://github.com/splunk/addonfactory-ucc-generator/commit/fdfdf2b989f22846a09be655677f6623204a370c))
* ucc as a library ([#218](https://github.com/splunk/addonfactory-ucc-generator/issues/218)) ([7f06c29](https://github.com/splunk/addonfactory-ucc-generator/commit/7f06c292f30cbaf234dfb481fd4127434cc35674))
* update ucc ui version ([df8687e](https://github.com/splunk/addonfactory-ucc-generator/commit/df8687e94d45cddad3ce237a583b786f81ccb318))



## [5.0.3](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.0.2...v5.0.3) (2021-06-08)


### Bug Fixes

* include schema and notice file in pip package ([7b67c81](https://github.com/splunk/addonfactory-ucc-generator/commit/7b67c81abbaf6b54d050293d7fbfce2a864273d5))
* include schema and notice file in pip package ([92d0ad6](https://github.com/splunk/addonfactory-ucc-generator/commit/92d0ad657c590878d58082be5401176d8b26dda3))
* quick fix for ta-version argument ([e26e8bf](https://github.com/splunk/addonfactory-ucc-generator/commit/e26e8bf93aae34544fe426eda7976e4a70b4968d))
* Replace Circle CI with Github actions ([aa07fcf](https://github.com/splunk/addonfactory-ucc-generator/commit/aa07fcf1d78f9fd1cf2a4302c7c79620787024fc))
* support for ta-version argument ([710452a](https://github.com/splunk/addonfactory-ucc-generator/commit/710452abdf93448af06508acae2810c31e9dbd5b))
* ucc-gen to replace token for redirect.xml ([1128842](https://github.com/splunk/addonfactory-ucc-generator/commit/11288424389ac5b3b7f017d80b4a47d2e77b13e4))
* use defusedxml instead of xml library ([c3fdfc0](https://github.com/splunk/addonfactory-ucc-generator/commit/c3fdfc0897205742246055d0a5020bb11eb79521))



# [5.0.0-develop.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.4.0-develop.3...v5.0.0-develop.1) (2021-05-31)


### Bug Fixes

* consume schema.json from ucc ui ([6069ce2](https://github.com/splunk/addonfactory-ucc-generator/commit/6069ce2bdf1d79c9130b32d228c25a3786e251d1))
* update ucc ui version ([1cf1d59](https://github.com/splunk/addonfactory-ucc-generator/commit/1cf1d59a0d1593f8d7bb92824f40a983dca7e9bc))


### Features

* migrated to splunk-ui ([aab1012](https://github.com/splunk/addonfactory-ucc-generator/commit/aab101228f090fe720b622d0983413b36cb38e8d))
* migrated to splunk-ui ([42b9a20](https://github.com/splunk/addonfactory-ucc-generator/commit/42b9a204f265afe393d9dcec85aeefb355f14403))
* update splunktaucclib to 4.2.0 ([be831af](https://github.com/splunk/addonfactory-ucc-generator/commit/be831af7190db72d42c04077898b0ac5524fa1e0))


### BREAKING CHANGES

* Migrate UI to SplunkUI framework
* Migrate UI to SplunkUI framework



# [4.4.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.3.0...v4.4.0) (2021-04-14)


### Bug Fixes

* add interationalization to added changes ([cf70a0f](https://github.com/splunk/addonfactory-ucc-generator/commit/cf70a0f2987d7bde5bc0f75117b1ec68d441f316))
* add missing react-toast-notifications dep ([88a1ce9](https://github.com/splunk/addonfactory-ucc-generator/commit/88a1ce90e53c9e458b378a331256c44113b4a7da))
* commented oauth realated logic from ucc-gen temporarily ([6d08509](https://github.com/splunk/addonfactory-ucc-generator/commit/6d0850982cb7f5fe69387f364dcec2877d00e3dd))
* error handling and migrated to functional component ([3e2d15d](https://github.com/splunk/addonfactory-ucc-generator/commit/3e2d15dffdfe01d5f4d5315ef7aedb52aef57f79))
* error handling in errorboundary ([b1ed49b](https://github.com/splunk/addonfactory-ucc-generator/commit/b1ed49bf14149fc806a316e1c1406d3f260891b0))
* filter issue in table ([86fffbe](https://github.com/splunk/addonfactory-ucc-generator/commit/86fffbeff96f70666b2b826264d676496d1d2b06))
* initial default tab query param ([2d4d7dd](https://github.com/splunk/addonfactory-ucc-generator/commit/2d4d7ddde846132ca10609a3deaa36965c905178))
* internationalization fixes and code deduplication ([b41f33d](https://github.com/splunk/addonfactory-ucc-generator/commit/b41f33d1ed5e186a7b5c1e18cc70a0d6444180dd))
* make minor modifications for form submit on single page form ([1501401](https://github.com/splunk/addonfactory-ucc-generator/commit/1501401b73fc67d01508ed0d2a8d82af3c62dcc2))
* minor fixes and comments ([be8dabd](https://github.com/splunk/addonfactory-ucc-generator/commit/be8dabd2b4950509c3d9a7a3879112ff804a28cd))
* refactored table header as separate component ([0c386de](https://github.com/splunk/addonfactory-ucc-generator/commit/0c386de8bc8725d28a8ad3769014d883d2958545))
* remove temporary test change for error boundary ([baa54e7](https://github.com/splunk/addonfactory-ucc-generator/commit/baa54e73f6b8dae3911b251ceda4af22602c981a))
* removed multiple calls to endpoint in tab navigation for configuration page, addded conditional rendering of moreInfo based on globalConfig and fixed single input type dropdown filter ([f1c2545](https://github.com/splunk/addonfactory-ucc-generator/commit/f1c25457b3422a1a776674f381c6bf1f138941c3))
* routing history with query params ([9c5cc2f](https://github.com/splunk/addonfactory-ucc-generator/commit/9c5cc2f5fa32dc63321b62d8653c9dd225e9e073))
* title in input and configuration page templates ([6328fdf](https://github.com/splunk/addonfactory-ucc-generator/commit/6328fdf95b357e5d7d9e02b2c556972bfadd1aeb))
* ucc_ui_lib: asynchronous state updates for status toggle button ([4e63041](https://github.com/splunk/addonfactory-ucc-generator/commit/4e6304176adbace7c22c3fde15f44d45850fbc4c))
* update ucc ui version ([31ac853](https://github.com/splunk/addonfactory-ucc-generator/commit/31ac8531487abff73b4192ead42df639bc2292d6))
* update ucc ui version ([8b077dc](https://github.com/splunk/addonfactory-ucc-generator/commit/8b077dc60bf8f87032c1d76dbdaa41ee8813b7c8))
* update ucc ui version ([b6dc8b4](https://github.com/splunk/addonfactory-ucc-generator/commit/b6dc8b48ae18b27a06c1bcd110d1ca50720b451b))
* update ucc ui version ([e340376](https://github.com/splunk/addonfactory-ucc-generator/commit/e3403768dcff3104f3de23466faba1f4795510f9))
* use primitive type in useEffect for query param updates to reduce executions ([a4a0542](https://github.com/splunk/addonfactory-ucc-generator/commit/a4a05429f8690da698e41468da8bf78c35e46abd))


### Features

* add page style dialog and its routing ([a475235](https://github.com/splunk/addonfactory-ucc-generator/commit/a47523510afffc27aeb0b24ba46ff67f5a336fef))
* Added button for create new input ([979b058](https://github.com/splunk/addonfactory-ucc-generator/commit/979b0587e5a5a26d52be186bd0f29fff426c3d35))
* added configuration page integration for table and single page form ([b7a4d50](https://github.com/splunk/addonfactory-ucc-generator/commit/b7a4d500d0a384d8e80aa9e294a201bc3cf89d72))
* Added Create Input  button in input_page ([b2b3562](https://github.com/splunk/addonfactory-ucc-generator/commit/b2b3562648132a7315e375b751de10c5516d32af))
* Added custom cell feature in the table and fixed sorting issue ([3711846](https://github.com/splunk/addonfactory-ucc-generator/commit/371184626386c1a9381972494adfb425bc3592ed))
* Added error modal component ([bbde4cf](https://github.com/splunk/addonfactory-ucc-generator/commit/bbde4cf85238f02a8caad2a921128572bba7f403))
* Added localization in titles ([24f663b](https://github.com/splunk/addonfactory-ucc-generator/commit/24f663b9bb09956e395fa1ce50bb75d85c80c8fd))
* Added parsing and validation functionality for globalConfig.json file ([e690000](https://github.com/splunk/addonfactory-ucc-generator/commit/e6900006706320fea765f807ad10994cc88aed42))
* added routing for record and tab name ([748ab74](https://github.com/splunk/addonfactory-ucc-generator/commit/748ab74b732689f96cb2c96d2db13942ee8cc8b4))
* Added schemaGenerator.py file ([be0b945](https://github.com/splunk/addonfactory-ucc-generator/commit/be0b945bd44b06e7434f2541102d81c8af58ed92))
* Added table component with actions button ([f550769](https://github.com/splunk/addonfactory-ucc-generator/commit/f5507696c9ed1f3fecdfaa04d55455243531d5d8))
* **build:** Move ucc-ui-lib to a new repo ([71db6b1](https://github.com/splunk/addonfactory-ucc-generator/commit/71db6b15a22c49f14aa2a7a793dbf562b30973c4))
* Custom row feature implemented ([308d847](https://github.com/splunk/addonfactory-ucc-generator/commit/308d84790781532dec6b49c9d775275ace506b18))
* Data flow using react context api ([ddfaf41](https://github.com/splunk/addonfactory-ucc-generator/commit/ddfaf414b35a3b5b71fcb750b2e3ed6122b8e6c9))
* Fixed issue ([887f419](https://github.com/splunk/addonfactory-ucc-generator/commit/887f4196ece8ddfa228b2093e1904f39182cb82a))
* Fixed prop type validation issue ([b0643e6](https://github.com/splunk/addonfactory-ucc-generator/commit/b0643e60f85a7200fc9ad6d6bc6aa8a4febd438e))
* Fixed the delete model issue ([71743ae](https://github.com/splunk/addonfactory-ucc-generator/commit/71743ae6320a4aae0f05c825b002d124b18931d0))
* Fixed typo ([9d5d0ee](https://github.com/splunk/addonfactory-ucc-generator/commit/9d5d0eef220ecc5d2309095b645cbdf608694228))
* Fixed typo ([3ce2363](https://github.com/splunk/addonfactory-ucc-generator/commit/3ce2363acd9ffbff3027405771fb6605f4e43619))
* Fixed typo ([668d2a5](https://github.com/splunk/addonfactory-ucc-generator/commit/668d2a59f0ca4682926d46b9df38575b8ebabf33))
* Form design changes ([3f34bfa](https://github.com/splunk/addonfactory-ucc-generator/commit/3f34bfa4b623f290f848664f6fcb3fb996de8114))
* formatted file ([ec3c0a6](https://github.com/splunk/addonfactory-ucc-generator/commit/ec3c0a60421ac4c97a944307bb511f009c71c36d))
* Implemented filter functionality in the table component ([4a77545](https://github.com/splunk/addonfactory-ucc-generator/commit/4a77545c96c440b8a5d1a6f24d57a9ad8d3b58f8))
* Implemented styled component ([503aeb4](https://github.com/splunk/addonfactory-ucc-generator/commit/503aeb47e67d5613b223382e46aba0592fb4003c))
* Pagination component implemented ([ab41e36](https://github.com/splunk/addonfactory-ucc-generator/commit/ab41e36c0951ea46ed0c8d6461986ae2f14fe03f))
* Refactored table component ([4206ce3](https://github.com/splunk/addonfactory-ucc-generator/commit/4206ce3b229fd0f377b784d3e85ddf7f3ae360bb))
* Removed commented code ([bbdda12](https://github.com/splunk/addonfactory-ucc-generator/commit/bbdda129ca75072f0be72b3171ad9fa8172155a3))
* Removed id from custom table ([2afdc83](https://github.com/splunk/addonfactory-ucc-generator/commit/2afdc8395333b129d8fa74999d85c9ce73b1f03d))
* Removed key ([f80499d](https://github.com/splunk/addonfactory-ucc-generator/commit/f80499d18b2f86cd4191c96b7797031d3ff9952d))
* Removed log line ([1f51cb4](https://github.com/splunk/addonfactory-ucc-generator/commit/1f51cb432210ea67f9822ff361c2627e1c509efe))
* Removed logs ([6763ef9](https://github.com/splunk/addonfactory-ucc-generator/commit/6763ef98de0a0c75807b7805e90b7f1bf5fb5e06))
* Removed logs ([36476ac](https://github.com/splunk/addonfactory-ucc-generator/commit/36476acfeaeb8cb32d8a61fd2cf75e779c27af14))
* Removed patch file ([ef065dc](https://github.com/splunk/addonfactory-ucc-generator/commit/ef065dce0460d828159edca7eff4e73cf0972934))
* Resolved comments ([5a6088b](https://github.com/splunk/addonfactory-ucc-generator/commit/5a6088bae2592b4d25d374d1cdb85746ad95f36e))
* Set configuration page to default ([6b7150a](https://github.com/splunk/addonfactory-ucc-generator/commit/6b7150a506c39b65da4b50f65e8f2b4847bb7dd7))
* update splunktaucclib to 4.2.0 ([be831af](https://github.com/splunk/addonfactory-ucc-generator/commit/be831af7190db72d42c04077898b0ac5524fa1e0))
* Update the way to store data in the context ([8d11e7d](https://github.com/splunk/addonfactory-ucc-generator/commit/8d11e7d4e15ce3b96411a1d3be8f10f3f17351ab))
* update ucc ui version ([d562bea](https://github.com/splunk/addonfactory-ucc-generator/commit/d562beaada2daf979b4d48cd441332809ffd57de))
* Updated custom cell file ([0479106](https://github.com/splunk/addonfactory-ucc-generator/commit/0479106f2d47e2cd29a0911a32325766eda52a7a))
* Updated file name ([8640413](https://github.com/splunk/addonfactory-ucc-generator/commit/86404131ec50f5e91c357a2efaef716e047215d4))
* Used i18n in custom cell ([06d0f02](https://github.com/splunk/addonfactory-ucc-generator/commit/06d0f02806578893daa244dce65bc16845ea45e4))
* validate JSON configuration before generating build ([0c80d62](https://github.com/splunk/addonfactory-ucc-generator/commit/0c80d6242c26245a6318109491fbf200ecdf1f6d))



# [4.4.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.3.0...v4.4.0) (2021-04-14)


### Bug Fixes

* add interationalization to added changes ([cf70a0f](https://github.com/splunk/addonfactory-ucc-generator/commit/cf70a0f2987d7bde5bc0f75117b1ec68d441f316))
* add missing react-toast-notifications dep ([88a1ce9](https://github.com/splunk/addonfactory-ucc-generator/commit/88a1ce90e53c9e458b378a331256c44113b4a7da))
* commented oauth realated logic from ucc-gen temporarily ([6d08509](https://github.com/splunk/addonfactory-ucc-generator/commit/6d0850982cb7f5fe69387f364dcec2877d00e3dd))
* error handling and migrated to functional component ([3e2d15d](https://github.com/splunk/addonfactory-ucc-generator/commit/3e2d15dffdfe01d5f4d5315ef7aedb52aef57f79))
* error handling in errorboundary ([b1ed49b](https://github.com/splunk/addonfactory-ucc-generator/commit/b1ed49bf14149fc806a316e1c1406d3f260891b0))
* filter issue in table ([86fffbe](https://github.com/splunk/addonfactory-ucc-generator/commit/86fffbeff96f70666b2b826264d676496d1d2b06))
* initial default tab query param ([2d4d7dd](https://github.com/splunk/addonfactory-ucc-generator/commit/2d4d7ddde846132ca10609a3deaa36965c905178))
* internationalization fixes and code deduplication ([b41f33d](https://github.com/splunk/addonfactory-ucc-generator/commit/b41f33d1ed5e186a7b5c1e18cc70a0d6444180dd))
* make minor modifications for form submit on single page form ([1501401](https://github.com/splunk/addonfactory-ucc-generator/commit/1501401b73fc67d01508ed0d2a8d82af3c62dcc2))
* minor fixes and comments ([be8dabd](https://github.com/splunk/addonfactory-ucc-generator/commit/be8dabd2b4950509c3d9a7a3879112ff804a28cd))
* refactored table header as separate component ([0c386de](https://github.com/splunk/addonfactory-ucc-generator/commit/0c386de8bc8725d28a8ad3769014d883d2958545))
* remove temporary test change for error boundary ([baa54e7](https://github.com/splunk/addonfactory-ucc-generator/commit/baa54e73f6b8dae3911b251ceda4af22602c981a))
* removed multiple calls to endpoint in tab navigation for configuration page, addded conditional rendering of moreInfo based on globalConfig and fixed single input type dropdown filter ([f1c2545](https://github.com/splunk/addonfactory-ucc-generator/commit/f1c25457b3422a1a776674f381c6bf1f138941c3))
* routing history with query params ([9c5cc2f](https://github.com/splunk/addonfactory-ucc-generator/commit/9c5cc2f5fa32dc63321b62d8653c9dd225e9e073))
* title in input and configuration page templates ([6328fdf](https://github.com/splunk/addonfactory-ucc-generator/commit/6328fdf95b357e5d7d9e02b2c556972bfadd1aeb))
* ucc_ui_lib: asynchronous state updates for status toggle button ([4e63041](https://github.com/splunk/addonfactory-ucc-generator/commit/4e6304176adbace7c22c3fde15f44d45850fbc4c))
* update ucc ui version ([8b077dc](https://github.com/splunk/addonfactory-ucc-generator/commit/8b077dc60bf8f87032c1d76dbdaa41ee8813b7c8))
* update ucc ui version ([b6dc8b4](https://github.com/splunk/addonfactory-ucc-generator/commit/b6dc8b48ae18b27a06c1bcd110d1ca50720b451b))
* update ucc ui version ([e340376](https://github.com/splunk/addonfactory-ucc-generator/commit/e3403768dcff3104f3de23466faba1f4795510f9))
* use primitive type in useEffect for query param updates to reduce executions ([a4a0542](https://github.com/splunk/addonfactory-ucc-generator/commit/a4a05429f8690da698e41468da8bf78c35e46abd))


### Features

* add page style dialog and its routing ([a475235](https://github.com/splunk/addonfactory-ucc-generator/commit/a47523510afffc27aeb0b24ba46ff67f5a336fef))
* Added button for create new input ([979b058](https://github.com/splunk/addonfactory-ucc-generator/commit/979b0587e5a5a26d52be186bd0f29fff426c3d35))
* added configuration page integration for table and single page form ([b7a4d50](https://github.com/splunk/addonfactory-ucc-generator/commit/b7a4d500d0a384d8e80aa9e294a201bc3cf89d72))
* Added Create Input  button in input_page ([b2b3562](https://github.com/splunk/addonfactory-ucc-generator/commit/b2b3562648132a7315e375b751de10c5516d32af))
* Added custom cell feature in the table and fixed sorting issue ([3711846](https://github.com/splunk/addonfactory-ucc-generator/commit/371184626386c1a9381972494adfb425bc3592ed))
* Added error modal component ([bbde4cf](https://github.com/splunk/addonfactory-ucc-generator/commit/bbde4cf85238f02a8caad2a921128572bba7f403))
* Added localization in titles ([24f663b](https://github.com/splunk/addonfactory-ucc-generator/commit/24f663b9bb09956e395fa1ce50bb75d85c80c8fd))
* Added parsing and validation functionality for globalConfig.json file ([e690000](https://github.com/splunk/addonfactory-ucc-generator/commit/e6900006706320fea765f807ad10994cc88aed42))
* added routing for record and tab name ([748ab74](https://github.com/splunk/addonfactory-ucc-generator/commit/748ab74b732689f96cb2c96d2db13942ee8cc8b4))
* Added schemaGenerator.py file ([be0b945](https://github.com/splunk/addonfactory-ucc-generator/commit/be0b945bd44b06e7434f2541102d81c8af58ed92))
* Added table component with actions button ([f550769](https://github.com/splunk/addonfactory-ucc-generator/commit/f5507696c9ed1f3fecdfaa04d55455243531d5d8))
* **build:** Move ucc-ui-lib to a new repo ([71db6b1](https://github.com/splunk/addonfactory-ucc-generator/commit/71db6b15a22c49f14aa2a7a793dbf562b30973c4))
* Custom row feature implemented ([308d847](https://github.com/splunk/addonfactory-ucc-generator/commit/308d84790781532dec6b49c9d775275ace506b18))
* Data flow using react context api ([ddfaf41](https://github.com/splunk/addonfactory-ucc-generator/commit/ddfaf414b35a3b5b71fcb750b2e3ed6122b8e6c9))
* Fixed issue ([887f419](https://github.com/splunk/addonfactory-ucc-generator/commit/887f4196ece8ddfa228b2093e1904f39182cb82a))
* Fixed prop type validation issue ([b0643e6](https://github.com/splunk/addonfactory-ucc-generator/commit/b0643e60f85a7200fc9ad6d6bc6aa8a4febd438e))
* Fixed the delete model issue ([71743ae](https://github.com/splunk/addonfactory-ucc-generator/commit/71743ae6320a4aae0f05c825b002d124b18931d0))
* Fixed typo ([9d5d0ee](https://github.com/splunk/addonfactory-ucc-generator/commit/9d5d0eef220ecc5d2309095b645cbdf608694228))
* Fixed typo ([3ce2363](https://github.com/splunk/addonfactory-ucc-generator/commit/3ce2363acd9ffbff3027405771fb6605f4e43619))
* Fixed typo ([668d2a5](https://github.com/splunk/addonfactory-ucc-generator/commit/668d2a59f0ca4682926d46b9df38575b8ebabf33))
* Form design changes ([3f34bfa](https://github.com/splunk/addonfactory-ucc-generator/commit/3f34bfa4b623f290f848664f6fcb3fb996de8114))
* formatted file ([ec3c0a6](https://github.com/splunk/addonfactory-ucc-generator/commit/ec3c0a60421ac4c97a944307bb511f009c71c36d))
* Implemented filter functionality in the table component ([4a77545](https://github.com/splunk/addonfactory-ucc-generator/commit/4a77545c96c440b8a5d1a6f24d57a9ad8d3b58f8))
* Implemented styled component ([503aeb4](https://github.com/splunk/addonfactory-ucc-generator/commit/503aeb47e67d5613b223382e46aba0592fb4003c))
* Pagination component implemented ([ab41e36](https://github.com/splunk/addonfactory-ucc-generator/commit/ab41e36c0951ea46ed0c8d6461986ae2f14fe03f))
* Refactored table component ([4206ce3](https://github.com/splunk/addonfactory-ucc-generator/commit/4206ce3b229fd0f377b784d3e85ddf7f3ae360bb))
* Removed commented code ([bbdda12](https://github.com/splunk/addonfactory-ucc-generator/commit/bbdda129ca75072f0be72b3171ad9fa8172155a3))
* Removed id from custom table ([2afdc83](https://github.com/splunk/addonfactory-ucc-generator/commit/2afdc8395333b129d8fa74999d85c9ce73b1f03d))
* Removed key ([f80499d](https://github.com/splunk/addonfactory-ucc-generator/commit/f80499d18b2f86cd4191c96b7797031d3ff9952d))
* Removed log line ([1f51cb4](https://github.com/splunk/addonfactory-ucc-generator/commit/1f51cb432210ea67f9822ff361c2627e1c509efe))
* Removed logs ([6763ef9](https://github.com/splunk/addonfactory-ucc-generator/commit/6763ef98de0a0c75807b7805e90b7f1bf5fb5e06))
* Removed logs ([36476ac](https://github.com/splunk/addonfactory-ucc-generator/commit/36476acfeaeb8cb32d8a61fd2cf75e779c27af14))
* Removed patch file ([ef065dc](https://github.com/splunk/addonfactory-ucc-generator/commit/ef065dce0460d828159edca7eff4e73cf0972934))
* Resolved comments ([5a6088b](https://github.com/splunk/addonfactory-ucc-generator/commit/5a6088bae2592b4d25d374d1cdb85746ad95f36e))
* Set configuration page to default ([6b7150a](https://github.com/splunk/addonfactory-ucc-generator/commit/6b7150a506c39b65da4b50f65e8f2b4847bb7dd7))
* Update the way to store data in the context ([8d11e7d](https://github.com/splunk/addonfactory-ucc-generator/commit/8d11e7d4e15ce3b96411a1d3be8f10f3f17351ab))
* update ucc ui version ([d562bea](https://github.com/splunk/addonfactory-ucc-generator/commit/d562beaada2daf979b4d48cd441332809ffd57de))
* Updated custom cell file ([0479106](https://github.com/splunk/addonfactory-ucc-generator/commit/0479106f2d47e2cd29a0911a32325766eda52a7a))
* Updated file name ([8640413](https://github.com/splunk/addonfactory-ucc-generator/commit/86404131ec50f5e91c357a2efaef716e047215d4))
* Used i18n in custom cell ([06d0f02](https://github.com/splunk/addonfactory-ucc-generator/commit/06d0f02806578893daa244dce65bc16845ea45e4))
* validate JSON configuration before generating build ([0c80d62](https://github.com/splunk/addonfactory-ucc-generator/commit/0c80d6242c26245a6318109491fbf200ecdf1f6d))



# [4.4.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.3.0...v4.4.0) (2021-04-14)


### Features

* validate JSON configuration before generating build ([0c80d62](https://github.com/splunk/addonfactory-ucc-generator/commit/0c80d6242c26245a6318109491fbf200ecdf1f6d))



# [4.3.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.2.3...v4.3.0) (2021-04-06)


### Bug Fixes

* added support for additional packaging ([f9acc98](https://github.com/splunk/addonfactory-ucc-generator/commit/f9acc98381d7691ef07658b279bbc43b6d613905))
* bump splunktaucclib to 4.0.13 ([51a07f0](https://github.com/splunk/addonfactory-ucc-generator/commit/51a07f0827f3f1ad3ed8b2875b0aa374587b6860))
* **license:** Correct License reference to Apache-2 ([1996410](https://github.com/splunk/addonfactory-ucc-generator/commit/1996410172f86b47505d39df37718b2dae4eddcf))
* location of files was incorrect on commit ([47d494d](https://github.com/splunk/addonfactory-ucc-generator/commit/47d494d2ee1fc00cacc47e5af975614d714bc4fc))
* Update CI to new standard ([fe6b46b](https://github.com/splunk/addonfactory-ucc-generator/commit/fe6b46b81e6c8813b19ec4e91757cdfe31f8c284))


### Features

* supporting the new version mechanism ([1768138](https://github.com/splunk/addonfactory-ucc-generator/commit/1768138825c301f049867c420391d48a9cd8d995))
* **version:** Support develop versions ([ea42e81](https://github.com/splunk/addonfactory-ucc-generator/commit/ea42e81b292a637bdedcf2e80b43542936ba0920))



## [4.1.9-b.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.1.9-a.1...v4.1.9-b.1) (2020-11-13)



## [4.1.8-b.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.1.8-a.2...v4.1.8-b.1) (2020-11-13)



## [4.1.6-a.7](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.1.6-a.6...v4.1.6-a.7) (2020-11-09)



## [4.1.1-b.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.1.1-a.4...v4.1.1-b.1) (2020-10-08)



## [4.1.1-a.3](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.1.1-a.2...v4.1.1-a.3) (2020-10-08)



## [4.1.1-a.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.1.1-a.1...v4.1.1-a.2) (2020-10-08)



## [4.1.1-a.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.1.2...v4.1.1-a.1) (2020-10-08)



## [4.0.5-a.9](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.0.5-a.8...v4.0.5-a.9) (2020-09-23)



## [4.0.5-a.8](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.0.5-a.7...v4.0.5-a.8) (2020-09-22)



## [4.0.5-a.7](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.0.5-a.6...v4.0.5-a.7) (2020-09-22)


### Reverts

* Revert "Modified include in pyproject.toml with a glob" ([14304e3](https://github.com/splunk/addonfactory-ucc-generator/commit/14304e3e6170f996c0b52e9792dbb8da9975fc63))



## [4.0.5-a.5](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.0.5-a.4...v4.0.5-a.5) (2020-09-19)



## [4.0.5-a.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.0.5-a.1...v4.0.5-a.2) (2020-09-19)



## [4.0.5-a.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.0.4...v4.0.5-a.1) (2020-09-19)



## [4.0.4](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.0.3...v4.0.4) (2020-09-17)
