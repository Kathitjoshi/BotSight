import {useAtom} from 'jotai';
import {
  BoundingBoxes2DAtom,
  BumpSessionAtom,
  ImageSentAtom,
  PointsAtom,
  RequestJsonAtom,
  ResponseJsonAtom,
} from './atoms';

export function useResetState() {
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setRequestJson] = useAtom(RequestJsonAtom);
  const [, setResponseJson] = useAtom(ResponseJsonAtom);

  return () => {
    setImageSent(false);
    setBoundingBoxes2D([]);
    setBumpSession((prev) => prev + 1);
    setPoints([]);
    setRequestJson('');
    setResponseJson('');
  };
}
