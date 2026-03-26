import '../../style.css';

export const metadata = {
  title: 'Rock Paper Scissors',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
