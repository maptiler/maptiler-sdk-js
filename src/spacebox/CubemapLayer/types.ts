type ChromaKeyDefinition = {
  color: [number, number, number];
  threshold: number;
};

type CubemapDefinition = {
  path: string;
  chromaKey?: ChromaKeyDefinition;
};

export type { CubemapDefinition, ChromaKeyDefinition };
