[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / findNextEntryAndIndexWithValue

# Function: findNextEntryAndIndexWithValue()

> **findNextEntryAndIndexWithValue**(`arr`, `currentIndex`): (`null` \| `number`)[]

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:75](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L75)

Looks ahead in an array for the next entry that is not null.

## Parameters

### arr

[`NumericArrayWithNull`](../type-aliases/NumericArrayWithNull.md)

The array to search through

### currentIndex

`number`

The index to start searching from

## Returns

(`null` \| `number`)[]

[index, value] A tuple containing the index of the next entry and its value, or null if not found
