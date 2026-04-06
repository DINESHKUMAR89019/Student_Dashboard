import "../globals.css";

export const metadata = {
    title: "Admin Dashboard — LearnTrack",
    description: "LearnTrack administrative control panel",
};

export default function AdminLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <script dangerouslySetInnerHTML={{__html: `
                  (function() {
                    const saved = localStorage.getItem("theme");
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    const isDarkMode = saved ? saved === "dark" : prefersDark;
                    if (!isDarkMode) {
                      document.documentElement.classList.add("light-mode");
                    }
                  })();
                `}} />
            </head>
            <body>{children}</body>
        </html>
    );
}
