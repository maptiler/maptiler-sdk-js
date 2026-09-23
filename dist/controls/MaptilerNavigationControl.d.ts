import { NavigationControlOptions } from 'maplibre-gl';
import { NavigationControl } from '../MLAdapters/NavigationControl';
type HTMLButtonElementPlus = HTMLButtonElement & {
    clickFunction: (e?: Event) => unknown;
};
export declare class MaptilerNavigationControl extends NavigationControl {
    constructor(options?: NavigationControlOptions);
    /**
     * Overloading: the button now stores its click callback so that we can later on delete it and replace it
     */
    _createButton(className: string, fn: (e?: Event) => unknown): HTMLButtonElementPlus;
    /**
     * Overloading: Limit how flat the compass icon can get
     */
    _rotateCompassArrow: () => void;
}
export {};
