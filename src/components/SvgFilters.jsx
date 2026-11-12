import React from "react";

export const SvgFilters_HTML = "<!-- SVG Ink-Bleed Filter for Headline + Dedicated Liquid Ripple Filter for \"leave\" Word -->\n  <svg width=\"0\" height=\"0\" style=\"position:absolute; pointer-events:none;\" aria-hidden=\"true\">\n    <defs>\n      <filter id=\"inkBleedTitleFilter\" x=\"-15%\" y=\"-25%\" width=\"130%\" height=\"150%\">\n        <feTurbulence id=\"inkBleedTurbulence\" type=\"fractalNoise\" baseFrequency=\"0.035 0.06\" numOctaves=\"3\" seed=\"11\" result=\"noise\" />\n        <feDisplacementMap id=\"inkBleedDispMap\" in=\"SourceGraphic\" in2=\"noise\" scale=\"0\" xChannelSelector=\"R\" yChannelSelector=\"G\" />\n      </filter>\n      <filter id=\"leaveWordRippleFilter\" x=\"-25%\" y=\"-35%\" width=\"150%\" height=\"170%\">\n        <feTurbulence id=\"leaveRippleTurbulence\" type=\"turbulence\" baseFrequency=\"0.022 0.048\" numOctaves=\"2\" seed=\"7\" result=\"rippleNoise\" />\n        <feDisplacementMap id=\"leaveRippleDispMap\" in=\"SourceGraphic\" in2=\"rippleNoise\" scale=\"0\" xChannelSelector=\"R\" yChannelSelector=\"G\" />\n      </filter>\n    </defs>\n  </svg>";

export default function SvgFilters() {
  return (
    <div
      className="react-section-svgfilters"
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: SvgFilters_HTML }}
    />
  );
}
