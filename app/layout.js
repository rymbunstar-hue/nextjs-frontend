import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Sahoot! - Interactive Quiz",
  description: "Quiz online interaktif",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${poppins.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
