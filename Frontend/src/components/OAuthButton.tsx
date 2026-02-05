interface OAuthButtonProps {
  provider: "google" | "apple";
  onClick: () => void;
}

export default function OAuthButton({ provider, onClick }: OAuthButtonProps) {
  const config = {
    google: {
      text: "Continue with Google",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
          <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
        </svg>
      ),
      className: "oauth-button oauth-google"
    },
    apple: {
      text: "Continue with Apple",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path d="M14.94 13.52c-.26.57-.38.83-.72 1.34-.47.71-1.14 1.6-1.96 1.61-.73.01-.91-.48-1.9-.47-.99 0-1.21.48-1.94.49-.82.01-1.42-.82-1.89-1.53-1.32-2-1.46-4.35-.65-5.6.58-.9 1.5-1.43 2.37-1.43.88 0 1.44.48 2.17.48.7 0 1.13-.49 2.14-.49.76 0 1.58.42 2.16 1.14-1.9 1.04-1.59 3.75.31 4.46h.01zm-2.95-8.8c.38-.48.67-1.14.56-1.82-.61.03-1.33.42-1.76.93-.38.45-.7 1.13-.58 1.78.67.04 1.37-.38 1.78-.89z"/>
        </svg>
      ),
      className: "oauth-button oauth-apple"
    }
  };

  const { text, icon, className } = config[provider];

  return (
    <button type="button" className={className} onClick={onClick}>
      {icon}
      <span>{text}</span>
    </button>
  );
}
