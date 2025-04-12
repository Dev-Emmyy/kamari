import './globals.css';


export const metadata = {
  title: 'Kamari Shop',
  description: 'Mini Shop Application',
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}