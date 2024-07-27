declare module 'troika-three-text' {
    import { Mesh } from 'three';
    export class Text extends Mesh {
      text: string;
      fontSize: number;
      anchorX: string;
      anchorY: string;
      color: string | number;
      sync: () => void;
    }
  }