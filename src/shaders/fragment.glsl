precision mediump float;

uniform vec2 uResolution;

struct Ray {
  vec3 direction;
  vec3 origin;
};

struct Sphere {
  vec3 center;
  vec4 color;
  float radius;
};

bool raySphereIntersection(Ray ray, Sphere sphere, out float intersect) {
  vec3 eyeToCtr = ray.origin - sphere.center;
  float discriminant = pow( dot(eyeToCtr, ray.direction), 2.0) - ( dot(eyeToCtr, eyeToCtr) - pow(sphere.radius, 2.0));

  if (discriminant < 0.0) {
    return false;
  }

  float t0 = -dot(eyeToCtr, ray.direction) - sqrt(discriminant);
  float t1 = -dot(eyeToCtr, ray.direction) + sqrt(discriminant);

  if (t0 > 0.0 && t1 > 0.0){
    if (t0 == t1) intersect = t0;
    return true;
  }

  if (t0 < t1) {
    intersect = t0;
  } else {
    intersect = t1;
  }

  return true;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / (uResolution - 0.5)) * 2.0 - 1.0;
  vec4 color = vec4(vec3(0.0), 1.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 1.0);
  ray.direction = normalize(vec3(uv, -ray.origin.z));
  
  Sphere sphere;
  sphere.center = vec3(0.0);
  sphere.color = vec4(0.0, 1.0, 0.0, 1.0);
  sphere.radius = 0.5;

  float intersect;
  if (raySphereIntersection(ray, sphere, intersect)) {
    color = sphere.color;
  }

  gl_FragColor = color;
}