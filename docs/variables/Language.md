[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / Language

# Variable: Language

> `const` **Language**: `object`

Defined in: [src/language.ts:4](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/language.ts#L4)

## Type declaration

### STYLE

> `readonly` **STYLE**: `LanguageInfo`

Language mode to display labels in a language enforced in the style.

### STYLE\_LOCK

> `readonly` **STYLE\_LOCK**: `LanguageInfo`

Language mode to display labels in a language enforced in the style. The language cannot be further modified.

### VISITOR

> `readonly` **VISITOR**: `LanguageInfo`

Language mode to display labels in both the local language and the language of the visitor's device, concatenated.
Note that if those two languages are the same, labels won't be duplicated.

### VISITOR\_ENGLISH

> `readonly` **VISITOR\_ENGLISH**: `LanguageInfo`

Language mode to display labels in both the local language and English, concatenated.
Note that if those two languages are the same, labels won't be duplicated.
