import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Brain,
  FileSearch,
  Languages,
  TrendingUp,
  Bell,
  Lock,
  Download,
  Sparkles,
  BarChart3,
  UserCheck,
  Stethoscope,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function FeaturesPage() {
  const { t } = useTranslation();

  const coreFeatures = [
    { icon: Brain, titleKey: "features.core0Title", descKey: "features.core0Desc", benefitsKeys: ["features.core0B1", "features.core0B2", "features.core0B3"], color: "from-teal-500 to-cyan-500" },
    { icon: Languages, titleKey: "features.core1Title", descKey: "features.core1Desc", benefitsKeys: ["features.core1B1", "features.core1B2", "features.core1B3"], color: "from-cyan-500 to-blue-500" },
    { icon: FileSearch, titleKey: "features.core2Title", descKey: "features.core2Desc", benefitsKeys: ["features.core2B1", "features.core2B2", "features.core2B3"], color: "from-teal-500 to-emerald-500" },
    { icon: TrendingUp, titleKey: "features.core3Title", descKey: "features.core3Desc", benefitsKeys: ["features.core3B1", "features.core3B2", "features.core3B3"], color: "from-emerald-500 to-teal-500" },
    { icon: Sparkles, titleKey: "features.core4Title", descKey: "features.core4Desc", benefitsKeys: ["features.core4B1", "features.core4B2", "features.core4B3"], color: "from-cyan-500 to-teal-500" },
    { icon: Bell, titleKey: "features.core5Title", descKey: "features.core5Desc", benefitsKeys: ["features.core5B1", "features.core5B2", "features.core5B3"], color: "from-blue-500 to-cyan-500" },
  ];

  const securityFeatures = [
    { icon: Lock, titleKey: "features.sec0Title", descKey: "features.sec0Desc" },
    { icon: UserCheck, titleKey: "features.sec1Title", descKey: "features.sec1Desc" },
    { icon: ClipboardCheck, titleKey: "features.sec2Title", descKey: "features.sec2Desc" },
  ];

  const additionalFeatures = [
    { icon: Download, titleKey: "features.add0Title", descKey: "features.add0Desc" },
    { icon: BarChart3, titleKey: "features.add1Title", descKey: "features.add1Desc" },
    { icon: Stethoscope, titleKey: "features.add2Title", descKey: "features.add2Desc" },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
              {t("features.heroBadge")}
            </div>
            <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
              {t("features.heroTitle")}
            </h1>
            <p className="text-2xl text-gray-600 font-medium">
              {t("features.heroSubtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              {t("features.coreBadge")}
            </div>
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6">{t("features.everythingTitle")}</h2>
            <p className="text-2xl text-gray-600 font-medium">
              {t("features.everythingSubtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="border-2 border-teal-200 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/20 transition-all hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-white to-teal-50/30">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`bg-gradient-to-r ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl`}>
                      <feature.icon className="size-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed font-medium">{t(feature.descKey)}</p>
                      <ul className="space-y-3">
                        {feature.benefitsKeys.map((key, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                            <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex-shrink-0" />
                            {t(key)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border-2 border-white/30 shadow-2xl">
            <blockquote className="space-y-6">
              <p className="text-4xl md:text-5xl font-extrabold text-white italic leading-tight drop-shadow-2xl">
                "{t("features.quote1Text")}"
              </p>
              <footer className="text-teal-100 text-xl font-bold">— {t("features.quote1Author")}</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                {t("features.securityBadge")}
              </div>
              <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
                {t("features.securityTitle")}
              </h2>
              <p className="text-2xl text-gray-600 font-medium leading-relaxed">
                {t("features.securityDesc")}
              </p>

              <div className="space-y-6 pt-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-5 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-emerald-200 hover:border-emerald-400">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <feature.icon className="size-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-gray-600 leading-relaxed font-medium">{t(feature.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white hover:scale-105 transition-transform">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwc2VjdXJpdHklMjBwcml2YWN5fGVufDF8fHx8MTc3MTIzMDk1MHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Medical data security"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              {t("features.additionalBadge")}
            </div>
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6">{t("features.andMoreTitle")}</h2>
            <p className="text-2xl text-gray-600 font-medium">
              {t("features.andMoreSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all hover:scale-110 hover:-translate-y-3 group">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="bg-gradient-to-r from-cyan-500 to-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:rotate-12 transition-transform">
                    <feature.icon className="size-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{t(feature.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="space-y-6">
            <p className="text-4xl md:text-5xl font-extrabold text-gray-900 italic leading-tight">
              "{t("features.quote2Text")}"
            </p>
            <footer className="text-teal-600 text-xl font-bold">— {t("features.quote2Author")}</footer>
          </blockquote>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <h2 className="text-6xl font-extrabold text-white drop-shadow-2xl">
            {t("features.ctaTitle")}
          </h2>
          <p className="text-3xl text-teal-100 font-medium">
            {t("features.ctaSubtitle")}
          </p>
          <Button asChild className="bg-white text-teal-600 hover:bg-gray-100 px-12 py-6 rounded-2xl font-bold text-xl transition-all hover:scale-110 shadow-2xl">
            <Link to="/signup">{t("features.startFreeTrial")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
