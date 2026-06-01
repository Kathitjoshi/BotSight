export type DetectTypes = '2D bounding boxes' | 'Points';

export type BoundingBox2DType = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type PointingType = {
  point: {
    x: number;
    y: number;
  };
  label: string;
};
