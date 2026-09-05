import "./globals.css";

export const metadata = {
  title: "The Cocoon",
  description: "Learn from the ones who did it first.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
