declare module 'dxf-writer' {
  export class Drawing {
    constructor();
    addLayer(name: string, colorNumber: number, lineType: string): void;
    setCurrentLayer(name: string): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, z1?: number, z2?: number): void;
    drawText(x: number, y: number, height: number, rotation: number, value: string, options?: any): void;
    toDxfString(): string;
  }

  export class Line {
    constructor(x1: number, y1: number, x2: number, y2: number, z1?: number, z2?: number);
  }

  export class Text {
    constructor(x: number, y: number, height: number, rotation: number, value: string, options?: any);
  }

  export class Layer {
    constructor(name: string, colorNumber: number, lineType: string);
  }
}
