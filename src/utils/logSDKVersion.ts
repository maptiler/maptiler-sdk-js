import { getVersion } from "..";

export function logSDKVersion() {
  const purpleCSS = "color: #3A1888; background: white; padding: 5px 0; font-weight: bold;";
  const yellowCSS = "color: #FBC935; background: white; padding: 5px; font-weight: bold;";
  const redCSS = "color: #F1175D; background: white; padding: 5px 0; font-weight: bold;";
  const blackCSS = "color: #333; background: white; padding: 5px 0; font-weight: bold;";

  console.info(
    `%c❖%c❖%c❖ %cMapTiler SDK JS v${getVersion()} %c❖%c❖%c❖`,
    yellowCSS + "padding-right: 0;",
    purpleCSS,
    redCSS,
    blackCSS,
    redCSS,
    purpleCSS,
    yellowCSS + "padding-left: 0;",
  );
}
