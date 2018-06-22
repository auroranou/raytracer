import { Vector } from "./Vector";
import { IdMap } from "./helpers";

export type UniformControl = {
  defaultValue: Vector;
  label: string;
  location?: WebGLUniformLocation;
  uniformName: string;
  value?: Vector;
};

export const uniforms = {
  uLightAmb: {
    defaultValue: new Vector(12.75, 12.75, 12.75),
    label: 'Light: Ambient',
    uniformName: 'uLightAmb'
  },
  uLightDiff: {
    defaultValue: new Vector(127.5, 204, 25.1),
    label: 'Light: Diffuse',
    uniformName: 'uLightDiff'
  },
  uSphereAmb: {
    defaultValue: new Vector(204, 204, 255),
    label: 'Sphere: Ambient',
    uniformName: 'uSphereAmb'
  },
  uSphereDiff: {
    defaultValue: new Vector(255, 255, 255),
    label: 'Sphere: Diffuse',
    uniformName: 'uSphereDiff'
  }
} as IdMap<UniformControl>;

export class Controls {
  private gl: WebGLRenderingContext;
  public uniformControls: IdMap<UniformControl>

  constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
    this.gl = gl;

    this.uniformControls = Object.keys(uniforms).reduce((memo, curr) => {
      const uniform = uniforms[curr];
      memo[uniform.uniformName] = {
        ...uniform,
        location: this.gl.getUniformLocation(program, uniform.uniformName) as WebGLUniformLocation,
        value: uniform.defaultValue
      };
      return memo;
    }, {} as IdMap<UniformControl>);

    this.render();
  }

  public render(): void {
    const controlsContainer = document.getElementById('controls');
    if (!controlsContainer) return;

    Object.keys(this.uniformControls).forEach((key: string) => {
      const uniform = uniforms[key];

      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.innerText = uniform.label;
      fieldset.appendChild(legend);

      const { x, y, z } = uniform.value || uniform.defaultValue;
      fieldset.appendChild(this.createRangeInput(`${uniform.uniformName}-x`, x, 'Red'));
      fieldset.appendChild(this.createRangeInput(`${uniform.uniformName}-y`, y, 'Green'));
      fieldset.appendChild(this.createRangeInput(`${uniform.uniformName}-z`, z, 'Blue'));

      controlsContainer.appendChild(fieldset);
    });
  }

  private createRangeInput(id: string, initialValue: number, labelText: string): HTMLElement {
    const label = document.createElement('label') as HTMLLabelElement;
    label.htmlFor = id;
    const labelSpan = document.createElement('span');
    labelSpan.innerText = labelText;
    label.appendChild(labelSpan);

    const input = document.createElement('input');
    input.id = id;
    input.max = '255';
    input.min = '0';
    input.name = id;
    input.type = 'range';
    input.value = initialValue.toString();

    input.addEventListener('change', this.onSliderChange.bind(this));

    label.appendChild(input);

    const valueDesc = document.createElement('span');
    valueDesc.innerText = `(${input.value})`;
    label.appendChild(valueDesc);
    return label;
  }

  private onSliderChange(e: Event) {
    const { id, value } = e.target as HTMLInputElement;
    const [name, channel] = id.split('-');
    const uniform = this.uniformControls[name];
    if (!uniform || !uniform.location) return;

    let updatedValue = uniform.value || uniform.defaultValue;
    updatedValue = {
      ...updatedValue,
      [channel]: value
    } as Vector;

    const updatedUniform = {
      ...uniform,
      value: updatedValue
    } as UniformControl;

    this.uniformControls = {
      ...this.uniformControls,
      [uniform.uniformName]: updatedUniform
    };

    // Update uniform for fragment shader + redraw
    this.gl.uniform3f(uniform.location, +updatedValue.x / 255, +updatedValue.y / 255, +updatedValue.z / 255);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    // Update the description span
    const span = document.querySelector(`#${id} + span`) as HTMLElement;
    if (span) span.innerText = `(${value})`;
  }
}