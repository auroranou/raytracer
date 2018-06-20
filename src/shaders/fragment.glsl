precision mediump float;

varying vec2 vPosition;

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
  vec3 eo = sphere.center - ray.origin;
  float v = dot(eo, ray.direction);
  float c2 = dot(eo, eo);
  float disc = pow(sphere.radius, 2.0) - c2 - pow(v, 2.0);

  if (disc < 0.0) {
    return false;
  }

  float d = sqrt(disc);
  // p1 = v - d;
  // p2 = v + d;
  intersect = v - d;

  return true;
}

void main() {
  vec4 color = vec4(vec3(0.0), 1.0);

  Ray ray;
  ray.direction = normalize(vec3(vPosition, 2.0));
  ray.origin = vec3(0.0, 0.0, -0.5);
  
  Sphere sphere;
  sphere.center = vec3(0.0, 0.0, 0.0);
  sphere.color = vec4(0.0, 1.0, 0.0, 1.0);
  sphere.radius = 0.2;

  float intersect;
  if (raySphereIntersection(ray, sphere, intersect)) {
    color = sphere.color;
  }
}