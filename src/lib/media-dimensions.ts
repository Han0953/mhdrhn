import type {MediaAsset} from "./media";
export function getMediaDimensions(media: MediaAsset) {
  return media.rotation === 90 ? { width: media.height, height: media.width } : { width: media.width, height: media.height };
}
