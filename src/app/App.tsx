import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageFontSync } from "./components/LanguageFontSync";
import { initEmailJS } from "./api/otp";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Initialize EmailJS when app loads
    initEmailJS();
  }, []);

  return (
    <>
      <LanguageFontSync />
      <RouterProvider router={router} />
    </>
  );
}
