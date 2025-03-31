import MTAnimation from "./MTAnimation";

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
 * It's not called directly but used within the MTAnimation class.
 *
 */
const AnimationManager = {
  animations: new Array<MTAnimation>(),
  running: false,
  add(animation: MTAnimation) {
    this.animations.push(animation);
    if (!this.running) {
      this.running = true;
      this.start();
    }
  },

  remove(animation: MTAnimation) {
    this.animations = this.animations.filter((a) => a !== animation);
    if (this.animations.length === 0) {
      this.stop();
    }
  },

  stop() {
    this.running = false;
  },

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
