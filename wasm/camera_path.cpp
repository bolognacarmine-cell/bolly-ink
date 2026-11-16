#include <cmath>
#include <algorithm>

extern "C" {

// Computes cinematic camera position and look-at target.
// Inputs:
//  - t: elapsed time (seconds)
//  - phase: cinematic phase (0 awaken, 1 write/track, 2 reveal, 3 settle)
//  - mouseX, mouseY: normalized pointer [-1, 1]
//  - scroll: scroll progress [0, 1]
//  - reduced: 1 for reduced motion, else 0
// Outputs (arrays of length 3): pos[xyz], look[xyz]
void computeCamera(
  float t,
  int phase,
  float mouseX,
  float mouseY,
  float scroll,
  int reduced,
  float* pos,
  float* look
) {
  auto lerp = [](float a, float b, float p) { return a + (b - a) * p; };
  auto clamp01 = [](float v) { return std::max(0.0f, std::min(1.0f, v)); };

  if (reduced) {
    pos[0] = 0.0f; pos[1] = 0.3f; pos[2] = 9.2f;
    look[0] = 0.0f; look[1] = -0.1f; look[2] = 0.0f;
    return;
  }

  float tx = 0.2f + mouseX * 0.4f;
  float ty = 0.35f + mouseY * 0.25f;
  float tz = 8.6f;
  float lx = 0.0f, ly = -0.1f, lz = 0.0f;

  if (phase == 0) {
    tx = 0.8f + std::sin(t * 0.7f) * 0.08f;
    ty = 0.45f;
    tz = 3.8f;
    lx = 0.15f; ly = 0.35f; lz = 0.8f;
  } else if (phase == 1) {
    float p = clamp01((t - 2.2f) / 4.8f);
    float orbit = p * 0.35f;
    tx = lerp(0.8f, -0.6f, p) + std::sin(orbit) * 0.6f + mouseX * 0.25f;
    ty = lerp(0.45f, 0.4f, p) + mouseY * 0.15f;
    tz = lerp(3.8f, 7.2f, p);
    lx = lerp(0.15f, 0.0f, p);
    ly = lerp(0.2f, -0.05f, p);
    lz = 0.0f;
  } else if (phase == 2) {
    tx = -0.2f + mouseX * 0.35f;
    ty = 0.5f + mouseY * 0.2f;
    tz = 8.0f;
    lx = 0.0f; ly = 0.0f; lz = 0.0f;
  } else {
    tx = mouseX * 0.55f;
    ty = 0.35f + mouseY * 0.3f;
    tz = 8.8f - scroll * 3.8f;
    lx = 0.0f;
    ly = -0.05f + scroll * 0.4f;
    lz = 0.0f;
  }

  pos[0] = tx; pos[1] = ty; pos[2] = tz;
  look[0] = lx; look[1] = ly; look[2] = lz;
}

}
