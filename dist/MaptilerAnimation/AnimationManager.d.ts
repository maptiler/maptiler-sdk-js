import { MaptilerAnimation } from './index';
/**
 * Manager for handling animation lifecycle and updates.
 *
 * The AnimationManager provides a centralized system for registering and
 * coordinating multiple animations. To avoid individual calls to request animation frame
 * for each animation, it maintains an animation loop
 *
 * This is not a class as it never needs to be instantiated,
 * it's just a singeton object.
 *
 * It's not called directly but used within the MaptilerAnimation class.
 */
declare const AnimationManager: {
    animations: MaptilerAnimation[];
    running: boolean;
    /**
     * Adds an animation to the manager. If this is the first animation added,
     * it starts the animation loop.
     *
     * @param {MaptilerAnimation} animation - The animation to add.
     */
    add(animation: MaptilerAnimation): void;
    /**
     * Removes an animation from the manager. If there are no more animations,
     * it stops the animation loop.
     *
     * @param {MaptilerAnimation} animation - The animation to remove.
     */
    remove(animation: MaptilerAnimation): void;
    /**
     * Stops the animation loop.
     */
    stop(): void;
    /**
     * Starts the animation loop. This function is called recursively using
     * requestAnimationFrame to ensure smooth updates.
     */
    start(): void;
};
export default AnimationManager;
