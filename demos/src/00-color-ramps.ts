import { ColorRampCollection } from "../../src/ColorRamp";
import { ColorRamp } from "ColorRamp";

main();

function main() {
  const colorrampContainer = document.getElementById("colorramp-container");

  function displayColorRamp(name: string, colorramp: ColorRamp, extraInfo = "") {
    const canvas = colorramp.getCanvasStrip();
    canvas.style.height = "20px";

    const div = document.createElement("div");
    const descSpan = document.createElement("span");
    descSpan.innerHTML = `${name}${extraInfo}`;

    div.appendChild(descSpan);
    div.appendChild(canvas);
    colorrampContainer?.appendChild(div);
  }

  Object.keys(ColorRampCollection).forEach((k) => {
    const colorramp = ColorRampCollection[k as keyof typeof ColorRampCollection];
    displayColorRamp(k, colorramp);

    // if (i === 0) return;

    // displayColorRamp(k, colorramp.resample("ease-in-square"), ', resampling method: "ease-in-square"')
    // displayColorRamp(k, colorramp.resample("ease-in-sqrt"), ', resampling method: "ease-in-sqrt"')
    // displayColorRamp(k, colorramp.resample("ease-in-exp"), ', resampling method: "ease-in-exp"')

    // displayColorRamp(k, colorramp.resample("ease-out-square"), ', resampling method: "ease-out-square"')
    // displayColorRamp(k, colorramp.resample("ease-out-sqrt"), ', resampling method: "ease-out-sqrt"')
    // displayColorRamp(k, colorramp.resample("ease-out-exp"), ', resampling method: "ease-out-exp"')

    // colorrampContainer.appendChild( document.createElement("p") );
  });
}
