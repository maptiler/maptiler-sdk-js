[MapTiler SDK](README.md) / Exports

# MapTiler SDK

## Table of contents

### Enumerations

- [Unit](enums/Unit.md)

### Classes

- [Map](classes/Map.md)
- [SdkConfig](classes/SdkConfig.md)

### Type Aliases

- [LanguageString](modules.md#languagestring)
- [MapOptions](modules.md#mapoptions)
- [StyleString](modules.md#stylestring)

### Variables

- [Language](modules.md#language)
- [Style](modules.md#style)
- [config](modules.md#config)

## Type Aliases

### LanguageString

Ƭ **LanguageString**: `Values`<typeof [`Language`](modules.md#language)\>

Built-in languages values as strings

#### Defined in

[language.ts:104](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/language.ts#L104)

___

### MapOptions

Ƭ **MapOptions**: `Omit`<`maplibre.MapOptions`, ``"style"`` \| ``"maplibreLogo"``\> & { `enableTerrain?`: `boolean` ; `maptilerLogo?`: `boolean` ; `style?`: `string` ; `terrainExaggeration?`: `number`  }

Options to provide to the `Map` constructor

#### Defined in

[Map.ts:23](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L23)

___

### StyleString

Ƭ **StyleString**: `Values`<typeof [`Style`](modules.md#style)\>

Built-in style values as strings

#### Defined in

[style.ts:22](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/style.ts#L22)

## Variables

### Language

• `Const` **Language**: `Object`

Languages. Note that not all the languages of this list are available but the compatibility list may be expanded in the future.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ALBANIAN` | ``"sq"`` | - |
| `AMHARIC` | ``"am"`` | - |
| `ARABIC` | ``"ar"`` | - |
| `ARMENIAN` | ``"hy"`` | - |
| `AUTO` | ``"auto"`` | AUTO mode uses the language of the browser |
| `AZERBAIJANI` | ``"az"`` | - |
| `BASQUE` | ``"eu"`` | - |
| `BELORUSSIAN` | ``"be"`` | - |
| `BOSNIAN` | ``"bs"`` | - |
| `BRETON` | ``"br"`` | - |
| `BULGARIAN` | ``"bg"`` | - |
| `CATALAN` | ``"ca"`` | - |
| `CHINESE` | ``"zh"`` | - |
| `CORSICAN` | ``"co"`` | - |
| `CROATIAN` | ``"hr"`` | - |
| `CZECH` | ``"cs"`` | - |
| `DANISH` | ``"da"`` | - |
| `DUTCH` | ``"nl"`` | - |
| `ENGLISH` | ``"en"`` | - |
| `ESPERANTO` | ``"eo"`` | - |
| `ESTONIAN` | ``"et"`` | - |
| `FINNISH` | ``"fi"`` | - |
| `FRENCH` | ``"fr"`` | - |
| `FRISIAN` | ``"fy"`` | - |
| `GEORGIAN` | ``"ka"`` | - |
| `GERMAN` | ``"de"`` | - |
| `GREEK` | ``"el"`` | - |
| `HEBREW` | ``"he"`` | - |
| `HINDI` | ``"hi"`` | - |
| `HUNGARIAN` | ``"hu"`` | - |
| `ICELANDIC` | ``"is"`` | - |
| `INDONESIAN` | ``"id"`` | - |
| `IRISH` | ``"ga"`` | - |
| `ITALIAN` | ``"it"`` | - |
| `JAPANESE` | ``"ja"`` | - |
| `JAPANESE_2018` | ``"ja-Latn"`` | - |
| `JAPANESE_HIRAGANA` | ``"ja-Hira"`` | - |
| `JAPANESE_KANA` | ``"ja_kana"`` | - |
| `JAPANESE_LATIN` | ``"ja_rm"`` | - |
| `KANNADA` | ``"kn"`` | - |
| `KAZAKH` | ``"kk"`` | - |
| `KOREAN` | ``"ko"`` | - |
| `KOREAN_LATIN` | ``"ko-Latn"`` | - |
| `KURDISH` | ``"ku"`` | - |
| `LATIN` | ``"latin"`` | Default fallback languages that uses latin charaters |
| `LATVIAN` | ``"lv"`` | - |
| `LITHUANIAN` | ``"lt"`` | - |
| `LOCAL` | ``""`` | Labels are in their local language, when available |
| `LUXEMBOURGISH` | ``"lb"`` | - |
| `MACEDONIAN` | ``"mk"`` | - |
| `MALAYALAM` | ``"ml"`` | - |
| `MALTESE` | ``"mt"`` | - |
| `NON_LATIN` | ``"nonlatin"`` | Default fallback languages that uses non-latin charaters |
| `NORWEGIAN` | ``"no"`` | - |
| `OCCITAN` | ``"oc"`` | - |
| `POLISH` | ``"pl"`` | - |
| `PORTUGUESE` | ``"pt"`` | - |
| `ROMANIAN` | ``"ro"`` | - |
| `ROMANSH` | ``"rm"`` | - |
| `ROMAN_LATIN` | ``"la"`` | - |
| `RUSSIAN` | ``"ru"`` | - |
| `SCOTTISH_GAELIC` | ``"gd"`` | - |
| `SERBIAN_CYRILLIC` | ``"sr"`` | - |
| `SERBIAN_LATIN` | ``"sr-Latn"`` | - |
| `SLOVAK` | ``"sk"`` | - |
| `SLOVENE` | ``"sl"`` | - |
| `SPANISH` | ``"es"`` | - |
| `SWEDISH` | ``"sv"`` | - |
| `TAMIL` | ``"ta"`` | - |
| `TELUGU` | ``"te"`` | - |
| `THAI` | ``"th"`` | - |
| `TURKISH` | ``"tr"`` | - |
| `UKRAINIAN` | ``"uk"`` | - |
| `WELSH` | ``"cy"`` | - |

#### Defined in

[language.ts:4](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/language.ts#L4)

___

### Style

• `Const` **Style**: `Object`

Built-in styles

#### Type declaration

| Name | Type |
| :------ | :------ |
| `BASIC` | ``"basic-v2"`` |
| `DARK` | ``"streets-v2-dark"`` |
| `HYBRID` | ``"hybrid"`` |
| `LIGHT` | ``"streets-v2-light"`` |
| `OUTDOOR` | ``"outdoor"`` |
| `SATELLITE` | ``"satellite"`` |
| `STREETS` | ``"streets-v2"`` |

#### Defined in

[style.ts:7](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/style.ts#L7)

___

### config

• `Const` **config**: [`SdkConfig`](classes/SdkConfig.md)

#### Defined in

[config.ts:59](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/config.ts#L59)
