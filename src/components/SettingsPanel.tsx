"use client";

import React from "react";

export interface ReaderSettings {
  fontSize: "small" | "medium" | "large" | "xl";
  darkMode: boolean;
  showTranslation: boolean;
  translationLanguage: "english" | "urdu" | "both";
  showTransliteration: boolean;
  englishTranslation: string;
  urduTranslation: string;
}

interface SettingsPanelProps {
  settings: ReaderSettings;
  onChange: (settings: ReaderSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onClose }) => {
  const updateSetting = <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border-4 border-[#e2c275]">
        {/* Header */}
        <div className="bg-[#bfa76a] text-white p-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-bold">⚙️ Reading Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-semibold text-[#3a2e1a] mb-2">
              Arabic Text Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["small", "medium", "large", "xl"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting("fontSize", size)}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition ${
                    settings.fontSize === size
                      ? "bg-[#bfa76a] text-white border-[#bfa76a]"
                      : "bg-white text-[#7c6f57] border-[#e2c275] hover:bg-[#fffbe6]"
                  }`}
                >
                  {size === "small" && "A"}
                  {size === "medium" && "A+"}
                  {size === "large" && "A++"}
                  {size === "xl" && "A+++"}
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#3a2e1a]">Dark Mode</label>
            <button
              onClick={() => updateSetting("darkMode", !settings.darkMode)}
              className={`w-14 h-7 rounded-full transition relative ${
                settings.darkMode ? "bg-[#bfa76a]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.darkMode ? "translate-x-7" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Show Translation */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#3a2e1a]">Show Translation</label>
            <button
              onClick={() => updateSetting("showTranslation", !settings.showTranslation)}
              className={`w-14 h-7 rounded-full transition relative ${
                settings.showTranslation ? "bg-[#bfa76a]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.showTranslation ? "translate-x-7" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Translation Language */}
          {settings.showTranslation && (
            <div>
              <label className="block text-sm font-semibold text-[#3a2e1a] mb-2">
                Translation Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["english", "urdu", "both"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSetting("translationLanguage", lang)}
                    className={`px-3 py-2 rounded-lg border-2 font-medium capitalize transition ${
                      settings.translationLanguage === lang
                        ? "bg-[#bfa76a] text-white border-[#bfa76a]"
                        : "bg-white text-[#7c6f57] border-[#e2c275] hover:bg-[#fffbe6]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* English Translation Edition */}
          {settings.showTranslation && (settings.translationLanguage === "english" || settings.translationLanguage === "both") && (
            <div>
              <label className="block text-sm font-semibold text-[#3a2e1a] mb-2">
                English Translation
              </label>
              <select
                value={settings.englishTranslation}
                onChange={(e) => updateSetting("englishTranslation", e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#e2c275] rounded-lg focus:outline-none focus:border-[#bfa76a] text-[#7c6f57]"
              >
                <option value="en.asad">Muhammad Asad</option>
                <option value="en.sahih">Saheeh International</option>
                <option value="en.pickthall">Pickthall</option>
                <option value="en.yusufali">Yusuf Ali</option>
                <option value="en.hilali">Hilali & Khan</option>
              </select>
            </div>
          )}

          {/* Urdu Translation Edition */}
          {settings.showTranslation && (settings.translationLanguage === "urdu" || settings.translationLanguage === "both") && (
            <div>
              <label className="block text-sm font-semibold text-[#3a2e1a] mb-2">
                Urdu Translation
              </label>
              <select
                value={settings.urduTranslation}
                onChange={(e) => updateSetting("urduTranslation", e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#e2c275] rounded-lg focus:outline-none focus:border-[#bfa76a] text-[#7c6f57]"
              >
                <option value="ur.ahmedali">Ahmed Ali</option>
                <option value="ur.jalandhry">Fateh Muhammad Jalandhry</option>
                <option value="ur.qadri">Tahir ul Qadri</option>
                <option value="ur.jawadi">Syed Zeeshan Haider Jawadi</option>
              </select>
            </div>
          )}

          {/* Show Transliteration */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#3a2e1a]">
              Show Transliteration
            </label>
            <button
              onClick={() => updateSetting("showTransliteration", !settings.showTransliteration)}
              className={`w-14 h-7 rounded-full transition relative ${
                settings.showTransliteration ? "bg-[#bfa76a]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.showTransliteration ? "translate-x-7" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#e2c275] p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#bfa76a] hover:bg-[#e2c275] text-white font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
