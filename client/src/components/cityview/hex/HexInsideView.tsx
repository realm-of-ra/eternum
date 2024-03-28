import useUIStore from "../../../hooks/store/useUIStore";
import * as THREE from "three";
import { createHexagonShape } from "../../worldmap/hexagon/HexagonGeometry";
import { HEX_RADIUS } from "../../worldmap/hexagon/WorldHexagon";
import { getUIPositionFromColRow } from "../../../utils/utils";
import { get } from "lodash";
import { Html } from "@react-three/drei";

const HexInsideView = ({ center }: { center: { col: number; row: number } }) => {
  const hexagonGeometry = new THREE.ShapeGeometry(createHexagonShape(HEX_RADIUS));

  const color = new THREE.Color();

  const generateHexPositions = (center: { col: number; row: number }) => {
    const radius = 4;
    const positions = [] as any[];
    const normalizedCenter = { col: 4, row: 4 };
    const shifted = { col: center.col - normalizedCenter.col, row: center.row - normalizedCenter.row };
    for (let _row = normalizedCenter.row - radius; _row <= normalizedCenter.row + radius; _row++) {
      const basicCount = 9;
      const decrease = Math.abs(_row - radius);
      const colsCount = basicCount - decrease;
      const startOffset = _row % 2 === 0 ? (decrease > 0 ? Math.floor(decrease / 2) : 0) : Math.floor(decrease / 2);
      for (
        let _col = startOffset + normalizedCenter.col - radius;
        _col < normalizedCenter.col - radius + colsCount + startOffset;
        _col++
      ) {
        positions.push({
          ...getUIPositionFromColRow(_col + shifted.col, _row + shifted.row, true),
          z: 0.32,
          color: [0.33, 0.33, 0.33],
          col: _col + shifted.col,
          row: _row + shifted.row,
          startOffset: startOffset,
        });
      }
    }

    return positions;
  };

  const hexPositions = generateHexPositions(center);

  return (
    <group rotation={[Math.PI / -2, 0, 0]}>
      {hexPositions.map((hexPosition, index) => {
        return (
          <group key={index} position={[hexPosition.x, hexPosition.y, hexPosition.z]}>
            <mesh geometry={hexagonGeometry}>
              <meshMatcapMaterial color={hexPosition.color} />
            </mesh>
            <Html distanceFactor={50}>
              <div className="flex -translate-y-1/2 -translate-x-1/2">
                {hexPosition.col},{hexPosition.row}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

export default HexInsideView;
