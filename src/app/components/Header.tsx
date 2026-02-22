import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, LogIn, UserPlus, Globe, LayoutDashboard, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { getStoredUser, logout } from "../api/auth";

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());
  const isLoggedIn = !!user;

  // Update user state when authentication changes
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getStoredUser();
      setUser(currentUser);
    };
    
    // Check immediately
    checkAuth();
    
    // Set up interval to check for auth changes (for mock mode)
    const interval = setInterval(checkAuth, 1000);
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };
    if (languageDropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [languageDropdownOpen]);

  const navLinks = [
    { path: "/", labelKey: "nav.home" },
    { path: "/features", labelKey: "nav.features" },
    { path: "/how-it-works", labelKey: "nav.howItWorks" },
    { path: "/voice-analyzer", labelKey: "nav.voiceAnalyzer" },
    { path: "/upload-report", labelKey: "nav.uploadReport" },
    { path: "/contact", labelKey: "nav.contact" },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "gu", name: "ગુજરાતી (Gujarati)" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", name: "മലയാളം (Malayalam)" },
    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "zh", name: "中文 (Chinese)" },
    { code: "ar", name: "العربية (Arabic)" },
    { code: "it", name: "Italiano (Italian)" },
    { code: "pt", name: "Português (Portuguese)" },
    { code: "ja", name: "日本語 (Japanese)" },
    { code: "ko", name: "한국어 (Korean)" },
    { code: "nl", name: "Nederlands (Dutch)" },
    { code: "ru", name: "Русский (Russian)" },
    { code: "tr", name: "Türkçe (Turkish)" },
    { code: "vi", name: "Tiếng Việt (Vietnamese)" },
    { code: "th", name: "ไทย (Thai)" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-emerald-100 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size="md" />
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-slate-800">
                MediSense
              </span>
              <span className="text-[10px] text-emerald-700 -mt-1 font-semibold tracking-wide">Healthcare Intelligence</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-all font-medium ${
                  isActive(link.path)
                    ? "text-emerald-700 scale-105"
                    : "text-slate-600 hover:text-blue-600 hover:scale-105"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* Language & CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-all"
              >
                <Globe className="size-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">
                  {languages.find((l) => l.code === i18n.language)?.name ?? i18n.language.toUpperCase()}
                </span>
              </button>
              {languageDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-emerald-100 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setLanguageDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-left"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <>
                <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all font-medium" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="size-4 mr-2" />
                    {t("nav.dashboard")}
                  </Link>
                </Button>
                <Button
                  className="bg-slate-600 hover:bg-slate-700 text-white shadow-md font-medium"
                  onClick={() => { logout(); navigate("/", { replace: true }); }}
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all font-medium" asChild>
                  <Link to="/login">
                    <LogIn className="size-4 mr-2" />
                    {t("nav.login")}
                  </Link>
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all font-medium" asChild>
                  <Link to="/signup">
                    <UserPlus className="size-4 mr-2" />
                    {t("nav.signUp")}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="size-6 text-slate-600" />
            ) : (
              <Menu className="size-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-100">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-2 py-1 rounded transition-colors ${
                    isActive(link.path)
                      ? "text-emerald-700 font-medium bg-emerald-50"
                      : "text-slate-600 hover:text-blue-600 hover:bg-sky-50"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-emerald-100">
                {isLoggedIn ? (
                  <>
                    <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 w-full" asChild>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard className="size-4 mr-2" />
                        {t("nav.dashboard")}
                      </Link>
                    </Button>
                    <Button
                      className="bg-slate-600 hover:bg-slate-700 text-white w-full"
                      onClick={() => { logout(); setIsMenuOpen(false); navigate("/", { replace: true }); }}
                    >
                      <LogOut className="size-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 w-full" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <LogIn className="size-4 mr-2" />
                        {t("nav.login")}
                      </Link>
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white w-full" asChild>
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                        <UserPlus className="size-4 mr-2" />
                        {t("nav.signUp")}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}