import MaptilerAnimation from "./MaptilerAnimation";

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
const AnimationManager = {
  animations: new Array<MaptilerAnimation>(),
  running: false,
  /**
   * Adds an animation to the manager. If this is the first animation added,
   * it starts the animation loop.
   *
   * @param {MaptilerAnimation} animation - The animation to add.
   */
  add(animation: MaptilerAnimation) {
    this.animations.push(animation);
    if (!this.running) {
      this.running = true;
      this.start();
    }
  },
  /**
   * Removes an animation from the manager. If there are no more animations,
   * it stops the animation loop.
   *
   * @param {MaptilerAnimation} animation - The animation to remove.
   */
  remove(animation: MaptilerAnimation) {
    this.animations = this.animations.filter((a) => a !== animation);
    if (this.animations.length === 0) {
      this.stop();
    }
  },
  /**
   * Stops the animation loop.
   */
  stop() {
    this.running = false;
  },
  /**
   * Starts the animation loop. This function is called recursively using
   * requestAnimationFrame to ensure smooth updates.
   */
  start() {
    if (!this.running) {
      return;
    }
    const loop = () => {
      if (this.animations.length === 0) {
        this.running = false;
        return;
      }

      this.animations.forEach((animation) => {
        if (animation.isPlaying) {
          animation.updateInternal();
        }
      });

      requestAnimationFrame(loop);
    };

    loop();
  },
};

export default AnimationManager;
