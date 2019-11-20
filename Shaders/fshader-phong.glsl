#version 300 es
precision mediump float;

in vec4 veyepos;
in vec3 vN;
in vec4 fAmbientColor;
in vec4 fDiffuseColor;
in vec4 fSpecularColor;
in float fSpecularExponent;

out vec4  fColor;

uniform vec4[5] light_color;
uniform vec4 ambient_light;//intensity
uniform vec4[5] light_position;
uniform vec4[5] light_direction;
uniform float[5] angle;

void main()
{

    //Ambient term
    vec4 amb = fAmbientColor * ambient_light;

    //Diffuse Term
    vec4 diff = vec4(0,0,0,1);

    //Specular Color
    vec4 spec = vec4(0,0,0,1);

    vec3 N = normalize(vN);
    vec3 V = normalize(-veyepos.xyz);


    for(int i = 0; i < 5; i++){

        vec3 L = normalize(light_position[i].xyz - veyepos.xyz);
        vec3 H = normalize(L + V);
        float cos = dot(L, normalize(light_direction[i].xyz));

        if(cos < -angle[i]){
            diff = diff + max(0.0, dot(L, N)) * fDiffuseColor * light_color[i];
            if (dot(L, N) < 0.0){
                spec = spec + vec4(0, 0, 0, 1);//no light on the back side, Blim-Phong Issue
            } else {
                spec = spec + pow(max(0.0, dot(N, H)), fSpecularExponent) * fSpecularColor * light_color[i];
            }
        }
    }
    fColor = vec4(N, 1);
    //fColor = amb + spec + diff;
}