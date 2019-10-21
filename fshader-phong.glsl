#version 300 es
precision mediump float;

in vec3 L;
in vec3 N;
in vec3 H;

in vec4 fNormal; //material color
in vec4 fAmbientDiffuseColor;
in vec4 fSpecularColor;
in float fSpecularExponent;

out vec4  fColor;


uniform vec4 light_color;
uniform vec4 ambient_light;

void main()
{


    vec3 nL = normalize(L);
    vec3 nN = normalize(N);
    vec3 nH = normalize(H);

    //Ambient term
    vec4 amb = fAmbientDiffuseColor * ambient_light;

    //Diffuse Term
    vec4 diff = max(0.0, dot(nL, nN)) * fAmbientDiffuseColor * light_color;

    //Specular Color
    vec4 spec = pow(max(0.0, dot(nN, nH)), fSpecularExponent) * fSpecularColor * light_color;

    if(dot(nL, nN) < 0.0){
        spec = vec4(0,0,0,1); //no light on the back side, Blim-Phong Issue
    }
    fColor = amb + diff + spec; //pass forward to fragment shader
}