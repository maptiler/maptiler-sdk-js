import MTAnimation from "./MTAnimation";

// This is not a class as it never needs to be
// instantiated, it's just a singeton object
// that manages all animations
const AnimationManager = {
  animations: new Set<MTAnimation>(),
  running: false,
  add(animation: MTAnimation) {
    this.animations.add(animation);
    if (!this.running) {
      this.running = true;
      this.start();
    }
  },

  remove(animation: MTAnimation) {
    this.animations.delete(animation);
    if (this.animations.size === 0) {
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
      if (this.animations.size === 0) {

        this.running = false;
        return;
      }

      for (const animation of this.animations) {
        if (!animation.isPlaying) {
          continue;
        }
        animation.update();
      }

      requestAnimationFrame(loop);
    }

    loop()
  }
}

export default AnimationManager;