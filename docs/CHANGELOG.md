# Changelog

# [5.70.0-rc.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.69.1...v5.70.0-rc.1) (2025-08-21)


### Bug Fixes

* add  browser header for test case ([#1889](https://github.com/splunk/addonfactory-ucc-generator/issues/1889)) ([068cad6](https://github.com/splunk/addonfactory-ucc-generator/commit/068cad639ff05b416c7db1b437ef8f913d3bbd11))


### Features

* **custom command:** test-ucc-ui as custom ui test command ([#1834](https://github.com/splunk/addonfactory-ucc-generator/issues/1834)) ([533fc6a](https://github.com/splunk/addonfactory-ucc-generator/commit/533fc6a55d39ccc4afa460a6a70cfedcdf2cc102))
* do not support auth_entity property in auth entities ([#1879](https://github.com/splunk/addonfactory-ucc-generator/issues/1879)) ([26b25e0](https://github.com/splunk/addonfactory-ucc-generator/commit/26b25e0f445a01ddc1ec97246c6e9562a0b46306))

## [5.69.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.69.0...v5.69.1) (2025-08-05)


### Bug Fixes

* searchbnf.conf issue ([#1860](https://github.com/splunk/addonfactory-ucc-generator/issues/1860)) ([58f62c3](https://github.com/splunk/addonfactory-ucc-generator/commit/58f62c338775afc202aac7cb9b7776f8899d2fbd))


### Reverts

* merging of .conf files ([#1873](https://github.com/splunk/addonfactory-ucc-generator/issues/1873)) ([1c93133](https://github.com/splunk/addonfactory-ucc-generator/commit/1c9313371d3eee7519018a3adbf437b37be88821)), closes [#1800](https://github.com/splunk/addonfactory-ucc-generator/issues/1800) [#1832](https://github.com/splunk/addonfactory-ucc-generator/issues/1832)

# [5.69.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.68.1...v5.69.0) (2025-07-22)


### Features

* add self param to stream_events and validate_input at build-time ([#1829](https://github.com/splunk/addonfactory-ucc-generator/issues/1829)) ([5aa5e95](https://github.com/splunk/addonfactory-ucc-generator/commit/5aa5e9533ca365904f0924aca96d462d4b15bac1))

## [5.68.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.68.0...v5.68.1) (2025-07-17)


### Bug Fixes

* path issue for default alert icon ([#1839](https://github.com/splunk/addonfactory-ucc-generator/issues/1839)) ([342ebb4](https://github.com/splunk/addonfactory-ucc-generator/commit/342ebb49d65beba125052a4cc8bd4d892be9b63b))

# [5.68.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.67.0...v5.68.0) (2025-07-15)


### Bug Fixes

* do not generate openapi.json for .conf-only add-ons ([#1742](https://github.com/splunk/addonfactory-ucc-generator/issues/1742)) ([3133ea2](https://github.com/splunk/addonfactory-ucc-generator/commit/3133ea24accc888c865ea8f2932bc4f4e4371660))
* fix Jinja2 vulnerability for autoescape ([#1790](https://github.com/splunk/addonfactory-ucc-generator/issues/1790)) ([c0eefef](https://github.com/splunk/addonfactory-ucc-generator/commit/c0eefefa677313438bb60bc0e31f45284c2a1579))


### Features

* add command to publish package ([#1813](https://github.com/splunk/addonfactory-ucc-generator/issues/1813)) ([277e80e](https://github.com/splunk/addonfactory-ucc-generator/commit/277e80ec741a013a897c3a6c1211c1505213ea4e))
* added footer component ([#1796](https://github.com/splunk/addonfactory-ucc-generator/issues/1796)) ([f7f7e1a](https://github.com/splunk/addonfactory-ucc-generator/commit/f7f7e1ae88b6604b44abe7494719fb9924bcacf5))
* allow more custom oauth methods ([#1817](https://github.com/splunk/addonfactory-ucc-generator/issues/1817)) ([5bcc9aa](https://github.com/splunk/addonfactory-ucc-generator/commit/5bcc9aa739bfb7b041be2965708f229e83e1eb82))
* **modify field on value:** support regexp expresion ([#1812](https://github.com/splunk/addonfactory-ucc-generator/issues/1812)) ([3c9d575](https://github.com/splunk/addonfactory-ucc-generator/commit/3c9d57595d12b564feadd1e3020f594465eadffb))
* **oauth:** allow different components ([#1810](https://github.com/splunk/addonfactory-ucc-generator/issues/1810)) ([b10160f](https://github.com/splunk/addonfactory-ucc-generator/commit/b10160fa4afa75d0d62425ecbf71a5d6db3064e0))
* **textarea:** mask data when encrypted ([#1805](https://github.com/splunk/addonfactory-ucc-generator/issues/1805)) ([8ad5e52](https://github.com/splunk/addonfactory-ucc-generator/commit/8ad5e5244e24791f7d694950e4f306247f4e9b2d))
* ucc-gen validate command support ([#1771](https://github.com/splunk/addonfactory-ucc-generator/issues/1771)) ([f4c3e40](https://github.com/splunk/addonfactory-ucc-generator/commit/f4c3e4078da0995fc0e557cece8315e71a76a532))
* update recursive_overwrite method to merge .conf files ([#1800](https://github.com/splunk/addonfactory-ucc-generator/issues/1800)) ([4444c65](https://github.com/splunk/addonfactory-ucc-generator/commit/4444c651346a7059f1c1628d61a654ad4c198f6e))

# [5.67.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.66.0...v5.67.0) (2025-06-17)


### Bug Fixes

* added --ignore-requires-python flag for os-dependent ([#1792](https://github.com/splunk/addonfactory-ucc-generator/issues/1792)) ([b9b7347](https://github.com/splunk/addonfactory-ucc-generator/commit/b9b7347dd990c41d0cf72ab15039af26b8f9f5a9))


### Features

* add multiline support for tabs ([#1778](https://github.com/splunk/addonfactory-ucc-generator/issues/1778)) ([7616bcb](https://github.com/splunk/addonfactory-ucc-generator/commit/7616bcb4b716116757416d37e108f8e5fee51710))
* added user-friendly storybook component ([#1759](https://github.com/splunk/addonfactory-ucc-generator/issues/1759)) ([5d04783](https://github.com/splunk/addonfactory-ucc-generator/commit/5d047834c244843945befbf2eeda09e2b5a85684))
* **dashbaord:** do not build dashboard files when no need ([#1795](https://github.com/splunk/addonfactory-ucc-generator/issues/1795)) ([fafac88](https://github.com/splunk/addonfactory-ucc-generator/commit/fafac88abe7aead8405b7aa4e16ba82405d5e7fb))

# [5.66.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.65.0...v5.66.0) (2025-06-03)


### Bug Fixes

* custom tab without entity error ([#1718](https://github.com/splunk/addonfactory-ucc-generator/issues/1718)) ([9c38fd4](https://github.com/splunk/addonfactory-ucc-generator/commit/9c38fd4a2f12e8bd35e7d87f5a5268938e78603b))
* handling of non external custom elements ([#1766](https://github.com/splunk/addonfactory-ucc-generator/issues/1766)) ([2342a05](https://github.com/splunk/addonfactory-ucc-generator/commit/2342a050aeecca9a34f15ca3e0c0c30ad929f771))
* remove support for interval and index type of entities for alerts ([#1757](https://github.com/splunk/addonfactory-ucc-generator/issues/1757)) ([49c04be](https://github.com/splunk/addonfactory-ucc-generator/commit/49c04be804bcd27f820d2bb8d77b0674499b513c))
* set host and port for proxy as required ([#1755](https://github.com/splunk/addonfactory-ucc-generator/issues/1755)) ([4bafe79](https://github.com/splunk/addonfactory-ucc-generator/commit/4bafe79e8ffeebe0b10ed294157ec06b387cf0ce))
* **ui lib:** do not copy files from lib while building ([#1756](https://github.com/splunk/addonfactory-ucc-generator/issues/1756)) ([3b433ee](https://github.com/splunk/addonfactory-ucc-generator/commit/3b433eebbb2c677c70009581389a3537423bc8a4))


### Features

* **playground:** api calls as success to enable internal data flow ([#1731](https://github.com/splunk/addonfactory-ucc-generator/issues/1731)) ([6170551](https://github.com/splunk/addonfactory-ucc-generator/commit/6170551f539c150b4a88e63b57d4ab3e7b2569ad))

# [5.65.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.64.0...v5.65.0) (2025-05-15)


### Bug Fixes

* **Oauth Client Credentials:** OpenAPI fix ([#1748](https://github.com/splunk/addonfactory-ucc-generator/issues/1748)) ([fe2eb86](https://github.com/splunk/addonfactory-ucc-generator/commit/fe2eb86c37985bc78890871f0ebe6867622b6fac))


### Features

* add ucc-gen-ui cli command ([#1705](https://github.com/splunk/addonfactory-ucc-generator/issues/1705)) ([d9c3210](https://github.com/splunk/addonfactory-ucc-generator/commit/d9c3210eee083cd527c33e6595bd98e259d53e92))
* base code for supporting custom search command  ([#1693](https://github.com/splunk/addonfactory-ucc-generator/issues/1693)) ([03cb0d2](https://github.com/splunk/addonfactory-ucc-generator/commit/03cb0d2602cd4a63e98a7fcb3c1525d501d4d26c)), closes [#1694](https://github.com/splunk/addonfactory-ucc-generator/issues/1694) [#1695](https://github.com/splunk/addonfactory-ucc-generator/issues/1695) [#1697](https://github.com/splunk/addonfactory-ucc-generator/issues/1697)
* custom react component via context ([#1706](https://github.com/splunk/addonfactory-ucc-generator/issues/1706)) ([1a65cf0](https://github.com/splunk/addonfactory-ucc-generator/commit/1a65cf0f0a06e2633660cc83f6aa4ef04dffa8fd))
* update base.html if it is incorrect ([#1750](https://github.com/splunk/addonfactory-ucc-generator/issues/1750)) ([05066ca](https://github.com/splunk/addonfactory-ucc-generator/commit/05066ca8ba5284c8ec120c8731817d67a2edf9c0))

# [5.64.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.63.0...v5.64.0) (2025-05-08)


### Bug Fixes

* OAuth error messages ([#1727](https://github.com/splunk/addonfactory-ucc-generator/issues/1727)) ([dbfc0d4](https://github.com/splunk/addonfactory-ucc-generator/commit/dbfc0d43faec49bd2dcb60b8c573ed0745008c54))
* **oauth_client_credentials:** reflects state correctly on edit/config  ([#1726](https://github.com/splunk/addonfactory-ucc-generator/issues/1726)) ([c1dfe62](https://github.com/splunk/addonfactory-ucc-generator/commit/c1dfe6213d7de30d9521860b39f385d445cc49af))
* reauthenticate when an account is edited ([#1725](https://github.com/splunk/addonfactory-ucc-generator/issues/1725)) ([9cb9109](https://github.com/splunk/addonfactory-ucc-generator/commit/9cb9109dd269b806bf9263cf85d9cf0a9a720d4d))


### Features

* add ucc-gen validate command ([#1702](https://github.com/splunk/addonfactory-ucc-generator/issues/1702)) ([c756d7c](https://github.com/splunk/addonfactory-ucc-generator/commit/c756d7c1f31efcb45df31da73dee8bd63bef6492))


### Reverts

* remove ucc-gen validate command support ([#1728](https://github.com/splunk/addonfactory-ucc-generator/issues/1728)) ([1d350e4](https://github.com/splunk/addonfactory-ucc-generator/commit/1d350e4413e14022bf29512887deb2984d9d4747)), closes [#1702](https://github.com/splunk/addonfactory-ucc-generator/issues/1702)

# [5.63.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.62.0...v5.63.0) (2025-04-30)


### Bug Fixes

* change sed backup extension ([#1710](https://github.com/splunk/addonfactory-ucc-generator/issues/1710)) ([2167622](https://github.com/splunk/addonfactory-ucc-generator/commit/21676220dc50878b66564d7bfdada116a13132fa))
* fixed defaultView error ([#1714](https://github.com/splunk/addonfactory-ucc-generator/issues/1714)) ([cf793c9](https://github.com/splunk/addonfactory-ucc-generator/commit/cf793c9de0ae3d5b57e47cd9a492815ef34d0b02))


### Features

* add links to something went wrong ([#1709](https://github.com/splunk/addonfactory-ucc-generator/issues/1709)) ([0b33911](https://github.com/splunk/addonfactory-ucc-generator/commit/0b33911d29001a93745f5f29839782b3c5537bdc))
* schema changes for OAuth 2.0 Client Credentials Grant ([#1708](https://github.com/splunk/addonfactory-ucc-generator/issues/1708)) ([c8c0fe3](https://github.com/splunk/addonfactory-ucc-generator/commit/c8c0fe330f095fa46a4b1e9e1b8ad23343b1254a))
* Single Model handler with OAuth 2.0 Client Credentials support ([#1715](https://github.com/splunk/addonfactory-ucc-generator/issues/1715)) ([be70a87](https://github.com/splunk/addonfactory-ucc-generator/commit/be70a87b3b7048c790b07aa6cfba73e63b6da9ff))
* support for OAuth2 Client Credentials Grant in RH template ([#1707](https://github.com/splunk/addonfactory-ucc-generator/issues/1707)) ([5fd7a6b](https://github.com/splunk/addonfactory-ucc-generator/commit/5fd7a6b94a167f040062bd767074a10f32b55919))

# [5.62.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.61.0...v5.62.0) (2025-04-17)


### Bug Fixes

* show input type in inputs page ([#1688](https://github.com/splunk/addonfactory-ucc-generator/issues/1688)) ([5626536](https://github.com/splunk/addonfactory-ucc-generator/commit/5626536797a6b53d2f0a071e5912e397fb24b9b1))


### Features

* add delimiter for checkboxtree and checkboxgroup ([#1685](https://github.com/splunk/addonfactory-ucc-generator/issues/1685)) ([1bef9fa](https://github.com/splunk/addonfactory-ucc-generator/commit/1bef9fae6b8a2ca0e19fd3c5d41fbff21588833c))
* generate another .conf-file when conf parameter is used ([#1608](https://github.com/splunk/addonfactory-ucc-generator/issues/1608)) ([849351f](https://github.com/splunk/addonfactory-ucc-generator/commit/849351fa4882a3dc2ed812cf530ddbe98668dfe0))
* handle uncaught exception ([#1681](https://github.com/splunk/addonfactory-ucc-generator/issues/1681)) ([9a621be](https://github.com/splunk/addonfactory-ucc-generator/commit/9a621be583a93d24e69df09930c410d0f2fc98a3))

# [5.61.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.60.0...v5.61.0) (2025-04-01)


### Bug Fixes

* checkboxgroup select all button selects disabled fields ([#1636](https://github.com/splunk/addonfactory-ucc-generator/issues/1636)) ([3434a37](https://github.com/splunk/addonfactory-ucc-generator/commit/3434a378262f2608271d54f17f4d078d8e8fd929))
* **import-from-aob:** fixed incorrect merging and added app.manifest validations ([#1670](https://github.com/splunk/addonfactory-ucc-generator/issues/1670)) ([2dba52b](https://github.com/splunk/addonfactory-ucc-generator/commit/2dba52b256be708c8655267cc4cee8b446603b39))


### Features

* **build:** --ui-source-map deprecation notice ([#1674](https://github.com/splunk/addonfactory-ucc-generator/issues/1674)) ([13efe91](https://github.com/splunk/addonfactory-ucc-generator/commit/13efe9126080a35d1e15e6be8aca4ef2eb22419b))
* create globalConfig from app.manifest ([#1669](https://github.com/splunk/addonfactory-ucc-generator/issues/1669)) ([07a37c4](https://github.com/splunk/addonfactory-ucc-generator/commit/07a37c4405c9bc8aa45221bd065a44559f32cb22))
* introduce GlobalConfig.from_app_manifest ([#1661](https://github.com/splunk/addonfactory-ucc-generator/issues/1661)) ([d5edd88](https://github.com/splunk/addonfactory-ucc-generator/commit/d5edd8803fd51e4ffbc6eba575e5116207228406))

# [5.60.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.59.0...v5.60.0) (2025-03-18)


### Bug Fixes

* more info correctly expands ([#1628](https://github.com/splunk/addonfactory-ucc-generator/issues/1628)) ([6ead9b5](https://github.com/splunk/addonfactory-ucc-generator/commit/6ead9b5852497047e8fcd428874adf0b36c64d9f))
* remove max length for checkboxgroup and checkboxtree label ([#1620](https://github.com/splunk/addonfactory-ucc-generator/issues/1620)) ([0e36a56](https://github.com/splunk/addonfactory-ucc-generator/commit/0e36a564ea731fe2168e96bd9b297e7118b05524))


### Features

* skip help links in inputs.conf.spec ([#1630](https://github.com/splunk/addonfactory-ucc-generator/issues/1630)) ([ca88890](https://github.com/splunk/addonfactory-ucc-generator/commit/ca88890babb727c47d5d0362a2357d71f742c1fa))
* **TextArea:** remove clear button ([#1635](https://github.com/splunk/addonfactory-ucc-generator/issues/1635)) ([3abec93](https://github.com/splunk/addonfactory-ucc-generator/commit/3abec931f254260bd152bc7a8e27a043b6a1ead2))


### Reverts

* "feat: skip help links in inputs.conf.spec" ([#1632](https://github.com/splunk/addonfactory-ucc-generator/issues/1632)) ([c67de92](https://github.com/splunk/addonfactory-ucc-generator/commit/c67de92cbd035994341b1b033103396bde51a2fb))
* remove stretched out icons ([#1647](https://github.com/splunk/addonfactory-ucc-generator/issues/1647)) ([7eb10df](https://github.com/splunk/addonfactory-ucc-generator/commit/7eb10df4a13b95cabf6b1925e40ff4518d670a44))

# [5.59.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.58.1...v5.59.0) (2025-03-04)


### Bug Fixes

* **validation:** correct regexp validation for empty strings ([#1592](https://github.com/splunk/addonfactory-ucc-generator/issues/1592)) ([0759afe](https://github.com/splunk/addonfactory-ucc-generator/commit/0759afeb0f4b64b99f11f60a5cacf811e90b7e46))
* **validation:** correctly display error in save validator fnc ([#1602](https://github.com/splunk/addonfactory-ucc-generator/issues/1602)) ([f1b1068](https://github.com/splunk/addonfactory-ucc-generator/commit/f1b106878624aa64005499f9d2b840c715f8c7de))
* **validation:** correctly validate empty not required data ([#1606](https://github.com/splunk/addonfactory-ucc-generator/issues/1606)) ([7f8c08a](https://github.com/splunk/addonfactory-ucc-generator/commit/7f8c08a065ed9a6cd0d48457946f72b8cf73a3e1))


### Features

* **modals:** provide support for custom headers ([#1572](https://github.com/splunk/addonfactory-ucc-generator/issues/1572)) ([13aeae6](https://github.com/splunk/addonfactory-ucc-generator/commit/13aeae642c4fb376f26b35d91416ebaa06f3feea))

## [5.58.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.58.0...v5.58.1) (2025-02-20)


### Bug Fixes

* build if "conf" param specified for a configuration tab ([#1590](https://github.com/splunk/addonfactory-ucc-generator/issues/1590)) ([6b069ec](https://github.com/splunk/addonfactory-ucc-generator/commit/6b069ec8054e66a0cbb7f6c1415ce03cbafbe4b5))

# [5.58.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.57.2...v5.58.0) (2025-02-18)


### Bug Fixes

* correctly display status in more info ([#1576](https://github.com/splunk/addonfactory-ucc-generator/issues/1576)) ([0deb79f](https://github.com/splunk/addonfactory-ucc-generator/commit/0deb79f3338e3632e60679fc89115a2bd122e299))
* **hideForPlatform:** hide inputs when in groups menu ([#1564](https://github.com/splunk/addonfactory-ucc-generator/issues/1564)) ([3deefbb](https://github.com/splunk/addonfactory-ucc-generator/commit/3deefbb781a4383e75146fe78f3d88ff11c2cdfb))


### Features

* add default values of entities to inputs.conf ([#1530](https://github.com/splunk/addonfactory-ucc-generator/issues/1530)) ([d86342a](https://github.com/splunk/addonfactory-ucc-generator/commit/d86342abcd10677b8d23e677dd2dc56968b1e32e))
* add support for custom REST handlers without UI in openapi.json ([#1529](https://github.com/splunk/addonfactory-ucc-generator/issues/1529)) ([e4b1f61](https://github.com/splunk/addonfactory-ucc-generator/commit/e4b1f61393853aa5a2951a660da32cf6fd609cf1))
* add support for custom REST handlers without UI in web.conf and restmap.conf ([#1532](https://github.com/splunk/addonfactory-ucc-generator/issues/1532)) ([09fe1e6](https://github.com/splunk/addonfactory-ucc-generator/commit/09fe1e634f60f6e72a18a2f9cddc177b1cc910cd))
* allow same service name across different inputs ([#1413](https://github.com/splunk/addonfactory-ucc-generator/issues/1413)) ([f121dd4](https://github.com/splunk/addonfactory-ucc-generator/commit/f121dd4e546075b018f1ff7fb3f62d759d660df4)), closes [#1369](https://github.com/splunk/addonfactory-ucc-generator/issues/1369)
* **helplink:** links as part of longer text, new lines ([#1561](https://github.com/splunk/addonfactory-ucc-generator/issues/1561)) ([28263da](https://github.com/splunk/addonfactory-ucc-generator/commit/28263dab603c8372d0a336915a1e83d5e1fc7442))
* **help:** message with links and new lines ([#1562](https://github.com/splunk/addonfactory-ucc-generator/issues/1562)) ([88c41f0](https://github.com/splunk/addonfactory-ucc-generator/commit/88c41f0f6d08207a1f5c634b9786088c956f0a6f))
* make configuration page as optional ([#1521](https://github.com/splunk/addonfactory-ucc-generator/issues/1521)) ([0f67e30](https://github.com/splunk/addonfactory-ucc-generator/commit/0f67e30873ed48f5f15312bc41096b701027fc0a))
* provide support for .conf-only add-ons ([#1546](https://github.com/splunk/addonfactory-ucc-generator/issues/1546)) ([d814388](https://github.com/splunk/addonfactory-ucc-generator/commit/d814388198fa971473253b09a400e61fdeb8c56e))

## [5.57.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.57.1...v5.57.2) (2025-02-14)


### Bug Fixes

* pass os-dependentLibraries.python_version as is to pip ([0ba94bf](https://github.com/splunk/addonfactory-ucc-generator/commit/0ba94bf82b3d9d2ded8f2810875c400f01dbb9af))
* pass os-dependentLibraries.python_version as is to pip ([#1578](https://github.com/splunk/addonfactory-ucc-generator/issues/1578)) ([441e2fb](https://github.com/splunk/addonfactory-ucc-generator/commit/441e2fbc7353e5bcb4d52ea895a377aca282aa6f))

## [5.57.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.57.0...v5.57.1) (2025-02-04)


### Bug Fixes

* **a11y:** connect labels to inputs ([#1542](https://github.com/splunk/addonfactory-ucc-generator/issues/1542)) ([5335782](https://github.com/splunk/addonfactory-ucc-generator/commit/533578248d5346f078fe8842b0afe9d3884fbb5b))
* do not require calls of _reload endpoint ([#1547](https://github.com/splunk/addonfactory-ucc-generator/issues/1547)) ([a39c8c0](https://github.com/splunk/addonfactory-ucc-generator/commit/a39c8c02eb5f716ec29a122931a1ba0626524c3b))

# [5.57.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.56.0...v5.57.0) (2025-01-22)


### Bug Fixes

* prevent unnecessary updates to the globalConfig file ([#1535](https://github.com/splunk/addonfactory-ucc-generator/issues/1535)) ([b541693](https://github.com/splunk/addonfactory-ucc-generator/commit/b5416931f263e15fc46849844856e8eb93d34b86)), closes [#1519](https://github.com/splunk/addonfactory-ucc-generator/issues/1519)


### Features

* add CheckboxTree component ([#1495](https://github.com/splunk/addonfactory-ucc-generator/issues/1495)) ([1d55507](https://github.com/splunk/addonfactory-ucc-generator/commit/1d55507519c258eeebd8d79896f7699828dc52b7))
* **dashboard:** zero line when no data found ([#1480](https://github.com/splunk/addonfactory-ucc-generator/issues/1480)) ([d1cad41](https://github.com/splunk/addonfactory-ucc-generator/commit/d1cad414ca4fbf88a410571277ad49a87c14cecc))


### Reverts

* "ci: rollback splunk-appinspect to 3.8.1" ([#1536](https://github.com/splunk/addonfactory-ucc-generator/issues/1536)) ([0e97dfd](https://github.com/splunk/addonfactory-ucc-generator/commit/0e97dfdb34a2d09281567789d4603863e4dc6ef9)), closes [splunk/addonfactory-ucc-generator#1527](https://github.com/splunk/addonfactory-ucc-generator/issues/1527)

# [5.56.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.55.0...v5.56.0) (2025-01-08)


### Bug Fixes

* rest handler template code for oauth ([#1499](https://github.com/splunk/addonfactory-ucc-generator/issues/1499)) ([78e5d7a](https://github.com/splunk/addonfactory-ucc-generator/commit/78e5d7a3617299fc92db1ff0be9548324815a630))


### Features

* add basic icons ([#1498](https://github.com/splunk/addonfactory-ucc-generator/issues/1498)) ([b07657d](https://github.com/splunk/addonfactory-ucc-generator/commit/b07657d9fb6f42969cccc7dff733607a6d4b0c1b))
* add default validators ([#1507](https://github.com/splunk/addonfactory-ucc-generator/issues/1507)) ([cdd3f31](https://github.com/splunk/addonfactory-ucc-generator/commit/cdd3f31eda049ce32e1636c4edb00eb38209f13d))
* add option to disable inputs on creation ([#1510](https://github.com/splunk/addonfactory-ucc-generator/issues/1510)) ([df3c5a5](https://github.com/splunk/addonfactory-ucc-generator/commit/df3c5a59e077f15e3cf5387eb380af0b03a7abdf))
* add proxy component ([#1444](https://github.com/splunk/addonfactory-ucc-generator/issues/1444)) ([2241363](https://github.com/splunk/addonfactory-ucc-generator/commit/22413632cbb5a51ca49f8dfa4d67b343513111d1))
* do not add _uccVersion to the root globalConfig file ([#1519](https://github.com/splunk/addonfactory-ucc-generator/issues/1519)) ([0beab3b](https://github.com/splunk/addonfactory-ucc-generator/commit/0beab3b2e55e44a40d5d4863365b59a02c31d732))
* **schema:** schema changes for custom REST endpoints ([#1509](https://github.com/splunk/addonfactory-ucc-generator/issues/1509)) ([451111a](https://github.com/splunk/addonfactory-ucc-generator/commit/451111ad1d3ad63a8e0c390065f6e7310d0e807f))
* support for Python 3.13 ([#1517](https://github.com/splunk/addonfactory-ucc-generator/issues/1517)) ([3020cfd](https://github.com/splunk/addonfactory-ucc-generator/commit/3020cfdcce958955db4af607d9176aac0234108b))

# [5.55.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.54.0...v5.55.0) (2024-12-10)


### Bug Fixes

* group elements use all functionalities ([#1500](https://github.com/splunk/addonfactory-ucc-generator/issues/1500)) ([01c88aa](https://github.com/splunk/addonfactory-ucc-generator/commit/01c88aabeb7e33963200c80a427aad7793c46f7a))


### Features

* add author during init ([#1483](https://github.com/splunk/addonfactory-ucc-generator/issues/1483)) ([a7c36ff](https://github.com/splunk/addonfactory-ucc-generator/commit/a7c36ffc599af03d67c04830ffa6e5bd65799fc8))
* **modifyFieldsOnValue:** enable field to modify itself ([#1494](https://github.com/splunk/addonfactory-ucc-generator/issues/1494)) ([3fd0501](https://github.com/splunk/addonfactory-ucc-generator/commit/3fd0501b7a97cbdc4ce4880a2953676c5c6efcfd))

# [5.54.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.53.2...v5.54.0) (2024-11-27)


### Bug Fixes

* allow packaging from 23.0 ([#1484](https://github.com/splunk/addonfactory-ucc-generator/issues/1484)) ([29accc4](https://github.com/splunk/addonfactory-ucc-generator/commit/29accc40a6c560f0181473627d0552a53af878b4))
* display newest information in row more info section ([#1445](https://github.com/splunk/addonfactory-ucc-generator/issues/1445)) ([2b34c6b](https://github.com/splunk/addonfactory-ucc-generator/commit/2b34c6b226619d0cfed6582a35181b7705de3983)), closes [#1410](https://github.com/splunk/addonfactory-ucc-generator/issues/1410)
* required star visibility when using modify prop ([#1489](https://github.com/splunk/addonfactory-ucc-generator/issues/1489)) ([e1fe2b0](https://github.com/splunk/addonfactory-ucc-generator/commit/e1fe2b0b8322c5c49745ee3cc93cf538142325e0))
* support Windows when checking library version ([#1482](https://github.com/splunk/addonfactory-ucc-generator/issues/1482)) ([db17b5c](https://github.com/splunk/addonfactory-ucc-generator/commit/db17b5c869b174639b0c24e5413bc9b517950940))


### Features

* add license during init command ([#1475](https://github.com/splunk/addonfactory-ucc-generator/issues/1475)) ([471294a](https://github.com/splunk/addonfactory-ucc-generator/commit/471294ae8e4c266a2f685aa4c01eb75fd1974db1))
* confirmation modal when activate/deactivate single input ([#1421](https://github.com/splunk/addonfactory-ucc-generator/issues/1421)) ([34c8ec2](https://github.com/splunk/addonfactory-ucc-generator/commit/34c8ec250861eb06bd1cd4b22b430e5aa7e26a7c))
* do not create `__pycache__` in lib dir ([#1469](https://github.com/splunk/addonfactory-ucc-generator/issues/1469)) ([ad58e50](https://github.com/splunk/addonfactory-ucc-generator/commit/ad58e50ca2b5588f6824a4da95a15e8c0857f032))
* **inputs:** show input services status count ([#1430](https://github.com/splunk/addonfactory-ucc-generator/issues/1430)) ([2574451](https://github.com/splunk/addonfactory-ucc-generator/commit/257445159898a2207cdf7a397345c218678c8fcb))

## [5.53.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.53.1...v5.53.2) (2024-11-21)


### Bug Fixes

* **api:** cancelled requests don't emit user facing errors ([#1472](https://github.com/splunk/addonfactory-ucc-generator/issues/1472)) ([0970441](https://github.com/splunk/addonfactory-ucc-generator/commit/09704416b5a56ddb518eabd01d596ec5e23157e3))

## [5.53.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.53.0...v5.53.1) (2024-11-18)


### Bug Fixes

* **select:** fetching options when some dependency is null ([#1463](https://github.com/splunk/addonfactory-ucc-generator/issues/1463)) ([feb9bdf](https://github.com/splunk/addonfactory-ucc-generator/commit/feb9bdf27488fcd357e57e47173d72971cf24f35))

## [5.53.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.52.0...v5.53.0) (2024-11-13)


### Bug Fixes

* **Dropdown:** fix showing selected option when value is numeric ([#1439](https://github.com/splunk/addonfactory-ucc-generator/issues/1439)) ([9e7394a](https://github.com/splunk/addonfactory-ucc-generator/commit/9e7394a2312238a79b9b5cb8d55f1427a6073696))
* generate oauth authentication fields for OpenAPI integration ([#1425](https://github.com/splunk/addonfactory-ucc-generator/issues/1425)) ([beb561b](https://github.com/splunk/addonfactory-ucc-generator/commit/beb561b25755cbcc51326848bc78891f89cf47b3))
* **table:** custom mapping for values in Status column ([#1451](https://github.com/splunk/addonfactory-ucc-generator/issues/1451)) ([4721738](https://github.com/splunk/addonfactory-ucc-generator/commit/472173801a50be6c9ac7ae91ab4a9d129d1bfd86))


### Features

* add ability to provide custom pip flags ([#1447](https://github.com/splunk/addonfactory-ucc-generator/issues/1447)) ([718c897](https://github.com/splunk/addonfactory-ucc-generator/commit/718c897347bd2db539354f6625be074e6d90d988))
* add grouping to configuration page ([#1432](https://github.com/splunk/addonfactory-ucc-generator/issues/1432)) ([b94b228](https://github.com/splunk/addonfactory-ucc-generator/commit/b94b2289fec8e33d53414db36c6504428d84546c))
* deprecate .uccignore and upgrade additional_package ([#1415](https://github.com/splunk/addonfactory-ucc-generator/issues/1415)) ([f6dd96f](https://github.com/splunk/addonfactory-ucc-generator/commit/f6dd96feadef395d92ca3c7c0a3a6ff70c3c8f10))

## [5.52.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.51.1...v5.52.0) (2024-10-30)


### Bug Fixes

* generate basic authentication fields for OpenAPI integration ([#1407](https://github.com/splunk/addonfactory-ucc-generator/issues/1407)) ([584b832](https://github.com/splunk/addonfactory-ucc-generator/commit/584b83255e73b42870a9c1ad7c2e15764b7b65eb))
* remove support for the "enable" action in table inputs ([#1386](https://github.com/splunk/addonfactory-ucc-generator/issues/1386)) ([26a4bb9](https://github.com/splunk/addonfactory-ucc-generator/commit/26a4bb90ccea63233e2fcc263ec23ad9f4649853))


### Features

* print warning when entity does not have validators ([#1409](https://github.com/splunk/addonfactory-ucc-generator/issues/1409)) ([ad12cea](https://github.com/splunk/addonfactory-ucc-generator/commit/ad12cea6e62b6796553f2f570b8cfc501601362f))
* require splunktaucclib 6.4.0 during the build phase ([#1412](https://github.com/splunk/addonfactory-ucc-generator/issues/1412)) ([0d20269](https://github.com/splunk/addonfactory-ucc-generator/commit/0d20269238c76ce77a011f1875dcfc14087efe06))

## [5.51.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.51.0...v5.51.1) (2024-10-22)


### Bug Fixes

* **CustomControl:** change order of function parameters ([#1392](https://github.com/splunk/addonfactory-ucc-generator/issues/1392)) ([c3e82f9](https://github.com/splunk/addonfactory-ucc-generator/commit/c3e82f9bf410ff7d0b13d36de6bd6c2486e2d3ac))

## [5.51.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.50.1...v5.51.0) (2024-10-16)


### Bug Fixes

* follow SemVer guidelines for version in globalConfig ([#1351](https://github.com/splunk/addonfactory-ucc-generator/issues/1351)) ([199c05e](https://github.com/splunk/addonfactory-ucc-generator/commit/199c05e5566556dc7690a8b436c8d3ce68306ccd))


### Features

* allow validators for oauth fields ([#1355](https://github.com/splunk/addonfactory-ucc-generator/issues/1355)) ([ef3b6a9](https://github.com/splunk/addonfactory-ucc-generator/commit/ef3b6a9b89c7be676821cd7a772b9dec1394d7b0))
* hide elements for cloud or enterprise ([#1364](https://github.com/splunk/addonfactory-ucc-generator/issues/1364)) ([21aa28f](https://github.com/splunk/addonfactory-ucc-generator/commit/21aa28f7ea290fe14dc8617b4e2b757905f0d420))
* modal implementation for data ingestion table ([#1244](https://github.com/splunk/addonfactory-ucc-generator/issues/1244)) ([8246870](https://github.com/splunk/addonfactory-ucc-generator/commit/8246870a5199b2f814bdb94d590c26ef9f351fa1))
* server side validation of name field based on globalConfig ([#1362](https://github.com/splunk/addonfactory-ucc-generator/issues/1362)) ([4e43c27](https://github.com/splunk/addonfactory-ucc-generator/commit/4e43c27c9f98bd07e5179e9cfd8c46988fef278a))
* support CRON as interval ([#1346](https://github.com/splunk/addonfactory-ucc-generator/issues/1346)) ([8c5a981](https://github.com/splunk/addonfactory-ucc-generator/commit/8c5a9817753e02103ec04d1267781d7030ace7ac))


## [5.50.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.50.0...v5.50.1) (2024-10-04)


### Bug Fixes

* use title for app conf ([#1356](https://github.com/splunk/addonfactory-ucc-generator/issues/1356)) ([adfd987](https://github.com/splunk/addonfactory-ucc-generator/commit/adfd9879832b66cd6749fb530bf575ad1a18d053))

## [5.50.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.49.0...v5.50.0) (2024-10-02)


### Bug Fixes

* boolean values are converted to 1 and 0 only on configuration page ([#1347](https://github.com/splunk/addonfactory-ucc-generator/issues/1347)) ([d0d0c11](https://github.com/splunk/addonfactory-ucc-generator/commit/d0d0c113f959e11b52573a5105d2bb51d6410165))
* custom row loading on many tabs ([#1336](https://github.com/splunk/addonfactory-ucc-generator/issues/1336)) ([f124b5e](https://github.com/splunk/addonfactory-ucc-generator/commit/f124b5e91cfd3690ab1869895f38a7cb9a217120))
* **globalConfig:** update name and rest root convention ([#1335](https://github.com/splunk/addonfactory-ucc-generator/issues/1335)) ([bdfa8c3](https://github.com/splunk/addonfactory-ucc-generator/commit/bdfa8c3131e2971100de9f61e8567620ae796db9)), closes [#1333](https://github.com/splunk/addonfactory-ucc-generator/issues/1333)


### Features

* **dashboard:** add possibility to display CRITICAL log lvl in dashboard ([#1337](https://github.com/splunk/addonfactory-ucc-generator/issues/1337)) ([d937986](https://github.com/splunk/addonfactory-ucc-generator/commit/d93798623302a444cf4aa333397324ed80e6d5b9))
* option for configuring is_visible from globalConfig.json ([#1345](https://github.com/splunk/addonfactory-ucc-generator/issues/1345)) ([04c80e3](https://github.com/splunk/addonfactory-ucc-generator/commit/04c80e35488301522e19735fb06168160a8b0b86)), closes [#1334](https://github.com/splunk/addonfactory-ucc-generator/issues/1334)
* provide support for Python 3.9 for OS-dependent libraries ([#1338](https://github.com/splunk/addonfactory-ucc-generator/issues/1338)) ([5cfc889](https://github.com/splunk/addonfactory-ucc-generator/commit/5cfc889357a8a19695b7e43cf07a327b00ed600d))
* restructure conf and spec file generation ([#1328](https://github.com/splunk/addonfactory-ucc-generator/issues/1328)) ([bc6a36b](https://github.com/splunk/addonfactory-ucc-generator/commit/bc6a36bd323a31ac2284f0a621caa2bfaa4c93ac))
* restructure html file generation ([#1311](https://github.com/splunk/addonfactory-ucc-generator/issues/1311)) ([ed2c2bd](https://github.com/splunk/addonfactory-ucc-generator/commit/ed2c2bd66c5c62fbd09fc1ed28dfaa2fc49a05fa))
* restructure xml file generation ([#1312](https://github.com/splunk/addonfactory-ucc-generator/issues/1312)) ([a171c8d](https://github.com/splunk/addonfactory-ucc-generator/commit/a171c8dc74d01268f4a4cb50df2d0e5b6956d883))

## [5.49.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.48.2...v5.49.0) (2024-08-21)


### Bug Fixes

* add basic textarea in alerts ([50bd0e1](https://github.com/splunk/addonfactory-ucc-generator/commit/50bd0e1a5a97713fffc93363307227d87fe99c1b))
* disallow alerts textarea to has option param ([f7605df](https://github.com/splunk/addonfactory-ucc-generator/commit/f7605df302d827dfd46412d7b4d62168792065a7))


### Features

* add basic textarea field to alerts ([#1308](https://github.com/splunk/addonfactory-ucc-generator/issues/1308)) ([cc1706f](https://github.com/splunk/addonfactory-ucc-generator/commit/cc1706ff527269e57ab7998800184015ac2f03b3))
* add new index entity ([#1313](https://github.com/splunk/addonfactory-ucc-generator/issues/1313)) ([df77f51](https://github.com/splunk/addonfactory-ucc-generator/commit/df77f514b7dbf1bab9b89be3222db0e8fafbe6fd))
* add required as modifiable property ([#1309](https://github.com/splunk/addonfactory-ucc-generator/issues/1309)) ([a94cdc9](https://github.com/splunk/addonfactory-ucc-generator/commit/a94cdc9a80e7754b12a56f3c9095022d323404ca))
* default value for custom mapping ([#1304](https://github.com/splunk/addonfactory-ucc-generator/issues/1304)) ([8c5a3a6](https://github.com/splunk/addonfactory-ucc-generator/commit/8c5a3a6ff9f92259f3716f68ad63dd7b523b378d)), closes [#1282](https://github.com/splunk/addonfactory-ucc-generator/issues/1282)
* use log_level in dashboard queries ([#1289](https://github.com/splunk/addonfactory-ucc-generator/issues/1289)) ([3fc86c3](https://github.com/splunk/addonfactory-ucc-generator/commit/3fc86c3003003273415de7b2ac71ea51da5e04e3))

## [5.48.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.48.1...v5.48.2) (2024-07-25)


### Bug Fixes

* **inputs:** fix parsing '0' as false for readonlyField and hideField ([#1290](https://github.com/splunk/addonfactory-ucc-generator/issues/1290)) ([ec676a1](https://github.com/splunk/addonfactory-ucc-generator/commit/ec676a1f7ca4a63e111aca355610161bc9e0fc1d))
* **NumberValidator:** Number validators allows integer value ([#1293](https://github.com/splunk/addonfactory-ucc-generator/issues/1293)) ([dbd287c](https://github.com/splunk/addonfactory-ucc-generator/commit/dbd287c406957867da1c01a7804a314242de420a)), closes [#876](https://github.com/splunk/addonfactory-ucc-generator/issues/876)

## [5.48.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.48.0...v5.48.1) (2024-07-11)


### Bug Fixes

* schema for mapping custom api value ([#1281](https://github.com/splunk/addonfactory-ucc-generator/issues/1281)) ([571bef7](https://github.com/splunk/addonfactory-ucc-generator/commit/571bef7450e994bac4fecf98376f58525cceec85))

## [5.48.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.47.0...v5.48.0) (2024-07-10)


### Bug Fixes

* allow using globalConfig validator regardless of the default encoding ([#1276](https://github.com/splunk/addonfactory-ucc-generator/issues/1276)) ([480798f](https://github.com/splunk/addonfactory-ucc-generator/commit/480798f5819770755b083a56f4a4aaccb4f90cce))
* correctly map truly and falsy values for inputs ([#1270](https://github.com/splunk/addonfactory-ucc-generator/issues/1270)) ([2b8c2c2](https://github.com/splunk/addonfactory-ucc-generator/commit/2b8c2c24557351dfd6f8dc05c2317c4efd16eceb))

### Features

* **theme:** add dark theme support ([#1257](https://github.com/splunk/addonfactory-ucc-generator/issues/1257)) ([8bd5d33](https://github.com/splunk/addonfactory-ucc-generator/commit/8bd5d33076dbb730b5e24a5033b2b59751732006))
* **inputs:** add hidable or readonly inputs ([#1258](https://github.com/splunk/addonfactory-ucc-generator/issues/1258)) ([8c70476](https://github.com/splunk/addonfactory-ucc-generator/commit/8c70476a5de4ec7cdf18e26b39494a2d5452f61c))
* remove placeholder option from globalConfig ([#1256](https://github.com/splunk/addonfactory-ucc-generator/issues/1256)) ([044c2d0](https://github.com/splunk/addonfactory-ucc-generator/commit/044c2d09630dcd762f247bac55d429704e852f9c))
* update add-on generated by ucc-gen init command ([#1263](https://github.com/splunk/addonfactory-ucc-generator/issues/1263)) ([76e8e52](https://github.com/splunk/addonfactory-ucc-generator/commit/76e8e52181e6153b19ba01844cd14424402e928f))
* **select entity:** allow custom mapping for values ([#1265](https://github.com/splunk/addonfactory-ucc-generator/issues/1265)) ([202f046](https://github.com/splunk/addonfactory-ucc-generator/commit/202f046c662427b7123825d42b5baecba9355071))


## [5.47.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.46.0...v5.47.0) (2024-06-25)


### Bug Fixes

* allow 2 blank lines in markdown ([3832c3c](https://github.com/splunk/addonfactory-ucc-generator/commit/3832c3c1f5458665923d14dba962dc2c3cc53223))


### Features

* **custom_row:** pass default row value to custom row component ([#1218](https://github.com/splunk/addonfactory-ucc-generator/issues/1218)) ([1fdebfa](https://github.com/splunk/addonfactory-ucc-generator/commit/1fdebfa28a3cecc7498fb7e1c441f3e0742d89d4))
* **dashboard:** add custom filtering options for the license_usage file ([#1247](https://github.com/splunk/addonfactory-ucc-generator/issues/1247)) ([3e8d864](https://github.com/splunk/addonfactory-ucc-generator/commit/3e8d86476fbf1521785c236c3af15ef3d6fd754d))
* **dashboard:** add globalconfig configuration for custom dashboard tab name ([#1239](https://github.com/splunk/addonfactory-ucc-generator/issues/1239)) ([fce1df4](https://github.com/splunk/addonfactory-ucc-generator/commit/fce1df428b6761ddd20360c6cfc9e8eda1982d74))

## [5.46.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.45.0...v5.46.0) (2024-06-13)


### Bug Fixes

* **oauth:** set loglevel in oauth rh template to use log level set in add-on ([#1227](https://github.com/splunk/addonfactory-ucc-generator/issues/1227)) ([3b7b9e1](https://github.com/splunk/addonfactory-ucc-generator/commit/3b7b9e1b7d02a80acda20c1f3b7619120f7bbefc))


### Features

* allow developers to choose the default view ([#1197](https://github.com/splunk/addonfactory-ucc-generator/issues/1197)) ([21610e2](https://github.com/splunk/addonfactory-ucc-generator/commit/21610e20957796bdc1208b8d9c050f5327fbb2c6)), closes [#1041](https://github.com/splunk/addonfactory-ucc-generator/issues/1041)
* **configuration:** display UCC version ([#1221](https://github.com/splunk/addonfactory-ucc-generator/issues/1221)) ([a63d8b3](https://github.com/splunk/addonfactory-ucc-generator/commit/a63d8b389c1a56c23c647c31866786c05b84dcf8))
* **dashboard:** add error categories to chart and event table in the error panel ([#1225](https://github.com/splunk/addonfactory-ucc-generator/issues/1225)) ([cd2907a](https://github.com/splunk/addonfactory-ucc-generator/commit/cd2907ae1f2369ba5736fa92692bc9afe4854d5d))
* **dashboard:** add resource monitoring tab and information about input status ([#1209](https://github.com/splunk/addonfactory-ucc-generator/issues/1209)) ([e8acfd9](https://github.com/splunk/addonfactory-ucc-generator/commit/e8acfd9d76df207c8344467e95cb6f77d4bd2e3e))
* globalConfig file passed through `--config` accepts only JSON or YAML formats ([#1216](https://github.com/splunk/addonfactory-ucc-generator/issues/1216)) ([f661475](https://github.com/splunk/addonfactory-ucc-generator/commit/f661475201be6e2d9da478e24a20d7a385d7bccc))
* sort table by visible text ([#1205](https://github.com/splunk/addonfactory-ucc-generator/issues/1205)) ([8561e0f](https://github.com/splunk/addonfactory-ucc-generator/commit/8561e0fd5ea99daab5030bec00bb2fcac3b7c9b1))

## [5.45.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.44.0...v5.45.0) (2024-05-28)

### Bug Fixes

* explicitly pass required field ([#1202](https://github.com/splunk/addonfactory-ucc-generator/issues/1202)) ([a0ddbf8](https://github.com/splunk/addonfactory-ucc-generator/commit/a0ddbf896e2598afa6126d752b19aded43f34255))

### Features

* add built-in interval entity ([#1179](https://github.com/splunk/addonfactory-ucc-generator/issues/1179)) ([10ae8e3](https://github.com/splunk/addonfactory-ucc-generator/commit/10ae8e3304e6f7ab6a603ac089df24dbf822f236))
* add flag to add UI source map files during the build process ([#1183](https://github.com/splunk/addonfactory-ucc-generator/issues/1183)) ([6e4944b](https://github.com/splunk/addonfactory-ucc-generator/commit/6e4944b26a6b63eb7a9cc1fde44cc201174ccbc9))
* Improve input helper module init scripts ([#1204](https://github.com/splunk/addonfactory-ucc-generator/issues/1204)) ([9abb12c](https://github.com/splunk/addonfactory-ucc-generator/commit/9abb12c8d46588c85d8e629b3fd6d24b1e86220f))

## [5.44.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.43.0...v5.44.0) (2024-05-14)

### Bug Fixes

* **alert:** graceful handle for usage of activeResponse ([#1185](https://github.com/splunk/addonfactory-ucc-generator/issues/1185)) ([c43f38f](https://github.com/splunk/addonfactory-ucc-generator/commit/c43f38f800b6156a66b6905bdcdfcf4809f280f2))
* **style:** fix label overflow issue for 'OpenAPI.json' button in configuration page ([#1181](https://github.com/splunk/addonfactory-ucc-generator/issues/1181)) ([917f9c9](https://github.com/splunk/addonfactory-ucc-generator/commit/917f9c9972007bddddd1d9a307f58710b85fc260))

### Features

* **auto-gen:** notify users for existing features of UCC framework  ([#1177](https://github.com/splunk/addonfactory-ucc-generator/issues/1177)) ([305dbbd](https://github.com/splunk/addonfactory-ucc-generator/commit/305dbbdeeea6726d363bf8435cb13c5e3ff128b3))
* file input component, supports base64 encoding ([#1167](https://github.com/splunk/addonfactory-ucc-generator/issues/1167)) ([46417c2](https://github.com/splunk/addonfactory-ucc-generator/commit/46417c2351543a35c2e76b787224e3bc3963bb33))
* helper modules for modular inputs ([#1126](https://github.com/splunk/addonfactory-ucc-generator/issues/1126)) ([fde1a33](https://github.com/splunk/addonfactory-ucc-generator/commit/fde1a33f2f9d272f2de5250bd0afbbb22ae87380)), closes [#331](https://github.com/splunk/addonfactory-ucc-generator/issues/331)
* **search:** relocate button from dropdown to action column In input page ([#1148](https://github.com/splunk/addonfactory-ucc-generator/issues/1148)) ([696e5a9](https://github.com/splunk/addonfactory-ucc-generator/commit/696e5a92278fb79851d5927b9d5979a00eeeab0e))

## [5.43.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.42.1...v5.43.0) (2024-04-30)

### Bug Fixes

* do not migrate a logging tab when defaultValue is not set ([#1157](https://github.com/splunk/addonfactory-ucc-generator/issues/1157)) ([5335f5b](https://github.com/splunk/addonfactory-ucc-generator/commit/5335f5bac383b19a6ddd0a36ee71bbfacebf552f))

### Features

* improve front for dashboard page ([#1164](https://github.com/splunk/addonfactory-ucc-generator/issues/1164)) ([efc904f](https://github.com/splunk/addonfactory-ucc-generator/commit/efc904f2eb601e4af296190435f957f7df6f4448))

## [5.42.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.42.0...v5.42.1) (2024-04-22)

### Bug Fixes

* **dashboard:** pin @splunk/react-ui version ([#1158](https://github.com/splunk/addonfactory-ucc-generator/issues/1158)) ([0e9a479](https://github.com/splunk/addonfactory-ucc-generator/commit/0e9a4793a83b81f3e71d7f8093a1a4b05254854b))

## [5.42.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.41.0...v5.42.0) (2024-04-19)

### Bug Fixes

* add customScript for alert action ([#1143](https://github.com/splunk/addonfactory-ucc-generator/issues/1143)) ([12d8392](https://github.com/splunk/addonfactory-ucc-generator/commit/12d8392cc87b8f8c8cd08e0e2f294a413beee7a6))
* add schema version update for alert action ([#1150](https://github.com/splunk/addonfactory-ucc-generator/issues/1150)) ([94f3070](https://github.com/splunk/addonfactory-ucc-generator/commit/94f3070d92bff98aa6212f59230a1f3cd1b5d0aa))
* update idna to 3.7 ([#1146](https://github.com/splunk/addonfactory-ucc-generator/issues/1146)) ([ece8f65](https://github.com/splunk/addonfactory-ucc-generator/commit/ece8f650430e0e5f8cc51f04c5d23caf5d582b14))

### Features

* **adaptiveResponse:** add verbose details for AR alert action ([#1135](https://github.com/splunk/addonfactory-ucc-generator/issues/1135)) ([b19d678](https://github.com/splunk/addonfactory-ucc-generator/commit/b19d678baa0abda207dcf669eaf2a9180bc6585d))
* add iconFileName for alert action ([#1134](https://github.com/splunk/addonfactory-ucc-generator/issues/1134)) ([5a76706](https://github.com/splunk/addonfactory-ucc-generator/commit/5a76706df91ab115c285619adf5db5af712c4581)), closes [#1105](https://github.com/splunk/addonfactory-ucc-generator/issues/1105)
* **CheckboxGroup:** add support for required field ([#1131](https://github.com/splunk/addonfactory-ucc-generator/issues/1131)) ([e101aa3](https://github.com/splunk/addonfactory-ucc-generator/commit/e101aa37263b4c26968c573682c29661a0ccd34a))
* create a playground for global config ([#1144](https://github.com/splunk/addonfactory-ucc-generator/issues/1144)) ([791a6dc](https://github.com/splunk/addonfactory-ucc-generator/commit/791a6dc7ec6abea179c5601093a9bde86ba64ab4))
* enhanced monitoring dashboard ([#1125](https://github.com/splunk/addonfactory-ucc-generator/issues/1125)) ([2d2b143](https://github.com/splunk/addonfactory-ucc-generator/commit/2d2b143c2e8d17341ad8860a4681a096e56eba4a))

## [5.41.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.40.0...v5.41.0) (2024-04-02)

### Bug Fixes

* **storybook:** fix errors related to uncaught network requests ([#1117](https://github.com/splunk/addonfactory-ucc-generator/issues/1117)) ([ee79967](https://github.com/splunk/addonfactory-ucc-generator/commit/ee79967de414219fc1d5f557f212dfe3670b1b3a))

### Features

* **code:** add custom validators for account configuration ([#1115](https://github.com/splunk/addonfactory-ucc-generator/issues/1115)) ([7e77067](https://github.com/splunk/addonfactory-ucc-generator/commit/7e770679aa9b44c9b2283f220de8ed577406754a)), closes [#520](https://github.com/splunk/addonfactory-ucc-generator/issues/520)

## [5.40.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.39.1...v5.40.0) (2024-03-21)

### Bug Fixes

* allow using only one Configuration tab ([#1106](https://github.com/splunk/addonfactory-ucc-generator/issues/1106)) ([f6a7fbd](https://github.com/splunk/addonfactory-ucc-generator/commit/f6a7fbd065d2025292e0d81b809ae031b186b19b))
* custom value passed to component ([#1104](https://github.com/splunk/addonfactory-ucc-generator/issues/1104)) ([729f661](https://github.com/splunk/addonfactory-ucc-generator/commit/729f661b986bf71babbf914b5a9f762d6038c171))

### Features

* logging component ([#1107](https://github.com/splunk/addonfactory-ucc-generator/issues/1107)) ([7a825cb](https://github.com/splunk/addonfactory-ucc-generator/commit/7a825cbddfdade1a182a4fdb0a4e63359dc9b8f8))
* schema changes for LoggingTab ([#1099](https://github.com/splunk/addonfactory-ucc-generator/issues/1099)) ([afea13c](https://github.com/splunk/addonfactory-ucc-generator/commit/afea13cb0fa9f9d97997082e1eea7202ed60734e))

## [5.39.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.39.0...v5.39.1) (2024-03-05)

### Bug Fixes

* modifyFieldsOnValue schema and tests ([#1087](https://github.com/splunk/addonfactory-ucc-generator/issues/1087)) ([4629aa1](https://github.com/splunk/addonfactory-ucc-generator/commit/4629aa1dc5ef4bfae78390809ed2b1a1ca4d8b60))

## [5.39.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.38.0...v5.39.0) (2024-02-20)

### Bug Fixes

* **a11y:** associate labels with inputs ([#1055](https://github.com/splunk/addonfactory-ucc-generator/issues/1055)) ([a880c45](https://github.com/splunk/addonfactory-ucc-generator/commit/a880c45938d3ed7ccfe9300ffc6d910ef2fb7989))
* Add page for proxy configuration ([#1057](https://github.com/splunk/addonfactory-ucc-generator/issues/1057)) ([a76c0c2](https://github.com/splunk/addonfactory-ucc-generator/commit/a76c0c248c7c4f01d60bc4733f7ff2a85b82a691))
* return back div wrapper that shifts layout ([#1061](https://github.com/splunk/addonfactory-ucc-generator/issues/1061)) ([c6a42c6](https://github.com/splunk/addonfactory-ucc-generator/commit/c6a42c6233ea81918d5da067316654526bd1ca7c)), closes [#1055](https://github.com/splunk/addonfactory-ucc-generator/issues/1055)

### Features

* add async on save to entity page ([#1080](https://github.com/splunk/addonfactory-ucc-generator/issues/1080)) ([abe8f96](https://github.com/splunk/addonfactory-ucc-generator/commit/abe8f96256dcc496bc1a84852d44bb89ef9e9401))
* add possibility to use async onSave method ([#1079](https://github.com/splunk/addonfactory-ucc-generator/issues/1079)) ([7dd6640](https://github.com/splunk/addonfactory-ucc-generator/commit/7dd66408d77c5295aabd643cebd428a52aa257ad))
* ADDON-57381 hide implementation details from user-facing error messages ([#987](https://github.com/splunk/addonfactory-ucc-generator/issues/987)) ([5467ed9](https://github.com/splunk/addonfactory-ucc-generator/commit/5467ed9935fd83f17e14775eed7f2a7978c550cf))
* modify fields on value ([#1066](https://github.com/splunk/addonfactory-ucc-generator/issues/1066)) ([1cd25b5](https://github.com/splunk/addonfactory-ucc-generator/commit/1cd25b54c0ed42f374bb3c2f570d397aaef8d4a2))

## [5.38.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.37.0...v5.38.0) (2024-02-06)

### Bug Fixes

* **EntityModal:** prevent Enter from submitting the form in Modal window ([#1047](https://github.com/splunk/addonfactory-ucc-generator/issues/1047)) ([b7f179a](https://github.com/splunk/addonfactory-ucc-generator/commit/b7f179ab20e3bae831f1e7ed5b499ceff59ce6bd)), closes [#875](https://github.com/splunk/addonfactory-ucc-generator/issues/875)
* OpenAPI schema generator fixes for when multiple inputs are defined ([#1016](https://github.com/splunk/addonfactory-ucc-generator/issues/1016)) ([332db43](https://github.com/splunk/addonfactory-ucc-generator/commit/332db4361556b865418b16c6fbd8ce4912ba5084))

### Features

* add UCC version to globalConfig ([#984](https://github.com/splunk/addonfactory-ucc-generator/issues/984)) ([e1229b4](https://github.com/splunk/addonfactory-ucc-generator/commit/e1229b40e48ee485b3d301139834b869054643c0))
* ADDON-67533 implement support for oauth autorize and token urls ([#1009](https://github.com/splunk/addonfactory-ucc-generator/issues/1009)) ([aada373](https://github.com/splunk/addonfactory-ucc-generator/commit/aada37364ed44e63732ac2b23807ce5b4bf084a3))
* allow wildcards in .uccignore file ([#1012](https://github.com/splunk/addonfactory-ucc-generator/issues/1012)) ([04b847f](https://github.com/splunk/addonfactory-ucc-generator/commit/04b847f39cccdd5937faf309fe8a81699d9b8919)), closes [#1011](https://github.com/splunk/addonfactory-ucc-generator/issues/1011)
* change avg() to sum() in PANEL_EVENTS_INGESTED_BY_SOURCETYPE_TEMPLATE panel ([#1028](https://github.com/splunk/addonfactory-ucc-generator/issues/1028)) ([c738634](https://github.com/splunk/addonfactory-ucc-generator/commit/c73863499b9b546593000bc30fdf78f8e927b6d1))
* customizing version of pip in build, add legacy resolver as optional ([#1035](https://github.com/splunk/addonfactory-ucc-generator/issues/1035)) ([751990c](https://github.com/splunk/addonfactory-ucc-generator/commit/751990c65793f88edde305039bd61018d43a481b))
* default warning hidden after any input ([#1024](https://github.com/splunk/addonfactory-ucc-generator/issues/1024)) ([d0d69ee](https://github.com/splunk/addonfactory-ucc-generator/commit/d0d69ee3d0c71e7e5b64850b67219244b265c031))

## [5.37.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.36.2...v5.37.0) (2024-01-31)

### Features

* **checkboxGroup:** correctly parsing values with spaces ([#1034](https://github.com/splunk/addonfactory-ucc-generator/issues/1034)) ([73358ee](https://github.com/splunk/addonfactory-ucc-generator/commit/73358ee58c211e55608e09e1b45e1eeed8ec8df7))

## [5.36.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.36.1...v5.36.2) (2024-01-12)

### Bug Fixes

* table and references ([29e69bb](https://github.com/splunk/addonfactory-ucc-generator/commit/29e69bb5247d667b86eef2e6b7b970cc5e3df065))

## [5.36.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.36.0...v5.36.1) (2024-01-12)

### Bug Fixes

* update jinja2 to v3.1.3 to fix CVE ([#1017](https://github.com/splunk/addonfactory-ucc-generator/issues/1017)) ([25b652f](https://github.com/splunk/addonfactory-ucc-generator/commit/25b652f003b8e58e42e0db67fed31f353bc3e805))

## [5.36.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.35.1...v5.36.0) (2024-01-10)

### Bug Fixes

* enable for entities and add it for oauth ([#964](https://github.com/splunk/addonfactory-ucc-generator/issues/964)) ([21bb7f8](https://github.com/splunk/addonfactory-ucc-generator/commit/21bb7f8321656fb485164704db99731b03ccc769))
* no-compile missing from os-dependentLibraries packages ([#999](https://github.com/splunk/addonfactory-ucc-generator/issues/999)) ([537d450](https://github.com/splunk/addonfactory-ucc-generator/commit/537d4508ec5469bc67148cb7a29b3febe7e8ce98))
* pass disabled props for radio bar component ([#997](https://github.com/splunk/addonfactory-ucc-generator/issues/997)) ([a4eb6f9](https://github.com/splunk/addonfactory-ucc-generator/commit/a4eb6f947088a3e88be8c0d61e97aad4140b9bde))
* typo in the error message ([#1004](https://github.com/splunk/addonfactory-ucc-generator/issues/1004)) ([312c8be](https://github.com/splunk/addonfactory-ucc-generator/commit/312c8be565f49724a92ac6d8c938ba4ecd978bfc))
* update axios along with follow redirect ([#1003](https://github.com/splunk/addonfactory-ucc-generator/issues/1003)) ([7bc5a35](https://github.com/splunk/addonfactory-ucc-generator/commit/7bc5a35e93aea05aa5546c28ebd188fff5265f86))

### Features

* add support for custom dashboards ([#979](https://github.com/splunk/addonfactory-ucc-generator/issues/979)) ([7fe3d58](https://github.com/splunk/addonfactory-ucc-generator/commit/7fe3d58d522599311fceb5f050ba3d7dcabb6ecb))
* ADDON-67093 add custom warning message for forms ([#970](https://github.com/splunk/addonfactory-ucc-generator/issues/970)) ([64daa77](https://github.com/splunk/addonfactory-ucc-generator/commit/64daa7789824b19ef4e5bc980598bc96556ec298))
* buildtime version check for os-dependentLibraries ([#981](https://github.com/splunk/addonfactory-ucc-generator/issues/981)) ([cbe923d](https://github.com/splunk/addonfactory-ucc-generator/commit/cbe923d42fd1e198541c6ec4069a6f93b30807f4))
* custom sub description for pages - ADDON-67014 ([#982](https://github.com/splunk/addonfactory-ucc-generator/issues/982)) ([b3a32c5](https://github.com/splunk/addonfactory-ucc-generator/commit/b3a32c54e38ec85558c5ff3c53bea1290906ae16))
* require variable only when displayed ADDON-67013 ([#985](https://github.com/splunk/addonfactory-ucc-generator/issues/985)) ([6873164](https://github.com/splunk/addonfactory-ucc-generator/commit/6873164997dd5fdf91ded00d12f503740dd31546))

## [5.35.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.35.0...v5.35.1) (2023-12-14)

### Bug Fixes

* add missing colorama dependency ([#973](https://github.com/splunk/addonfactory-ucc-generator/issues/973)) ([f17d47d](https://github.com/splunk/addonfactory-ucc-generator/commit/f17d47d7cf576f5da76c4cc03a21f7d5fe44592a))
* add missing colorama import ([fbb71bd](https://github.com/splunk/addonfactory-ucc-generator/commit/fbb71bd59598e1c4b1fb70600730c4151f158846))

## [5.35.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.34.1...v5.35.0) (2023-12-13)

### Bug Fixes

* add tests and auth_access_token to schema ([#969](https://github.com/splunk/addonfactory-ucc-generator/issues/969)) ([6e1e743](https://github.com/splunk/addonfactory-ucc-generator/commit/6e1e743e29b5e7dcd0a47b9b4e23930838cd9923))

### Features

* add support for downloading os-dependent libraries ([#963](https://github.com/splunk/addonfactory-ucc-generator/issues/963)) ([6cfb5a3](https://github.com/splunk/addonfactory-ucc-generator/commit/6cfb5a3700d85cce014e8dd2fbec59755ac64e13))
* build commands produces detailed output of what happened ([#927](https://github.com/splunk/addonfactory-ucc-generator/issues/927)) ([3fad1a2](https://github.com/splunk/addonfactory-ucc-generator/commit/3fad1a25f9dd437e563f7bfaef7a7946e4fb75a0))

## [5.34.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.34.0...v5.34.1) (2023-12-06)

### Bug Fixes

* add control group wrapper max width to 750px ([#966](https://github.com/splunk/addonfactory-ucc-generator/issues/966)) ([0213c45](https://github.com/splunk/addonfactory-ucc-generator/commit/0213c457154cfbe56014ed358c13afa23e184049))

## [5.34.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.33.0...v5.34.0) (2023-11-28)

### Bug Fixes

* change location of openapi.json generated file ([#958](https://github.com/splunk/addonfactory-ucc-generator/issues/958)) ([e0d38b7](https://github.com/splunk/addonfactory-ucc-generator/commit/e0d38b792596ebd60c407909a589692c425eecd6))
* globalConfig validator respects numbers in values in autoCompleteFields ([#957](https://github.com/splunk/addonfactory-ucc-generator/issues/957)) ([1716494](https://github.com/splunk/addonfactory-ucc-generator/commit/17164942afdc7002f3b83107a067687cb873e8f2))
* revert to static width of modal ([#955](https://github.com/splunk/addonfactory-ucc-generator/issues/955)) ([aec869f](https://github.com/splunk/addonfactory-ucc-generator/commit/aec869f391709496092397cc9164c5a34070975e))
* update urllib3 ([#922](https://github.com/splunk/addonfactory-ucc-generator/issues/922)) ([11ff4c6](https://github.com/splunk/addonfactory-ucc-generator/commit/11ff4c6113930b684985ba1ba6f217e96d59b9d2))

### Features

* add optional label for helpLink component ([#939](https://github.com/splunk/addonfactory-ucc-generator/issues/939)) ([e3a9b40](https://github.com/splunk/addonfactory-ucc-generator/commit/e3a9b400b95b2b5e4d8594f12d9c425dd3c1f5d2))
* add support for disableonEdit in oauth ([#953](https://github.com/splunk/addonfactory-ucc-generator/issues/953)) ([d948128](https://github.com/splunk/addonfactory-ucc-generator/commit/d948128a8039ecdb994214def58c499befe39e82))
* additional validations for the groups feature ([#926](https://github.com/splunk/addonfactory-ucc-generator/issues/926)) ([29c1251](https://github.com/splunk/addonfactory-ucc-generator/commit/29c1251400b80d72e4349f1281df5d8d8ffb5f5d))
* ADDON-64844 better spacing in modal ([#935](https://github.com/splunk/addonfactory-ucc-generator/issues/935)) ([b385759](https://github.com/splunk/addonfactory-ucc-generator/commit/b385759c4e90d534b23025bd2f4353cb566db257))
* ADDON-65107 implement download button for openapi ([#932](https://github.com/splunk/addonfactory-ucc-generator/issues/932)) ([f71d7ec](https://github.com/splunk/addonfactory-ucc-generator/commit/f71d7ec20ada1a3d3a7d0a07bb24d81e7e4e088a))
* **schema.json:** make entity schemas more specific ([#938](https://github.com/splunk/addonfactory-ucc-generator/issues/938)) ([24c667b](https://github.com/splunk/addonfactory-ucc-generator/commit/24c667bb01eb7f62bcd0dd799522ce32e178feb9))

## [5.33.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.32.0...v5.33.0) (2023-11-14)

### Features

* release v5.33.0 ([#942](https://github.com/splunk/addonfactory-ucc-generator/issues/942)) ([c5968d2](https://github.com/splunk/addonfactory-ucc-generator/commit/c5968d2828c4c1662ad01427c68e98497722753a)), closes [#906](https://github.com/splunk/addonfactory-ucc-generator/issues/906) [#922](https://github.com/splunk/addonfactory-ucc-generator/issues/922) [#916](https://github.com/splunk/addonfactory-ucc-generator/issues/916) [#888](https://github.com/splunk/addonfactory-ucc-generator/issues/888)

## [5.32.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.31.1...v5.32.0) (2023-10-13)

### Features

* v5.32.0 release ([#907](https://github.com/splunk/addonfactory-ucc-generator/issues/907)) ([f691ce0](https://github.com/splunk/addonfactory-ucc-generator/commit/f691ce0c58c65fbd19b5f85356aa16f3f446d948)), closes [#897](https://github.com/splunk/addonfactory-ucc-generator/issues/897) [#898](https://github.com/splunk/addonfactory-ucc-generator/issues/898) [#889](https://github.com/splunk/addonfactory-ucc-generator/issues/889) [#899](https://github.com/splunk/addonfactory-ucc-generator/issues/899) [#901](https://github.com/splunk/addonfactory-ucc-generator/issues/901) [#895](https://github.com/splunk/addonfactory-ucc-generator/issues/895)

## [5.31.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.31.0...v5.31.1) (2023-10-06)

### Bug Fixes

* include UCC UI into UCC during the release step ([#891](https://github.com/splunk/addonfactory-ucc-generator/issues/891)) ([5207dca](https://github.com/splunk/addonfactory-ucc-generator/commit/5207dca4d134b970d71f65949f7922daf0955775)), closes [#890](https://github.com/splunk/addonfactory-ucc-generator/issues/890) [#890](https://github.com/splunk/addonfactory-ucc-generator/issues/890)

## [5.31.1-beta.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.31.0...v5.31.1-beta.1) (2023-10-06)

### Bug Fixes

* include UCC UI into UCC during the release step ([#890](https://github.com/splunk/addonfactory-ucc-generator/issues/890)) ([76dd699](https://github.com/splunk/addonfactory-ucc-generator/commit/76dd699435c1b14a40ad459fe10c00aaa551594c))

## [5.31.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.30.0...v5.31.0) (2023-10-05)

It's a technical release to conclude the migration of UCC UI into this repository and we also happen to release 1 feature.

### Features

* "Enable all" / "Disable all" buttons for Inputs page (https://github.com/splunk/addonfactory-ucc-base-ui/pull/437 nad https://github.com/splunk/addonfactory-ucc-base-ui/pull/443)

## [5.30.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.29.0...v5.30.0) (2023-10-01)

### Features

* release v5.30.0 ([#848](https://github.com/splunk/addonfactory-ucc-generator/issues/848)) ([fb93601](https://github.com/splunk/addonfactory-ucc-generator/commit/fb93601573c1083bdb4cdffaea1df8ac00009db8)), closes [#846](https://github.com/splunk/addonfactory-ucc-generator/issues/846) [#847](https://github.com/splunk/addonfactory-ucc-generator/issues/847) [#849](https://github.com/splunk/addonfactory-ucc-generator/issues/849) [#850](https://github.com/splunk/addonfactory-ucc-generator/issues/850)

## [5.29.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.28.6...v5.29.0) (2023-09-22)

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

## [5.28.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.27.3...v5.28.0) (2023-06-22)

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

## [5.27.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.26.0...v5.27.0) (2023-05-17)

### Features

* release v5.27.0 ([#765](https://github.com/splunk/addonfactory-ucc-generator/issues/765)) ([5b55833](https://github.com/splunk/addonfactory-ucc-generator/commit/5b55833086966984acb0526a5708abb599fc1899)), closes [#749](https://github.com/splunk/addonfactory-ucc-generator/issues/749) [#750](https://github.com/splunk/addonfactory-ucc-generator/issues/750) [#751](https://github.com/splunk/addonfactory-ucc-generator/issues/751) [#752](https://github.com/splunk/addonfactory-ucc-generator/issues/752) [#753](https://github.com/splunk/addonfactory-ucc-generator/issues/753) [#754](https://github.com/splunk/addonfactory-ucc-generator/issues/754) [/dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest/#JSON-schema-200](https://github.com//dev.splunk.com/enterprise/reference/packagingtoolkit/pkgtoolkitappmanifest//issues/JSON-schema-200) [#755](https://github.com/splunk/addonfactory-ucc-generator/issues/755)

## [5.26.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.25.0...v5.26.0) (2023-05-02)

### Features

* create openapi such way that generated client code allows to update configuration and inputs ([#740](https://github.com/splunk/addonfactory-ucc-generator/issues/740)) ([c412a60](https://github.com/splunk/addonfactory-ucc-generator/commit/c412a601deaf3fd5eed79f45724d942328127a64))
* GET methods and responses allow to get data ([#742](https://github.com/splunk/addonfactory-ucc-generator/issues/742)) ([6fe35cd](https://github.com/splunk/addonfactory-ucc-generator/commit/6fe35cd5d46606ef800e708c58646eb7b04b1e31))

## [5.25.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.24.0...v5.25.0) (2023-04-18)

### Features

* release v5.25.0 ([#733](https://github.com/splunk/addonfactory-ucc-generator/issues/733)) ([6b3e649](https://github.com/splunk/addonfactory-ucc-generator/commit/6b3e6496dc78728393737569cc9c1cbd14159e66)), closes [#718](https://github.com/splunk/addonfactory-ucc-generator/issues/718) [#719](https://github.com/splunk/addonfactory-ucc-generator/issues/719) [#722](https://github.com/splunk/addonfactory-ucc-generator/issues/722) [#723](https://github.com/splunk/addonfactory-ucc-generator/issues/723) [#724](https://github.com/splunk/addonfactory-ucc-generator/issues/724) [#726](https://github.com/splunk/addonfactory-ucc-generator/issues/726) [#727](https://github.com/splunk/addonfactory-ucc-generator/issues/727) [#725](https://github.com/splunk/addonfactory-ucc-generator/issues/725) [#728](https://github.com/splunk/addonfactory-ucc-generator/issues/728) [#734](https://github.com/splunk/addonfactory-ucc-generator/issues/734) [#735](https://github.com/splunk/addonfactory-ucc-generator/issues/735)

## [5.24.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.23.2...v5.24.0) (2023-04-04)

### Features

* release v5.24.0 ([#713](https://github.com/splunk/addonfactory-ucc-generator/issues/713)) ([e5bc2f1](https://github.com/splunk/addonfactory-ucc-generator/commit/e5bc2f1a02a496e8abead872641eec047784b17d)), closes [#709](https://github.com/splunk/addonfactory-ucc-generator/issues/709) [#710](https://github.com/splunk/addonfactory-ucc-generator/issues/710) [#711](https://github.com/splunk/addonfactory-ucc-generator/issues/711) [#712](https://github.com/splunk/addonfactory-ucc-generator/issues/712) [#714](https://github.com/splunk/addonfactory-ucc-generator/issues/714)

## [5.23.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.23.1...v5.23.2) (2023-03-23)

### Bug Fixes

* move mkdocs-material to dev dependency ([#707](https://github.com/splunk/addonfactory-ucc-generator/issues/707)) ([504dbfa](https://github.com/splunk/addonfactory-ucc-generator/commit/504dbfae57393340636473c8196b452a1f539972))

## [5.23.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.23.0...v5.23.1) (2023-03-20)

### Bug Fixes

* dropdownlist_splunk_search does not require options ([#706](https://github.com/splunk/addonfactory-ucc-generator/issues/706)) ([ff9e50b](https://github.com/splunk/addonfactory-ucc-generator/commit/ff9e50b36846c7bf7fea6ef30fef0b2251fb6d1a))

## [5.23.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.22.0...v5.23.0) (2023-03-20)

### Features

* release v5.23.0 ([#705](https://github.com/splunk/addonfactory-ucc-generator/issues/705)) ([f8211f6](https://github.com/splunk/addonfactory-ucc-generator/commit/f8211f663bd79ec186a9ebfe0185876f2d40e93b)), closes [#699](https://github.com/splunk/addonfactory-ucc-generator/issues/699) [#700](https://github.com/splunk/addonfactory-ucc-generator/issues/700) [#703](https://github.com/splunk/addonfactory-ucc-generator/issues/703) [#704](https://github.com/splunk/addonfactory-ucc-generator/issues/704) [#702](https://github.com/splunk/addonfactory-ucc-generator/issues/702) [#701](https://github.com/splunk/addonfactory-ucc-generator/issues/701)

## [5.22.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.21.0...v5.22.0) (2023-03-09)

### Features

* v5.22.0 release ([#678](https://github.com/splunk/addonfactory-ucc-generator/issues/678)) ([9efc0c2](https://github.com/splunk/addonfactory-ucc-generator/commit/9efc0c21d300d168f83d4eb06a5d6605f57c081b)), closes [#662](https://github.com/splunk/addonfactory-ucc-generator/issues/662) [#663](https://github.com/splunk/addonfactory-ucc-generator/issues/663) [#664](https://github.com/splunk/addonfactory-ucc-generator/issues/664) [#665](https://github.com/splunk/addonfactory-ucc-generator/issues/665) [#666](https://github.com/splunk/addonfactory-ucc-generator/issues/666) [#667](https://github.com/splunk/addonfactory-ucc-generator/issues/667) [#668](https://github.com/splunk/addonfactory-ucc-generator/issues/668) [#669](https://github.com/splunk/addonfactory-ucc-generator/issues/669) [#670](https://github.com/splunk/addonfactory-ucc-generator/issues/670) [#672](https://github.com/splunk/addonfactory-ucc-generator/issues/672) [#673](https://github.com/splunk/addonfactory-ucc-generator/issues/673) [#671](https://github.com/splunk/addonfactory-ucc-generator/issues/671) [#674](https://github.com/splunk/addonfactory-ucc-generator/issues/674) [#677](https://github.com/splunk/addonfactory-ucc-generator/issues/677) [#679](https://github.com/splunk/addonfactory-ucc-generator/issues/679) [#680](https://github.com/splunk/addonfactory-ucc-generator/issues/680) [#681](https://github.com/splunk/addonfactory-ucc-generator/issues/681) [#682](https://github.com/splunk/addonfactory-ucc-generator/issues/682) [#683](https://github.com/splunk/addonfactory-ucc-generator/issues/683) [#684](https://github.com/splunk/addonfactory-ucc-generator/issues/684) [#685](https://github.com/splunk/addonfactory-ucc-generator/issues/685) [#686](https://github.com/splunk/addonfactory-ucc-generator/issues/686) [#688](https://github.com/splunk/addonfactory-ucc-generator/issues/688) [#689](https://github.com/splunk/addonfactory-ucc-generator/issues/689) [#687](https://github.com/splunk/addonfactory-ucc-generator/issues/687) [#690](https://github.com/splunk/addonfactory-ucc-generator/issues/690) [#691](https://github.com/splunk/addonfactory-ucc-generator/issues/691) [#693](https://github.com/splunk/addonfactory-ucc-generator/issues/693) [#694](https://github.com/splunk/addonfactory-ucc-generator/issues/694) [#695](https://github.com/splunk/addonfactory-ucc-generator/issues/695) [#692](https://github.com/splunk/addonfactory-ucc-generator/issues/692) [#697](https://github.com/splunk/addonfactory-ucc-generator/issues/697)

## [5.21.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.20.0...v5.21.0) (2023-02-22)

### Features

* release v5.21.0 ([#659](https://github.com/splunk/addonfactory-ucc-generator/issues/659)) ([fdd7164](https://github.com/splunk/addonfactory-ucc-generator/commit/fdd7164548e3ac874c50d005e64979576ab38864)), closes [#656](https://github.com/splunk/addonfactory-ucc-generator/issues/656) [#658](https://github.com/splunk/addonfactory-ucc-generator/issues/658) [#657](https://github.com/splunk/addonfactory-ucc-generator/issues/657) [#650](https://github.com/splunk/addonfactory-ucc-generator/issues/650)

## [5.20.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.19.0...v5.20.0) (2023-02-13)

### Features

* release v5.20.0 ([#634](https://github.com/splunk/addonfactory-ucc-generator/issues/634)) ([e2a389d](https://github.com/splunk/addonfactory-ucc-generator/commit/e2a389df3f107dc01f7d2210fc45bbad82ae58b1)), closes [#624](https://github.com/splunk/addonfactory-ucc-generator/issues/624) [#626](https://github.com/splunk/addonfactory-ucc-generator/issues/626) [#615](https://github.com/splunk/addonfactory-ucc-generator/issues/615) [#618](https://github.com/splunk/addonfactory-ucc-generator/issues/618) [#612](https://github.com/splunk/addonfactory-ucc-generator/issues/612) [#629](https://github.com/splunk/addonfactory-ucc-generator/issues/629) [#632](https://github.com/splunk/addonfactory-ucc-generator/issues/632) [#633](https://github.com/splunk/addonfactory-ucc-generator/issues/633)
* trigger v5.20.0 release ([#635](https://github.com/splunk/addonfactory-ucc-generator/issues/635)) ([d07f487](https://github.com/splunk/addonfactory-ucc-generator/commit/d07f4874fdbb04e595045b1f7839c378be555b3e))

## [5.19.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.18.0...v5.19.0) (2023-01-03)

### Features

* release v5.19.0 ([#601](https://github.com/splunk/addonfactory-ucc-generator/issues/601)) ([2dc1ae1](https://github.com/splunk/addonfactory-ucc-generator/commit/2dc1ae16b8b69d09d386802e7030b4d9a1718992)), closes [#593](https://github.com/splunk/addonfactory-ucc-generator/issues/593) [#594](https://github.com/splunk/addonfactory-ucc-generator/issues/594) [#595](https://github.com/splunk/addonfactory-ucc-generator/issues/595) [/github.com/splunk/addonfactory-ucc-base-ui/blob/283d5abcf8f462ac10de876464bc1719fd19ff90/src/main/webapp/util/uccConfigurationValidators.js#L170-L184](https://github.com//github.com/splunk/addonfactory-ucc-base-ui/blob/283d5abcf8f462ac10de876464bc1719fd19ff90/src/main/webapp/util/uccConfigurationValidators.js/issues/L170-L184) [#584](https://github.com/splunk/addonfactory-ucc-generator/issues/584)

## [5.18.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.17.1...v5.18.0) (2022-12-12)

### Features

* v5.18.0 release ([#583](https://github.com/splunk/addonfactory-ucc-generator/issues/583)) ([312839e](https://github.com/splunk/addonfactory-ucc-generator/commit/312839ea0888c673ddd706578a2891d6e9662d37))

## [5.17.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.17.0...v5.17.1) (2022-11-30)

### Bug Fixes

* update UCC UI to v1.15.1 ([#578](https://github.com/splunk/addonfactory-ucc-generator/issues/578)) ([173a8f2](https://github.com/splunk/addonfactory-ucc-generator/commit/173a8f2a33299f66c5d5f5041caf532a4710500f))

## [5.17.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.16.1...v5.17.0) (2022-11-29)

### Features

* update UCC UI to 1.15.0 ([#576](https://github.com/splunk/addonfactory-ucc-generator/issues/576)) ([a2788a2](https://github.com/splunk/addonfactory-ucc-generator/commit/a2788a237f49415707e3c0bef2befb573bae35b1))

## [5.16.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.16.0...v5.16.1) (2022-11-28)

### Bug Fixes

* update UCC UI to 1.14.2 ([#573](https://github.com/splunk/addonfactory-ucc-generator/issues/573)) ([20d2a5c](https://github.com/splunk/addonfactory-ucc-generator/commit/20d2a5c50704d65669028967980712ea6a7939f2))

## [5.16.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.15.1...v5.16.0) (2022-11-23)

### Features

* update UCC UI to v1.14.1 ([#563](https://github.com/splunk/addonfactory-ucc-generator/issues/563)) ([9d9cb86](https://github.com/splunk/addonfactory-ucc-generator/commit/9d9cb8682a7de72e949c23efb782c93d5fa45f36))

## [5.15.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.15.0...v5.15.1) (2022-11-09)

### Bug Fixes

* build add-on if config param is present ([536634a](https://github.com/splunk/addonfactory-ucc-generator/commit/536634af784685b98f563c3ae5543ac63e064825))

## [5.15.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.14.2...v5.15.0) (2022-11-07)

### Features

* add validation for the splunktaucclib to be included ([#549](https://github.com/splunk/addonfactory-ucc-generator/issues/549)) ([b7eacb6](https://github.com/splunk/addonfactory-ucc-generator/commit/b7eacb6678efd26b6fe846c045996e86a562a1ca))

## [5.14.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.14.1...v5.14.2) (2022-11-02)

### Bug Fixes

* update UCC UI to v1.12.4 ([#546](https://github.com/splunk/addonfactory-ucc-generator/issues/546)) ([65da70b](https://github.com/splunk/addonfactory-ucc-generator/commit/65da70bb0c2ac931dbc9f400d9007612e1d17283))

## [5.14.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.14.0...v5.14.1) (2022-10-18)

### Bug Fixes

* **code:** ADDON-56381 Using the latest version of UCC UI ([#540](https://github.com/splunk/addonfactory-ucc-generator/issues/540)) ([d760a31](https://github.com/splunk/addonfactory-ucc-generator/commit/d760a312d04fafa3e5e7f84090cce5c7ef1756ab))

## [5.14.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.13.0...v5.14.0) (2022-10-18)

### Features

* added support for YAML file ([#536](https://github.com/splunk/addonfactory-ucc-generator/issues/536)) ([10eebaa](https://github.com/splunk/addonfactory-ucc-generator/commit/10eebaa4a8d9f51f47b8e86262866d592940054b))

## [5.13.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.12.0...v5.13.0) (2022-08-02)

### Features

* add --python-binary-name flag to specify Python name to install libraries ([#485](https://github.com/splunk/addonfactory-ucc-generator/issues/485)) ([bc46170](https://github.com/splunk/addonfactory-ucc-generator/commit/bc46170d889b31a192fe553bad7ccab3f91001f7))

## [5.12.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.11.0...v5.12.0) (2022-07-08)

### Features

* new version of UCC UI ([#479](https://github.com/splunk/addonfactory-ucc-generator/issues/479)) ([db72816](https://github.com/splunk/addonfactory-ucc-generator/commit/db728163afc208d3fe0f623f3f9653a17fa911e2))

## [5.11.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.10.4...v5.11.0) (2022-07-08)

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

## [5.10.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.9.0...v5.10.0) (2021-11-16)

### Features

* migrate to separate conf-parser library ([2ab9fe9](https://github.com/splunk/addonfactory-ucc-generator/commit/2ab9fe94157da0000a2360c008a9c78cb93782c2))

## [5.9.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.8.2...v5.9.0) (2021-10-04)

### Features

* trigger v5.9.0 release ([a01259c](https://github.com/splunk/addonfactory-ucc-generator/commit/a01259cb7006cbad918edd33251133e94c1be24d))

## [5.8.2](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.8.1...v5.8.2) (2021-08-18)

### Bug Fixes

* add icon_path to each modular alert conf ([c6828b9](https://github.com/splunk/addonfactory-ucc-generator/commit/c6828b9c4488281b0efd9ba00dbdef37c0cf6aa5))

## [5.8.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.8.0...v5.8.1) (2021-08-17)

### Bug Fixes

* alert html generation ([7dc8860](https://github.com/splunk/addonfactory-ucc-generator/commit/7dc8860301d605ab8c05ec3aada6f4da6e615a17))

## [5.8.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.7.0...v5.8.0) (2021-08-16)

### Features

* delete `apiVersion` from globalConfig.json and bump schemaVersion ([6c22704](https://github.com/splunk/addonfactory-ucc-generator/commit/6c22704229b454876715214f1371b2746eee38c7))

## [5.7.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.6.2...v5.7.0) (2021-08-14)

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

## [5.6.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.5.9...v5.6.0) (2021-08-09)

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

## [5.3.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.2.1...v5.3.0) (2021-06-14)

### Bug Fixes

* update Splunk libraries to latest versions ([#229](https://github.com/splunk/addonfactory-ucc-generator/issues/229)) ([1bddfd6](https://github.com/splunk/addonfactory-ucc-generator/commit/1bddfd62633df52dc001ce3fed61e3147acfc96e))

### Features

* pip causing app inspect failures and NOTICE ([#224](https://github.com/splunk/addonfactory-ucc-generator/issues/224)) ([d83b687](https://github.com/splunk/addonfactory-ucc-generator/commit/d83b6876e485a67a954a4bb17662a1b2a4fe6393))

## [5.2.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.2.0...v5.2.1) (2021-06-13)

### Bug Fixes

* switch to slim docker image ([7bde41c](https://github.com/splunk/addonfactory-ucc-generator/commit/7bde41c6d677fa7c986fa1e71724789da8d2d5c4))

## [5.2.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.1.0...v5.2.0) (2021-06-12)

### Features

* drop support for py2/py3 compatible libraries ([#225](https://github.com/splunk/addonfactory-ucc-generator/issues/225)) ([29fafad](https://github.com/splunk/addonfactory-ucc-generator/commit/29fafadf477a99b2eae1a9dd5a0915ab66e97a76))

## [5.1.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v5.0.3...v5.1.0) (2021-06-09)

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

## [5.0.0-develop.1](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.4.0-develop.3...v5.0.0-develop.1) (2021-05-31)

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

## [4.4.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.3.0...v4.4.0) (2021-04-14)

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

## [4.4.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.3.0...v4.4.0) (2021-04-14)

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

## [4.4.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.3.0...v4.4.0) (2021-04-14)

### Features

* validate JSON configuration before generating build ([0c80d62](https://github.com/splunk/addonfactory-ucc-generator/commit/0c80d6242c26245a6318109491fbf200ecdf1f6d))

## [4.3.0](https://github.com/splunk/addonfactory-ucc-generator/compare/v4.2.3...v4.3.0) (2021-04-06)

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
