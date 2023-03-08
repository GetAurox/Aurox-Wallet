import { CSSProperties } from "react";

import { Box } from "@mui/material";

interface ImageProps {
  height: number;
  width: number;
  alt: string;
  src: string;
  layout?: "intrinsic";
}

export function Image({ layout, ...props }: ImageProps) {
  if (layout === "intrinsic") {
    return <IntrinsicImage src={props.src} alt={props.alt} />;
  }

  return <Box component="img" {...props} />;
}

interface IntrinsicImageProps {
  src: string;
  alt: string;
}

/**
 * Inspired from next/image
 * @param src
 * @param alt
 * @constructor
 */
const IntrinsicImage = ({ src, alt }: IntrinsicImageProps) => {
  const sxStyles = {
    wrapper: {
      boxSizing: "border-box",
      display: "inline-block",
      overflow: "hidden",
      width: "initial",
      height: "initial",
      background: "none",
      opacity: 1,
      border: 0,
      margin: 0,
      padding: 0,
      position: "relative",
      maxSidth: "100%",
    },
    dummyWrapper: {
      boxSizing: "border-box",
      display: "block",
      width: "initial",
      height: "initial",
      background: "none",
      opacity: 1,
      border: 0,
      margin: 0,
      padding: 0,
      maxWidth: "100%",
    },
    dummyImage: {
      display: "block",
      maxWidth: "100%",
      width: "initial",
      height: "initial",
      background: "none",
      opacity: 1,
      border: 0,
      margin: 0,
      padding: 0,
    },
    image: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      boxSizing: "border-box",
      padding: 0,
      border: "none",
      margin: "auto",
      display: "block",
      width: 0,
      height: 0,
      minWidth: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      maxHeight: "100%",
    },
  };

  return (
    <span style={sxStyles.wrapper as CSSProperties}>
      <span style={sxStyles.dummyWrapper as CSSProperties}>
        <img
          style={sxStyles.dummyImage}
          alt=""
          aria-hidden="true"
          src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27235%27%20height=%27245%27/%3e"
        />
      </span>
      <img
        alt={alt}
        src={src}
        decoding="async"
        data-nimg="intrinsic"
        style={sxStyles.image as CSSProperties}
        srcSet={`${src} 1x, ${src} 2x`}
      />
    </span>
  );
};
