import { Inter, Kumbh_Sans } from "next/font/google";
 
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "700"]
});
 
const kumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  variable: "--font-kumbh",
  weight: ["400", "500", "600", "700"]
});

export { inter, kumbhSans }