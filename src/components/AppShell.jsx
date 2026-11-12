import React, { useEffect } from "react";
import Navbar, { Navbar_HTML } from "./Navbar.jsx";
import SvgFilters, { SvgFilters_HTML } from "./SvgFilters.jsx";
import HeroThreeTornado, { HeroThreeTornado_HTML } from "./HeroThreeTornado.jsx";
import InteractivePreview, { InteractivePreview_HTML } from "./InteractivePreview.jsx";
import PeaceOfMindSection, { PeaceOfMindSection_HTML } from "./PeaceOfMindSection.jsx";
import ToolsCatalog, { ToolsCatalog_HTML } from "./ToolsCatalog.jsx";
import ComparisonSection, { ComparisonSection_HTML } from "./ComparisonSection.jsx";
import StudioWorkspace, { StudioWorkspace_HTML } from "./StudioWorkspace.jsx";
import PhoneScanner, { PhoneScanner_HTML } from "./PhoneScanner.jsx";
import AboutSection, { AboutSection_HTML } from "./AboutSection.jsx";
import Footer, { Footer_HTML } from "./Footer.jsx";
import { bootNoUploadPdfClientEngine } from "../engine/clientEngine.js";

export function renderStaticBodyHtml() {
  return [
    "<!-- Ink-Bleed Theme Changer WebGL2 Canvas Overlay -->",
    Navbar_HTML,
    SvgFilters_HTML,
    "<!-- VIEW 1: LAPTOP SCREEN FIRST -> TORNADO FORMS -> LAPTOP ZOOMS OUT BEHIND TEXT -> INK-BLEED TEXT REVEAL -->",
    '<main id="view-home" style="flex:1;">',
    HeroThreeTornado_HTML,
    InteractivePreview_HTML,
    PeaceOfMindSection_HTML,
    ToolsCatalog_HTML,
    ComparisonSection_HTML,
    "</main>",
    StudioWorkspace_HTML,
    PhoneScanner_HTML,
    AboutSection_HTML,
    Footer_HTML
  ].join("\n\n");
}

export default function AppShell({ initialView = "home", initialTool = null }) {
  useEffect(() => {
    bootNoUploadPdfClientEngine();
    if (typeof window !== "undefined") {
      if (initialTool && typeof window.openToolWorkspace === "function") {
        window.openToolWorkspace(initialTool, false);
      } else if (initialView && initialView !== "home" && typeof window.showView === "function") {
        window.showView(initialView, false);
      }
    }
  }, [initialView, initialTool]);

  return (
    <div className="nouploadpdf-react-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <SvgFilters />
      <main id="view-home" style={{ flex: 1 }}>
        <HeroThreeTornado />
        <InteractivePreview />
        <PeaceOfMindSection />
        <ToolsCatalog />
        <ComparisonSection />
      </main>
      <StudioWorkspace />
      <PhoneScanner />
      <AboutSection />
      <Footer />
    </div>
  );
}
