import { datasource, useReadData, useReset } from "@naporin0624/react-flowder";
import { combineLatest, concat, map, Observable, of } from "rxjs";

const createImageSource = (src: string): Observable<HTMLImageElement> => {
  const img = new Image();
  img.src = src;

  return new Observable<HTMLImageElement>((subscriber) => {
    img.onload = () => {
      subscriber.next(img);
      subscriber.complete();
    };
    img.onerror = (err) => {
      subscriber.error(err);
    };
    if (img.complete) {
      subscriber.next(img);
      subscriber.complete();
    }
  });
};

const createStepImageSource = (images: string[]) => {
  return combineLatest([createImageSource(images[0]), ...images.slice(1).map((src) => concat(of(null), createImageSource(src)))]).pipe(
    map((x) => x.filter((img): img is Exclude<typeof img, null> => img !== null)),
    map((x) => x.slice(-1)[0])
  );
};
const source = datasource(createStepImageSource);

export function useImage(...images: [string, ...string[]]): [data: HTMLImageElement, reset: () => void] {
  const data = useReadData(source(images));
  const reset = useReset(source(images));
  return [data, reset];
}
