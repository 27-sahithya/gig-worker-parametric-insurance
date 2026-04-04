import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Basic mock translations
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Policy": "Buy Policy",
      "Claims": "Claims",
      "Payments": "Payments",
      "Profile": "Profile",
      "Welcome": "Welcome back",
      "Earnings Protected": "Earnings Protected",
      "Current Risk": "Current Risk Level",
      "Protect Income": "Protect Your Income"
    }
  },
  hi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "Policy": "पॉलिसी खरीदें",
      "Claims": "दावे (Claims)",
      "Payments": "भुगतान",
      "Profile": "प्रोफ़ाइल",
      "Welcome": "वापसी पर स्वागत है",
      "Earnings Protected": "कमाई सुरक्षित",
      "Current Risk": "वर्तमान जोखिम स्तर",
      "Protect Income": "अपनी आय सुरक्षित करें"
    }
  },
  te: {
    translation: {
      "Dashboard": "డాష్‌బోర్డ్",
      "Policy": "పాలసీ కొనండి",
      "Claims": "క్లెయిమ్‌లు",
      "Payments": "చెల్లింపులు",
      "Profile": "ప్రొఫైల్",
      "Welcome": "స్వాగతం",
      "Earnings Protected": "సంపాదన సురక్షితం",
      "Current Risk": "ప్రస్తుత ప్రమాద స్థాయి",
      "Protect Income": "మీ ఆదాయాన్ని రక్షించండి"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
