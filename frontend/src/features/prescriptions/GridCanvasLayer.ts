import { COLORS } from "../../styles/colors";
import L from "leaflet";
import type { GridCell } from "./types";
import { getColorForPayback } from "./helpers";

export class GridCanvasLayer extends L.Layer {
  private _canvas: HTMLCanvasElement | null = null;
  private _cells: GridCell[] = [];
  private _mapInstance: L.Map | null = null;
  private _onHover: ((cell: GridCell | null, e: MouseEvent) => void) | null =
    null;
  private _hoveredCell: GridCell | null = null;

  constructor(
    cells: GridCell[],
    onHover?: (cell: GridCell | null, e: MouseEvent) => void,
  ) {
    super();
    this._cells = cells;
    this._onHover = onHover || null;
  }

  onAdd(map: L.Map): this {
    this._mapInstance = map;
    this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-grid-canvas",
    ) as HTMLCanvasElement;
    this._canvas.style.position = "absolute";
    this._canvas.style.pointerEvents = "auto";

    const pane = map.getPane("overlayPane");
    if (pane) pane.appendChild(this._canvas);

    map.on("move moveend zoomend resize", this._reset, this);
    this._canvas.addEventListener("mousemove", this._onMouseMove.bind(this));
    this._canvas.addEventListener("mouseout", this._onMouseOut.bind(this));

    this._reset();
    return this;
  }

  onRemove(map: L.Map): this {
    if (this._canvas?.parentNode)
      this._canvas.parentNode.removeChild(this._canvas);
    map.off("move moveend zoomend resize", this._reset, this);
    this._canvas = null;
    this._mapInstance = null;
    return this;
  }

  setCells(cells: GridCell[]): void {
    this._cells = cells;
    this._reset();
  }

  private _reset(): void {
    if (!this._mapInstance || !this._canvas) return;

    const size = this._mapInstance.getSize();
    const bounds = this._mapInstance.getBounds();
    const topLeft = this._mapInstance.latLngToLayerPoint(bounds.getNorthWest());

    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._canvas.style.width = `${size.x}px`;
    this._canvas.style.height = `${size.y}px`;
    L.DomUtil.setPosition(this._canvas, topLeft);

    this._draw();
  }

  private _draw(): void {
    if (!this._mapInstance || !this._canvas) return;
    const ctx = this._canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    if (this._cells.length === 0) return;

    const viewBounds = this._mapInstance.getBounds();

    for (const cell of this._cells) {
      if (!viewBounds.intersects(cell.bounds)) continue;

      const sw = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getSouthWest(),
      );
      const ne = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getNorthEast(),
      );

      const x = sw.x;
      const y = ne.y;
      const w = ne.x - sw.x;
      const h = sw.y - ne.y;

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = getColorForPayback(cell.paybackPeriod);
      ctx.fillRect(x, y, w, h);

      if (w > 3 && h > 3) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = COLORS.strokeDark;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, w, h);
      }
    }

    if (this._hoveredCell) {
      const sw = this._mapInstance.latLngToContainerPoint(
        this._hoveredCell.bounds.getSouthWest(),
      );
      const ne = this._mapInstance.latLngToContainerPoint(
        this._hoveredCell.bounds.getNorthEast(),
      );
      ctx.globalAlpha = 1;
      ctx.strokeStyle = COLORS.whiteFull;
      ctx.lineWidth = 2;
      ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
    }

    ctx.globalAlpha = 1;
  }

  private _onMouseMove(e: MouseEvent): void {
    if (!this._mapInstance || !this._canvas) return;

    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundCell: GridCell | null = null;

    for (const cell of this._cells) {
      const sw = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getSouthWest(),
      );
      const ne = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getNorthEast(),
      );

      if (x >= sw.x && x <= ne.x && y >= ne.y && y <= sw.y) {
        foundCell = cell;
        break;
      }
    }

    if (foundCell !== this._hoveredCell) {
      this._hoveredCell = foundCell;
      this._draw();
      if (this._onHover) this._onHover(foundCell, e);
    }
  }

  private _onMouseOut(): void {
    if (this._hoveredCell) {
      this._hoveredCell = null;
      this._draw();
      if (this._onHover) this._onHover(null, new MouseEvent("mouseout"));
    }
  }
}
