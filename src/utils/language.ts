export const detectLanguage = (text: string): string => {
  const t = (text || '').trim();
  if (!t) return 'English';
  // RTL abjads: Arabic / Urdu / Persian
  if (/[\u0600-\u06FF\u0750-\u077F]/.test(t)) return 'Arabic';
  // Bengali
  if (/[\u0980-\u09FF]/.test(t)) return 'bengali';
  // Turkish cues
  if (/\b(ve|için|bir|bu|nasıl|merhaba|teşekkür|lütfen|evet|hayır)\b/i.test(t)) return 'Turkish';
  return 'English';
};

export const getLangProps = (text: string, selectedLang: string): { dir: 'auto', className: string } => {
  const rtlLangs = ['Urdu', 'Arabic', 'Persian'];
  if (rtlLangs.includes(selectedLang)) {
      let className = 'font-arabic';
      if (selectedLang === 'Urdu') className = 'font-nastaaliq';
      return { dir: 'auto', className };
  }
  const hasRtlChars = /[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF]/.test(text);
  if (hasRtlChars) return { dir: 'auto', className: 'font-nastaaliq' };
  return { dir: 'auto', className: '' };
};
