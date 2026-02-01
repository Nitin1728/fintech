import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { EntriesProvider } from "./context/EntriesContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <EntriesProvider>
            {children}
          </EntriesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
