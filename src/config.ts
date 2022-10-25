interface ConfigInterface {
  apiToken: string;
  verbose: boolean;
  primaryLanguage: string | null;
  secondaryLanguage: string | null;
}

const config: ConfigInterface = {
  apiToken: "Not defined yet.",
  verbose: false,
  primaryLanguage: null,
  secondaryLanguage: null,
};

export { config };
