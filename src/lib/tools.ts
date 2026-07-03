import {
  Calculator,
  FileImage,
  ImageIcon,
  FileArchive,
  Music,
  Code2,
  QrCode,
  KeyRound,
  Download
} from "lucide-react";

export type ToolCategory = "Marketing" | "Image" | "Video" | "Developer" | "Security" | "Generator";

export const tools = [
  {
    title: "CPR Calculator",
    href: "/tools/cpr-calculator",
    description: "Calculate ad cost per result and compare it with target CPR.",
    category: "Marketing" as ToolCategory,
    icon: Calculator
  },
  {
    title: "Image Converter",
    href: "/tools/image-converter",
    description: "Convert JPG, PNG, WebP, AVIF, HEIC/HEIF, and SVG where supported.",
    category: "Image" as ToolCategory,
    icon: FileImage
  },
  {
    title: "Image Resizer",
    href: "/tools/image-resizer",
    description: "Resize images by pixels, ratio, percentage, or platform presets.",
    category: "Image" as ToolCategory,
    icon: ImageIcon
  },
  {
    title: "Image Compressor",
    href: "/tools/image-compressor",
    description: "Compress single or batch images and download optimized results.",
    category: "Image" as ToolCategory,
    icon: FileArchive
  },
  {
    title: "Video to Audio",
    href: "/tools/video-to-audio",
    description: "Extract MP3, WAV, or M4A audio from uploaded video files.",
    category: "Video" as ToolCategory,
    icon: Music
  },
  {
    title: "HTML Viewer",
    href: "/tools/html-viewer",
    description: "Preview HTML safely in a sandboxed iframe with optional CSS and JS.",
    category: "Developer" as ToolCategory,
    icon: Code2
  },
  {
    title: "QR Generator",
    href: "/tools/qr-generator",
    description: "Generate customizable QR codes for URLs, Wi-Fi, vCards, and more.",
    category: "Generator" as ToolCategory,
    icon: QrCode
  },
  {
    title: "Password Generator",
    href: "/tools/password-generator",
    description: "Generate secure client-side passwords with Web Crypto API.",
    category: "Security" as ToolCategory,
    icon: KeyRound
  },
  {
    title: "Video Downloader",
    href: "/tools/video-downloader",
    description: "Download supported legal direct media URLs only.",
    category: "Video" as ToolCategory,
    icon: Download
  }
];

export const categories: Array<"All" | ToolCategory> = ["All", "Marketing", "Image", "Video", "Developer", "Security", "Generator"];
