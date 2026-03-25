import "./globals.css";

export const metadata = {
    title: "LearnTrack — Advanced Student Dashboard",
    description: "Comprehensive student learning dashboard with grades, attendance, projects, certifications, skills, and more.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
