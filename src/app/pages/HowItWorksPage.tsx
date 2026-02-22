import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Upload,
  Scan,
  Brain,
  FileText,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";

export function HowItWorksPage() {
  const { t } = useTranslation();

  const steps = [
    { number: 1, icon: Upload, titleKey: "howItWorks.step1Title", descKey: "howItWorks.step1Desc", detailsKeys: ["howItWorks.step1D1", "howItWorks.step1D2", "howItWorks.step1D3", "howItWorks.step1D4"] },
    { number: 2, icon: Scan, titleKey: "howItWorks.step2Title", descKey: "howItWorks.step2Desc", detailsKeys: ["howItWorks.step2D1", "howItWorks.step2D2", "howItWorks.step2D3", "howItWorks.step2D4"] },
    { number: 3, icon: Brain, titleKey: "howItWorks.step3Title", descKey: "howItWorks.step3Desc", detailsKeys: ["howItWorks.step3D1", "howItWorks.step3D2", "howItWorks.step3D3", "howItWorks.step3D4"] },
    { number: 4, icon: FileText, titleKey: "howItWorks.step4Title", descKey: "howItWorks.step4Desc", detailsKeys: ["howItWorks.step4D1", "howItWorks.step4D2", "howItWorks.step4D3", "howItWorks.step4D4"] },
    { number: 5, icon: CheckCircle2, titleKey: "howItWorks.step5Title", descKey: "howItWorks.step5Desc", detailsKeys: ["howItWorks.step5D1", "howItWorks.step5D2", "howItWorks.step5D3", "howItWorks.step5D4"] },
  ];

  const technologies = [
    { icon: Brain, titleKey: "howItWorks.tech0Title", descKey: "howItWorks.tech0Desc" },
    { icon: Shield, titleKey: "howItWorks.tech1Title", descKey: "howItWorks.tech1Desc" },
    { icon: Zap, titleKey: "howItWorks.tech2Title", descKey: "howItWorks.tech2Desc" },
    { icon: Target, titleKey: "howItWorks.tech3Title", descKey: "howItWorks.tech3Desc" },
  ];

  const reportTypeKeys = ["howItWorks.report0", "howItWorks.report1", "howItWorks.report2", "howItWorks.report3", "howItWorks.report4", "howItWorks.report5", "howItWorks.report6", "howItWorks.report7", "howItWorks.report8", "howItWorks.report9", "howItWorks.report10", "howItWorks.report11"];

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {t("howItWorks.heroTitle")}
            </h1>
            <p className="text-xl text-gray-600">
              {t("howItWorks.heroSubtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                      {step.number}
                    </div>
                    <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center">
                      <step.icon className="size-8 text-blue-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{t(step.titleKey)}</h2>
                  <p className="text-lg text-gray-600 mb-6">{t(step.descKey)}</p>
                  <ul className="space-y-3">
                    {step.detailsKeys.map((key, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <Card className="border-gray-200 shadow-lg">
                    <CardContent className="p-8">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
                        <step.icon className="size-24 text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600 italic">
                          Step {step.number}: {t(step.titleKey)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("howItWorks.techTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("howItWorks.techSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technologies.map((tech, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <tech.icon className="size-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(tech.titleKey)}</h3>
                  <p className="text-gray-600 text-sm">{t(tech.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Reports Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t("howItWorks.reportsTitle")}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t("howItWorks.reportsSubtitle")}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {reportTypeKeys.map((key, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{t(key)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6">
                  <Link to="/signup">
                    {t("howItWorks.tryItNow")}
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1768323286301-6fd85d28f47b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGFydGlmaWNpYWwlMjBpbnRlbGxpZ2VuY2UlMjBoZWFsdGhjYXJlfGVufDF8fHx8MTc3MTE4MTUxM3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="AI healthcare technology"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t("howItWorks.ctaTitle")}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t("howItWorks.ctaSubtitle")}
          </p>
          <Button asChild className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
            <Link to="/signup">
              {t("howItWorks.getStartedNow")}
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
