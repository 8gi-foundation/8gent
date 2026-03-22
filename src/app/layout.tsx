import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { DesignThemeWrapper } from "@/components/design-theme-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipLink } from "@/components/ui/skip-link";
import { MusicProvider } from "@/context/MusicContext";
import { OverlayProvider } from "@/context/OverlayContext";
import { SessionBrainProvider } from "@/context/SessionBrainContext";
import { DesignThemeProvider } from "@/context/DesignThemeContext";
import { HomeScreenProvider } from "@/context/HomeScreenContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { AppContextProvider } from "@/context/AppContext";
import { ControlCenterProvider } from "@/context/ControlCenterContext";
import { CanvasProvider } from "@/context/CanvasContext";
import { MotionProvider } from "@/components/motion";
import { CommandPaletteProvider, CommandPalette } from "@/components/command-palette";
import { ClawAIProactiveProvider } from "@/components/providers/ClawAIProactiveProvider";
import { HomePageStructuredData } from "@/components/seo/JsonLd";
import { AriaLiveProvider } from "@/components/accessibility/AriaLiveRegion";
import { KonamiEasterEgg, DeveloperModeEasterEgg } from "@/components/os";
import { StatusBar } from "@/components/ios/StatusBar";
import { ControlCenter } from "@/components/ios/ControlCenter";
import { MainContent } from "@/components/layout/MainContent";
import { OpenClawProvider } from "@/components/providers/OpenClawProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const seoKeywords = [
  "8gent",
  "AI Operating System",
  "AI-native OS",
  "Agentic AI Orchestration",
  "Multi-Agent Systems",
  "Product-Led Development",
  "Rapid Prototyping",
  "Next.js Operating System",
  "React OS",
  "Design-Led Engineering",
  "Digital Workspace",
  "AI Assistant",
  "Workspace Automation",
];

export const metadata: Metadata = {
  metadataBase: DATA.url ? new URL(DATA.url) : null,
  title: {
    default: `8gent - The AI-Native Operating System`,
    template: `%s | 8gent`,
  },
  description: `The AI-native operating system designed for high-performance productivity and seamless human-AI collaboration.`,
  keywords: seoKeywords,
  authors: [
    { name: "OpenClaw Team", url: DATA.url },
  ],
  creator: "8gent",
  publisher: "OpenClaw",
  category: "Technology",
  classification: "Operating System",

  alternates: {
    canonical: DATA.url,
    languages: {
      "en": DATA.url,
      "x-default": DATA.url,
    },
  },

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    title: `${DATA.name} - The AI-Native Operating System`,
    description: `${DATA.description} Explore the future of digital interaction.`,
    url: DATA.url,
    siteName: "8gent",
    locale: "en_IE",
    type: "website",
    images: [
      {
        url: "/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - AI-Native Operating System",
        type: "image/png",
      },
    ],
  },

  twitter: {
    title: `${DATA.name} - The AI-Native Operating System`,
    description: DATA.description,
    card: "summary_large_image",
    images: [
      {
        url: "/8gent-logo.png",
        alt: "8gent Logo",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased")}>
        <HomePageStructuredData />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <DesignThemeProvider>
            <DesignThemeWrapper>
              <MusicProvider>
                <SessionBrainProvider>
                  <ClawAIProactiveProvider>
                    <OverlayProvider>
                      <HomeScreenProvider>
                        <ProjectProvider>
                          <AppContextProvider>
                            <CanvasProvider>
                              <ControlCenterProvider>
                                <CommandPaletteProvider>
                                  <MotionProvider>
                                    <TooltipProvider delayDuration={0}>
                                      <AriaLiveProvider>
                                        <AuthProvider>
                                          <KonamiEasterEgg>
                                            <SkipLink />
                                            <StatusBar />
                                            <ControlCenter />
                                            <MainContent>
                                              <OpenClawProvider>
                                                {children}
                                              </OpenClawProvider>
                                            </MainContent>
                                            <Navbar />
                                            <CommandPalette />
                                            <DeveloperModeEasterEgg />
                                          </KonamiEasterEgg>
                                        </AuthProvider>
                                      </AriaLiveProvider>
                                    </TooltipProvider>
                                  </MotionProvider>
                                </CommandPaletteProvider>
                              </ControlCenterProvider>
                            </CanvasProvider>
                          </AppContextProvider>
                        </ProjectProvider>
                      </HomeScreenProvider>
                    </OverlayProvider>
                  </ClawAIProactiveProvider>
                </SessionBrainProvider>
              </MusicProvider>
            </DesignThemeWrapper>
          </DesignThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
