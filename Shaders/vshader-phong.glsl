#version 300 es

in vec4 vPosition;
in vec4 vNormal;
in vec4 vDiffuseColor; //material color
in vec4 vAmbientColor; //material color
in vec4 vSpecularColor;
in float vSpecularExponent;

out vec3 L;
out vec3 N;
out vec3 H;

out vec4 fNormal;
out vec4 fAmbientColor;
out vec4 fDiffuseColor;
out vec4 fSpecularColor;
out float fSpecularExponent;

uniform mat4 model_view;
uniform mat4 projection;
uniform vec4 light_position;

void main(){
    vec4 veyepos = model_view * vPosition; //move object to eye space
    L = normalize(light_position.xyz - veyepos.xyz);
    vec3 V = normalize(-veyepos.xyz); //Where is our camera from vertex location
    H = normalize(L + V); //Average of L and V

    N = normalize((model_view * vNormal).xyz);

    gl_Position = projection * veyepos;

    fNormal = vNormal;
    fAmbientColor = vAmbientColor;
    fDiffuseColor = vDiffuseColor;
    fSpecularColor = vSpecularColor;
    fSpecularExponent = vSpecularExponent;
}