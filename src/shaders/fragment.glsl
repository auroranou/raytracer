precision mediump float;

uniform vec2 uResolution;

struct Light {
  // Ambient and diffuse are vec3 because they need to hold values for RGB
  vec3 ambient;
  vec3 diffuse;
  vec3 position;
  vec3 specular;
};

struct Ray {
  vec3 direction;
  vec3 origin;
};

struct Sphere {
  vec3 center;
  vec3 materialAmbient;
  vec3 materialDiffuse;
  vec3 materialSpecular;
  float radius;
};

float raySphereIntersection(Ray ray, Sphere sphere) {
  vec3 eyeToCtr = ray.origin - sphere.center;
  float discriminant = pow( dot(eyeToCtr, ray.direction), 2.0) - ( dot(eyeToCtr, eyeToCtr) - pow(sphere.radius, 2.0));

  if (discriminant < 0.0) {
    return 10000.0;
  }

  float t0 = -dot(eyeToCtr, ray.direction) - sqrt(discriminant);
  float t1 = -dot(eyeToCtr, ray.direction) + sqrt(discriminant);

  if (t0 > 0.0 && t1 > 0.0){
    if (t0 == t1) return t0;
  }

  return min(t0, t1);
}

vec3 lightAtPoint(vec3 point, Ray ray, Sphere sphere, Light light) {
  // Phong Model:
  // I = LambRamb + LdiffRdiff(L.N) + LspecRspec(E.R)e
    // where I is intensity (returned value),
    // L is incoming light intensity (determined by Light struct),
    // R is reflection constant (determined by object surface)
    // amb = ambient, diff = diffuse, spec = specular

  vec3 normal = point - sphere.center;
  vec3 N = normalize(normal);

  vec3 lightDir = point - light.position;
  vec3 L = normalize(lightDir);

  float lambert = dot(N, -L);

  vec3 Ia = light.ambient * sphere.materialAmbient;
  vec3 Id = vec3(0.0);
  vec3 Is = vec3(0.0);

  // if (lambert > 0.0) {
    Id = light.diffuse * sphere.materialDiffuse * lambert;

    // E = direction to the eye = opposite of ray direction
    vec3 E = -ray.direction;

    // Calculate the reflection using in-built function, replacing
    // 2 * dot(N, L)N - L
    vec3 R = reflect(L, N);

    float specular = pow( max(dot(R,E), 0.0), 80.0 );
    Is = light.specular * sphere.materialSpecular * specular;
  // }

  vec3 intensity = Ia + Id + Is;
  return intensity;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / (uResolution - 0.5)) * 2.0 - 1.0;
  vec4 color = vec4(vec3(0.0), 1.0);

  Light light;
  light.ambient = vec3(0.05);
  light.diffuse = vec3(0.5, 0.8, 0.1);
  light.position = vec3(1.0);
  light.specular = vec3(1.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 1.0);
  ray.direction = normalize(vec3(uv, -ray.origin.z));
  
  Sphere sphere;
  sphere.center = vec3(0.0);
  sphere.materialAmbient = vec3(0.8, 0.8, 1.0);
  sphere.materialDiffuse = vec3(1.0);
  // Shiny spot will be white
  sphere.materialSpecular = vec3(1.0);
  sphere.radius = 0.5;

  float intersect = raySphereIntersection(ray, sphere);
  vec3 hitPoint = ray.origin + intersect * ray.direction;
  if (intersect < 10000.0) {
    vec3 rgb = lightAtPoint(hitPoint, ray, sphere, light);
    color = vec4(rgb, 1.0);
  }

  gl_FragColor = color;
}