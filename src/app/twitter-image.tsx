import { ImageResponse } from "next/og";
import { SHARE_ALT, SHARE_SIZE, ShareImage } from "./share-image";

export const alt = SHARE_ALT;
export const size = SHARE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<ShareImage />, { ...size });
}
