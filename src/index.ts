import { Raytracer } from './raytracer/Raytracer';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.log('No canvas found');
    return;
  }

  const gl = new Raytracer(canvas);
  console.log(gl);
});