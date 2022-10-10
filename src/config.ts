interface ConfigInterface {
  apiToken: string,
  verbose: boolean,
}

const config: ConfigInterface = {
  apiToken: 'Not defined yet.',
  verbose: false,
}

export { config };