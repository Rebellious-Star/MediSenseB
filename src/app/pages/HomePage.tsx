import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Brain,
  FileText,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
  Award,
  Activity,
  Baby,
  User,
  UserCircle2,
  Sparkles,
  Heart,
  TrendingUp,
  BarChart,
  Droplet,
  Droplets,
  Wind,
  Pill,
  ScanSearch,
  Sun,
  Bone,
  Flower2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DiseaseModal } from "../components/DiseaseModal";

// Placeholder image URLs (replace with your assets if needed)
const aiHumanTech = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80";
const aiDoctorTech = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80";
const dnaTech = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80";
const bgPattern =
  "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23047857' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

export function HomePage() {
  const { t } = useTranslation();
  const [selectedDisease, setSelectedDisease] = useState<{
    name: string;
    icon: any;
    gradient: string;
  } | null>(null);

  const features = [
    { icon: Brain, titleKey: "home.feature0Title", descKey: "home.feature0Desc", color: "from-blue-500 to-sky-400" },
    { icon: MessageSquare, titleKey: "home.feature1Title", descKey: "home.feature1Desc", color: "from-emerald-500 to-teal-400" },
    { icon: FileText, titleKey: "home.feature2Title", descKey: "home.feature2Desc", color: "from-sky-400 to-blue-500" },
    { icon: Shield, titleKey: "home.feature3Title", descKey: "home.feature3Desc", color: "from-emerald-600 to-green-700" },
    { icon: Zap, titleKey: "home.feature4Title", descKey: "home.feature4Desc", color: "from-blue-600 to-indigo-600" },
    { icon: CheckCircle2, titleKey: "home.feature5Title", descKey: "home.feature5Desc", color: "from-teal-500 to-emerald-500" },
  ];

  const stats = [
    { icon: Clock, value: "24/7", labelKey: "home.stat0Label", color: "text-sky-100" },
    { icon: FileText, value: "5M+", labelKey: "home.stat1Label", color: "text-blue-100" },
    { icon: Users, value: "850K+", labelKey: "home.stat2Label", color: "text-emerald-100" },
    { icon: Award, value: "99.2%", labelKey: "home.stat3Label", color: "text-teal-100" },
  ];

  const diseaseKeys = ["home.disease0", "home.disease1", "home.disease2", "home.disease3", "home.disease4", "home.disease5", "home.disease6", "home.disease7", "home.disease8", "home.disease9", "home.disease10", "home.disease11", "home.disease12", "home.disease13", "home.disease14", "home.disease15"];
  // Icons per disease: Diabetes, Hypertension, Cardiovascular, Thyroid, Respiratory, Anemia, Kidney, Liver, Cancer, Cholesterol, Vitamin, Arthritis, Osteoporosis, Mental Health, Allergies, Autoimmune
  const diseaseIcons = [Droplet, Heart, Heart, TrendingUp, Wind, Droplets, Activity, Pill, ScanSearch, BarChart, Sun, Bone, Bone, Brain, Flower2, Shield];
  const diseaseGradients = ["from-blue-400 to-sky-500", "from-emerald-500 to-teal-500", "from-sky-400 to-blue-500", "from-teal-600 to-green-600", "from-blue-500 to-indigo-500", "from-emerald-600 to-green-700", "from-sky-500 to-blue-600", "from-teal-500 to-emerald-600", "from-blue-400 to-sky-500", "from-emerald-500 to-teal-500", "from-sky-400 to-blue-500", "from-teal-600 to-green-600", "from-blue-500 to-indigo-500", "from-emerald-600 to-green-700", "from-sky-500 to-blue-600", "from-teal-500 to-emerald-600"];
  const diseases = diseaseKeys.map((key, i) => ({ name: t(key), nameKey: key, icon: diseaseIcons[i], gradient: diseaseGradients[i] }));

  const ageCategories = [
    { icon: Baby, titleKey: "home.childrenTitle", descKey: "home.childrenDesc", featuresKeys: ["home.childrenF1", "home.childrenF2", "home.childrenF3"], image: "https://images.unsplash.com/photo-1758691463080-30a990ef61bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMHBlZGlhdHJpYyUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzcxMjI5OTMxfDA&ixlib=rb-4.1.0&q=80&w=1080", bgGradient: "from-emerald-50 to-teal-50", iconBg: "bg-gradient-to-r from-emerald-500 to-teal-500", borderColor: "border-emerald-200" },
    { icon: User, titleKey: "home.adultsTitle", descKey: "home.adultsDesc", featuresKeys: ["home.adultsF1", "home.adultsF2", "home.adultsF3"], image: "https://images.unsplash.com/photo-1764173040253-09c8c1d2a2fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHVsdCUyMHByb2Zlc3Npb25hbCUyMGhlYWx0aCUyMHdlbGxuZXNzfGVufDF8fHx8MTc3MTIyOTkzMXww&ixlib=rb-4.1.0&q=80&w=1080", bgGradient: "from-sky-50 to-blue-50", iconBg: "bg-gradient-to-r from-blue-500 to-sky-400", borderColor: "border-blue-200" },
    { icon: UserCircle2, titleKey: "home.seniorsTitle", descKey: "home.seniorsDesc", featuresKeys: ["home.seniorsF1", "home.seniorsF2", "home.seniorsF3"], image: "https://images.unsplash.com/photo-1603129473525-4cd6f36fe057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjBlbGRlcmx5JTIwaGVhbHRoY2FyZSUyMGhhcHB5fGVufDF8fHx8MTc3MTIyOTkzMXww&ixlib=rb-4.1.0&q=80&w=1080", bgGradient: "from-teal-50 to-emerald-50", iconBg: "bg-gradient-to-r from-teal-500 to-emerald-500", borderColor: "border-teal-200" },
  ];

  const testimonials = [
    { nameKey: "home.testimonial1Name", roleKey: "home.testimonial1Role", contentKey: "home.testimonial1Content", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" },
    { nameKey: "home.testimonial2Name", roleKey: "home.testimonial2Role", contentKey: "home.testimonial2Content", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400" },
    { nameKey: "home.testimonial3Name", roleKey: "home.testimonial3Role", contentKey: "home.testimonial3Content", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400" },
  ];

  const featureShowcase = [
    { titleKey: "home.featureShowcase0Title", descKey: "home.featureShowcase0Desc", quoteKey: "home.featureShowcase0Quote", image: aiHumanTech, bgColor: "bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-800" },
    { titleKey: "home.featureShowcase1Title", descKey: "home.featureShowcase1Desc", quoteKey: "home.featureShowcase1Quote", image: aiDoctorTech, bgColor: "bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900" },
    { titleKey: "home.featureShowcase2Title", descKey: "home.featureShowcase2Desc", quoteKey: "home.featureShowcase2Quote", image: dnaTech, bgColor: "bg-white" },
  ];

  return (
    <div className="bg-white relative">
      {/* Background Pattern - Fixed */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
        <img src={bgPattern} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-emerald-50 opacity-90"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-emerald-700 px-6 py-3 rounded-full text-sm font-bold shadow-lg border border-emerald-100 animate-float">
                <Sparkles className="size-5 animate-pulse" />
                {t("home.heroBadge")}
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-slate-800 leading-tight">
                {t("home.heroTitle")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                  {t("home.heroTitleHighlight")}
                </span>
              </h1>
              
              <p className="text-2xl text-slate-600 leading-relaxed">
                {t("home.heroSubtitle")}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-3">
                    <Clock className="size-6 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-800 text-lg">24/7</div>
                      <div className="text-xs text-blue-600 font-medium">{t("home.statAvailable")}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border-2 border-emerald-100 hover:border-emerald-300 transition-all">
                  <div className="flex items-center gap-3">
                    <Award className="size-6 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800 text-lg">99.2%</div>
                      <div className="text-xs text-emerald-600 font-medium">{t("home.statAccurate")}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border-2 border-sky-100 hover:border-sky-300 transition-all">
                  <div className="flex items-center gap-3">
                    <Users className="size-6 text-sky-600" />
                    <div>
                      <div className="font-bold text-slate-800 text-lg">850K+</div>
                      <div className="text-xs text-sky-600 font-medium">{t("home.statUsers")}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-6">
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-10 py-6 text-lg shadow-xl transition-all" asChild>
                  <Link to="/upload-report">
                    {t("home.uploadReport")}
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-10 py-6 text-lg transition-all"
                  asChild
                >
                  <Link to="/how-it-works">
                    <Heart className="mr-2 size-5" />
                    {t("home.learnMore")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Visual Element - Three Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-emerald-100">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1766325693532-b47cd7d9bd0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBtZWRpY2FsJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzExODY3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Doctor using medical technology"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {t("home.aiPowered")}
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-blue-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691462126-2ee47c8bf9e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwYXRpZW50JTIwY29uc3VsdGF0aW9uJTIwaGVhbHRoY2FyZXxlbnwxfHx8fDE3NzE2NDM2MzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Doctor patient consultation"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-teal-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691463203-cce9d415b2b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVjaG5vbG9neSUyMGhlYWx0aGNhcmUlMjBpbm5vdmF0aW9ufGVufDF8fHx8MTc3MTYwMDA1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Medical technology innovation"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <stat.icon className={`size-12 mx-auto mb-4 ${stat.color}`} />
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100 text-lg">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disease Coverage */}
      <section className="relative py-20 bg-gradient-to-b from-sky-50 to-white border-y border-emerald-100">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
              {t("home.comprehensiveCoverageBadge")}
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-4">
              {t("home.allMajorConditionsTitle")}
            </h2>
            <p className="text-xl text-slate-600">
              {t("home.allMajorConditionsSubtitle")}
            </p>
          </div>
          <div className="relative overflow-hidden py-6">
            <div className="flex gap-4 animate-scroll">
              {diseases.concat(diseases).map((disease, index) => (
                <div
                  key={index}
                  className="group flex-shrink-0 w-64 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-emerald-100 hover:border-emerald-300"
                  onClick={() => setSelectedDisease(disease)}
                >
                  <div className={`bg-gradient-to-r ${disease.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <disease.icon className="size-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {disease.name}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {t("home.clickToLearnMore")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase - Why Choose MediSense */}
      <section className="relative py-20 bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              {t("home.ourAdvantagesBadge")}
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              {t("home.whyChooseTitle")}
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto">
              {t("home.whyChooseSubtitle")}
            </p>
          </div>

          <div className="space-y-24">
            {featureShowcase.map((feature, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <h3 className="text-4xl font-bold text-slate-800">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-xl text-slate-600 leading-relaxed">{t(feature.descKey)}</p>
                  <blockquote className="border-l-4 border-emerald-600 pl-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-r-xl">
                    <p className="text-slate-800 italic text-xl font-bold leading-relaxed">
                      "{t(feature.quoteKey)}"
                    </p>
                  </blockquote>
                </div>
                <div className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <div className={`rounded-2xl overflow-hidden shadow-2xl ${feature.bgColor} p-8 border-4 ${index === 2 ? 'border-emerald-200' : 'border-blue-200'}`}>
                    <img
                      src={feature.image}
                      alt={t(feature.titleKey)}
                      className="w-full h-auto rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Categories */}
      <section className="relative py-20 bg-gradient-to-b from-sky-50 to-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              {t("home.ageSpecificBadge")}
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              {t("home.personalizedAgeTitle")}
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto">
              {t("home.personalizedAgeSubtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {ageCategories.map((category, index) => (
              <Card key={index} className={`border-3 ${category.borderColor} hover:shadow-2xl transition-all overflow-hidden`}>
                <div className={`h-64 overflow-hidden bg-gradient-to-br ${category.bgGradient} relative group`}>
                  <img
                    src={category.image}
                    alt={t(category.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-5 right-5">
                    <div className={`${category.iconBg} w-14 h-14 rounded-xl flex items-center justify-center shadow-xl`}>
                      <category.icon className="size-7 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className={`p-6 bg-gradient-to-br ${category.bgGradient} space-y-4`}>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {t(category.titleKey)}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{t(category.descKey)}</p>
                  <ul className="space-y-2">
                    {category.featuresKeys.map((key, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                        <CheckCircle2 className="size-5 flex-shrink-0 text-emerald-600" />
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              {t("home.coreFeaturesBadge")}
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              {t("home.powerfulFeaturesTitle")}
            </h2>
            <p className="text-2xl text-slate-600">
              {t("home.powerfulFeaturesSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className={`bg-gradient-to-r ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className="size-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{t(feature.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <blockquote className="space-y-6">
            <p className="text-5xl md:text-6xl font-black text-white italic leading-tight">
              "{t("home.quoteWealth")}"
            </p>
            <footer className="text-blue-100 text-2xl font-bold">— {t("home.quoteAuthor")}</footer>
          </blockquote>
        </div>
      </section>

      <section className="relative py-20 bg-gradient-to-b from-white to-sky-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              {t("home.testimonialsBadge")}
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              {t("home.trustedByTitle")}
            </h2>
            <p className="text-2xl text-slate-600">
              {t("home.trustedBySubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={t(testimonial.nameKey)}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200"
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{t(testimonial.nameKey)}</div>
                      <div className="text-sm text-emerald-600 font-medium">{t(testimonial.roleKey)}</div>
                    </div>
                  </div>
                  <p className="text-slate-700 italic leading-relaxed">"{t(testimonial.contentKey)}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-6xl font-bold text-white mb-8">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-3xl text-blue-100 mb-12">
            {t("home.ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button className="bg-white text-emerald-700 hover:bg-gray-50 px-12 py-6 text-xl" asChild>
              <Link to="/signup">
                {t("home.getStartedFree")}
                <ArrowRight className="ml-3 size-6" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-12 py-6 text-xl"
              asChild
            >
              <Link to="/contact">{t("home.contactSales")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Disease Modal */}
      <DiseaseModal
        selectedDisease={selectedDisease}
        onClose={() => setSelectedDisease(null)}
      />
    </div>
  );
}