shader_type canvas_item;
// Changes only the tile's painted RGB. Alpha, tile geometry, and light masks are untouched.
uniform int finish = 0;
varying vec2 surface_pixel;

void vertex() {
 surface_pixel = VERTEX;
}

void fragment() {
 vec2 p = floor(surface_pixel);
 float mark = 0.0;
 if (finish == 1) {
  float hash = fract(dot(mod(p, 32.0), vec2(0.754877, 0.569840)) + p.x * p.y * 0.03125);
  mark = (hash - 0.5) * 0.24;
 } else if (finish == 2) {
  float groove = step(6.0, mod(p.x + p.y * 2.0, 8.0));
  float fleck = step(7.0, mod(p.x * 3.0 - p.y, 9.0));
  mark = 0.08 + fleck * 0.08 - groove * 0.19;
 }
 COLOR.rgb *= 1.0 + mark;
}
