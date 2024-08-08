import { FELT_CENTER } from "@/ui/config";

export class Position {
  private x: number;
  private y: number;
  private normalized: boolean;

  constructor({ x, y }: { x: number; y: number }) {
    this.x = x;
    this.y = y;
    this.normalized = x < FELT_CENTER && y < FELT_CENTER;
  }

  public getContract() {
    return {
      x: this.normalized ? this.x + FELT_CENTER : this.x,
      y: this.normalized ? this.y + FELT_CENTER : this.y,
    };
  }

  public getNormalized() {
    return {
      x: this.normalized ? this.x : this.x - FELT_CENTER,
      y: this.normalized ? this.y : this.y - FELT_CENTER,
    };
  }

  public toLocationUrl() {
    const normalized = this.getNormalized();
    return `/map?col=${normalized.x}&row=${normalized.y}`;
  }
}
