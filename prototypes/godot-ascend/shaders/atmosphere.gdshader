shader_type canvas_item;
render_mode unshaded;
uniform sampler2D scene : hint_screen_texture, repeat_disable, filter_nearest;
uniform float strength = 1.0;
uniform vec3 mood_tint = vec3(1.0);
uniform float pulse = 0.0;
void fragment(){
 vec4 source = texture(scene, SCREEN_UV);
 vec2 p = SCREEN_UV - vec2(0.5);
 float vignette = smoothstep(0.18,0.68,length(p*vec2(0.85,1.0)));
 vec3 color = source.rgb * (1.0-vignette*(0.20+pulse)*strength);
 // Restrained filmic contrast; keep silhouettes and the pale hazards readable.
 color = mix(color,color*vec3(0.96,1.005,1.035),0.35*strength);
 color *= mix(vec3(1.0),mood_tint,0.08*strength);
 float grain = fract(sin(dot(floor(SCREEN_UV*vec2(640.0,368.0)),vec2(12.9898,78.233)))*43758.5453)-0.5;
 COLOR = vec4(clamp(color+grain*0.007*strength,0.0,1.0),1.0);
}
