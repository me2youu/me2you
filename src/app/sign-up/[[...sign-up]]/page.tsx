import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <SignUp 
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "mx-auto",
            card: "bg-dark-800 border border-white/5 shadow-2xl shadow-black/50",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "bg-dark-700 border-white/10 text-white hover:bg-dark-600",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-dark-700 border-white/10 text-white",
            footerActionLink: "text-accent-purple hover:text-accent-pink",
            dividerLine: "bg-white/10",
            dividerText: "text-gray-500",
          },
          variables: {
            colorPrimary: '#a855f7',
            colorBackground: '#16161f',
            colorText: '#e5e5e5',
            colorTextSecondary: '#888',
            colorInputBackground: '#1e1e2a',
            colorInputText: '#fff',
          }
        }}
      />
    </div>
  );
}
