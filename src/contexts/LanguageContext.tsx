import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 
  | "English" 
  | "Hindi" 
  | "Bengali" 
  | "Telugu" 
  | "Marathi" 
  | "Tamil" 
  | "Urdu" 
  | "Gujarati" 
  | "Kannada" 
  | "Malayalam" 
  | "Odia" 
  | "Punjabi" 
  | "Assamese";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText: string) => string; // Placeholder for future string translation
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  English: {
    "Engineer View": "Engineer View",
    "Manager View": "Manager View",
    "AI Insights": "AI Insights",
    "Powered by Gemini": "Powered by Gemini",
    "Technical Summary": "Technical Summary",
    "Key Specifications": "Key Specifications",
    "Compliance Status": "Compliance Status",
    "Risk Factors": "Risk Factors",
    "Executive Summary": "Executive Summary",
    "Financial Overview": "Financial Overview",
    "Risk Assessment": "Risk Assessment",
    "Recommended Actions": "Recommended Actions",
    "Export Summary": "Export Summary",
    "Share Insights": "Share Insights",
    "Regenerate": "Regenerate",
    "View Original": "View Original",
    // Navigation & Settings
    "Settings": "Settings",
    "Language & Region": "Language & Region",
    "Interface Language": "Interface Language",
    "Select your preferred language for the application interface.": "Select your preferred language for the application interface.",
    "Note: AI Insights language is managed separately within the Document Viewer.": "Note: AI Insights language is managed separately within the Document Viewer.",
    "Select Language": "Select Language",
    "Current": "Current",
    "Appearance": "Appearance",
    "Theme selection (Dark/Light) is currently managed by the system.": "Theme selection (Dark/Light) is currently managed by the system.",
    "Dashboard": "Dashboard",
    "Search": "Search",
    "Profile": "Profile",
    "Logout": "Logout",
    "Admin Panel": "Admin Panel",
    "Language": "Language",
    // Sidebar
    "Documents": "Documents",
    "IoT Dashboard": "IoT Dashboard",
    "Knowledge Graph": "Knowledge Graph",
    "AR Visualization": "AR Visualization",
    "Compliance": "Compliance",
    "Features": "Features",
    "New": "New",
    // Dashboard & Widgets
    "Morning Briefing": "Morning Briefing",
    "Here's what you need to know today": "Here's what you need to know today",
    "System Status": "System Status",
    "Operational": "Operational",
    "Active Nodes": "Active Nodes",
    "Verification Rate": "Verification Rate",
    "Pending Review": "Pending Review",
    "Recent Activity": "Recent Activity",
    "Upload Document": "Upload Document",
    "View": "View",
    "Upload": "Upload",
    "Processing": "Processing",
    "Completed": "Completed",
    "Failed": "Failed"
  },
  Hindi: {
    "Engineer View": "इंजीनियर व्यू",
    "Manager View": "मैनेजर व्यू",
    "AI Insights": "AI इनसाइट्स",
    "Powered by Gemini": "जेमिनी द्वारा संचालित",
    "Technical Summary": "तकनीकी सारांश",
    "Key Specifications": "मुख्य विनिर्देश",
    "Compliance Status": "अनुपालन स्थिति",
    "Risk Factors": "जोखिम कारक",
    "Executive Summary": "कार्यकारी सारांश",
    "Financial Overview": "विततीय अवलोकन",
    "Risk Assessment": "जोखिम मूल्यांकन",
    "Recommended Actions": "अनुशंसित कार्रवाई",
    "Export Summary": "सारांश निर्यात करें",
    "Share Insights": "इनसाइट्स साझा करें",
    "Regenerate": "पुनः उत्पन्न करें",
    "View Original": "मूल देखें",
    // Navigation & Settings
    "Settings": "सेटिंग्स",
    "Language & Region": "भाषा और क्षेत्र",
    "Interface Language": "इंटरफ़ेस भाषा",
    "Select your preferred language for the application interface.": "एप्लिकेशन इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें।",
    "Note: AI Insights language is managed separately within the Document Viewer.": "नोट: AI इनसाइट्स की भाषा दस्तावेज़ व्यूअर के भीतर अलग से प्रबंधित की जाती है।",
    "Select Language": "भाषा चुनें",
    "Current": "वर्तमान",
    "Appearance": "दिखावट",
    "Theme selection (Dark/Light) is currently managed by the system.": "थीम चयन (डार्क/लाइट) वर्तमान में सिस्टम द्वारा प्रबंधित किया जाता है।",
    "Dashboard": "डैशबोर्ड",
    "Search": "खोजें",
    "Profile": "प्रोफ़ाइल",
    "Logout": "लॉग आउट",
    "Admin Panel": "एडमिन पैनल",
    "Language": "भाषा",
    // Sidebar
    "Documents": "दस्तावेज़",
    "IoT Dashboard": "प्रौद्योगिकी डैशबोर्ड", // IoT Dashboard
    "Knowledge Graph": "ज्ञान ग्राफ", // Knowledge Graph
    "AR Visualization": "AR विज़ुअलाइज़ेशन",
    "Compliance": "अनुपालन",
    "Features": "विशेषताएं",
    "New": "नया",
    // Dashboard & Widgets
    "Morning Briefing": "सुबह की जानकारी", // Morning Briefing
    "Here's what you need to know today": "आज आपको जो जानने की जरूरत है",
    "System Status": "सिस्टम स्थिति",
    "Operational": "परिचालन",
    "Active Nodes": "सक्रिय नोड्स",
    "Verification Rate": "सत्यापन दर",
    "Pending Review": "समीक्षा लंबित",
    "Recent Activity": "हाल की गतिविधि",
    "Upload Document": "दस्तावेज़ अपलोड करें",
    "View": "देखें",
    "Upload": "अपलोड",
    "Processing": "प्रोसेसिंग",
    "Completed": "पूर्ण",
    "Failed": "विफल"
  }
  // Add other languages as needed, defaulting to English for missing keys
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("English");

  // Load language from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('klens-language');
    // Validate saved language
    const isValidLang = SUPPORTED_LANGUAGES.some(l => l.value === savedLang);
    
    if (savedLang && isValidLang) {
      setLanguage(savedLang as Language);
    } else {
      // Force default to English if invalid or missing
      setLanguage("English");
      localStorage.setItem('klens-language', "English");
    }
  }, []);

  // Save language to local storage on change
  useEffect(() => {
    if (language) {
      localStorage.setItem('klens-language', language);
    }
  }, [language]);

  const t = (key: string, defaultText: string) => {
    const langData = translations[language as keyof typeof translations];
    if (langData && langData[key as keyof typeof langData]) {
      return langData[key as keyof typeof langData];
    }
    return defaultText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const SUPPORTED_LANGUAGES: { value: Language; label: string }[] = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi (हिंदी)" },
  { value: "Bengali", label: "Bengali (বাংলা)" },
  { value: "Telugu", label: "Telugu (తెలుగు)" },
  { value: "Marathi", label: "Marathi (मराठी)" },
  { value: "Tamil", label: "Tamil (தமிழ்)" },
  { value: "Urdu", label: "Urdu (اردو)" },
  { value: "Gujarati", label: "Gujarati (ગુજરાતી)" },
  { value: "Kannada", label: "Kannada (ಕನ್ನಡ)" },
  { value: "Malayalam", label: "Malayalam (മലയാളം)" },
  { value: "Odia", label: "Odia (ଓଡ଼ିଆ)" },
  { value: "Punjabi", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "Assamese", label: "Assamese (অসমীয়া)" },
];
