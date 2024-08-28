//External Meshes have flipped Y coordinates on canvas from blender import

const pointIndexData: [number, { x: number; y: number; externalY: number }][] =
  [
    [10.5, { x: 0, y: 7, externalY: 0 }],
    [7.5, { x: 1, y: 6, externalY: 1 }],
    [4.5, { x: 2, y: 5, externalY: 2 }],
    [1.5, { x: 3, y: 4, externalY: 3 }],
    [-1.5, { x: 4, y: 3, externalY: 4 }],
    [-4.5, { x: 5, y: 2, externalY: 5 }],
    [-7.5, { x: 6, y: 1, externalY: 6 }],
    [-10.5, { x: 7, y: 0, externalY: 7 }],
  ];

const pointIndexMap = new Map<
  number,
  { x: number; y: number; externalY: number }
>();
pointIndexData.forEach(([key, value]) => {
  pointIndexMap.set(key, value);
});

const pointPositionData: [
  number,
  { x: number; y: number; externalY: number }
][] = [
  [0, { x: 10.5, y: -10.5, externalY: 10.5 }],
  [1, { x: 7.5, y: -7.5, externalY: 7.5 }],
  [2, { x: 4.5, y: -4.5, externalY: 4.5 }],
  [3, { x: 1.5, y: -1.5, externalY: 1.5 }],
  [4, { x: -1.5, y: 1.5, externalY: -1.5 }],
  [5, { x: -4.5, y: 4.5, externalY: -4.5 }],
  [6, { x: -7.5, y: 7.5, externalY: -7.5 }],
  [7, { x: -10.5, y: 10.5, externalY: -10.5 }],
];

const pointPositionMap = new Map<
  number,
  { x: number; y: number; externalY: number }
>();
pointPositionData.forEach(([key, value]) => {
  pointPositionMap.set(key, value);
});

export { pointIndexMap, pointPositionMap };
