export interface Config {
  apiToken: string;
  verbose: boolean;
  primaryLanguage: string | null;
  secondaryLanguage: string | null;
}

const config: Config = {
  apiToken: "Not defined yet.",
  verbose: false,
  primaryLanguage: null,
  secondaryLanguage: null,
};

export { config };
