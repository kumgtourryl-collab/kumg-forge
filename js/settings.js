// KUMG Forge — Settings (theme + language)

const KUMG_LANGS = {
  en: {
    name: 'English',
    strings: {
      'app.name': 'KUMG Forge',
      'app.tagline': 'Build the web from your pocket.',
      'auth.signin': 'Sign in',
      'auth.signup': 'Create one',
      'auth.no_account': 'No account yet?',
      'auth.have_account': 'Already have an account?',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'dash.title': 'Your projects',
      'dash.blank': '+ Blank',
      'dash.templates': 'Templates',
      'dash.empty.title': 'No projects yet',
      'dash.empty.sub': 'Create your first project to get started.',
      'editor.save': 'Save',
      'editor.publish': 'Publish',
      'editor.preview': 'Preview',
      'settings.title': 'Settings',
      'settings.sub': 'Manage your account and preferences.',
      'settings.appearance': 'Appearance',
      'settings.theme': 'Theme',
      'settings.theme.dark': 'KUMG Dark',
      'settings.theme.light': 'Light',
      'settings.language': 'Language',
      'settings.account': 'Account',
      'settings.upgrade': 'Upgrade to Pro',
      'settings.logout': 'Sign out',
      'common.back': 'Back',
      'common.cancel': 'Cancel',
      'common.create': 'Create'
    }
  },
  sn: {
    name: 'chiShona',
    strings: {
      'app.name': 'KUMG Forge',
      'app.tagline': 'Vaka webhu kubva muhomwe mako.',
      'auth.signin': 'Pinda',
      'auth.signup': 'Gadzira imwe',
      'auth.no_account': 'Hauna account?',
      'auth.have_account': 'Wakatoita account?',
      'auth.email': 'Imeyili',
      'auth.password': 'Pasiwedhi',
      'dash.title': 'Maprojekti ako',
      'dash.blank': '+ Wavha',
      'dash.templates': 'Matemplate',
      'dash.empty.title': 'Hapana maprojekti',
      'dash.empty.sub': 'Gadzira projekti yekutanga kuti utange.',
      'editor.save': 'Sevha',
      'editor.publish': 'Bvumidza',
      'editor.preview': 'Tarisa',
      'settings.title': 'Zvirongwa',
      'settings.sub': 'Ronga account nezvido zvako.',
      'settings.appearance': 'Chitarisiko',
      'settings.theme': 'Mavara',
      'settings.theme.dark': 'KUMG Nhema',
      'settings.theme.light': 'Chiedza',
      'settings.language': 'Mutauro',
      'settings.account': 'Account',
      'settings.upgrade': 'Kwidzira ku Pro',
      'settings.logout': 'Buda',
      'common.back': 'Dzokera',
      'common.cancel': 'Kanzura',
      'common.create': 'Gadzira'
    }
  },
  nd: {
    name: 'isiNdebele',
    strings: {
      'app.name': 'KUMG Forge',
      'app.tagline': 'Yakha iwebhu isuka ekhwapheni lakho.',
      'auth.signin': 'Ngena',
      'auth.signup': 'Yakha entsha',
      'auth.no_account': 'Awunayo i-account?',
      'auth.have_account': 'Usunayo i-account?',
      'auth.email': 'I-imeyili',
      'auth.password': 'Iphasiwedi',
      'dash.title': 'Amaphrojekthi akho',
      'dash.blank': '+ Eze',
      'dash.templates': 'Amathempulethi',
      'dash.empty.title': 'Kazikho amaphrojekthi',
      'dash.empty.sub': 'Yakha iphrojekthi yakho yokuqala.',
      'editor.save': 'Gcina',
      'editor.publish': 'Thumela',
      'editor.preview': 'Bona',
      'settings.title': 'Amasethingi',
      'settings.sub': 'Lawula i-account yakho.',
      'settings.appearance': 'Ukubonakala',
      'settings.theme': 'Itimu',
      'settings.theme.dark': 'KUMG Emnyama',
      'settings.theme.light': 'Okukhanyayo',
      'settings.language': 'Ulimi',
      'settings.account': 'I-account',
      'settings.upgrade': 'Nyukela ku-Pro',
      'settings.logout': 'Phuma',
      'common.back': 'Buyela',
      'common.cancel': 'Khansela',
      'common.create': 'Yakha'
    }
  }
};

function kumgGetTheme(){
  return localStorage.getItem('kumg_theme') || 'dark';
}
function kumgSetTheme(t){
  localStorage.setItem('kumg_theme', t);
  if (t === 'light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');
}
function kumgGetLang(){
  return localStorage.getItem('kumg_lang') || 'en';
}
function kumgSetLang(code){
  if (!KUMG_LANGS[code]) code = 'en';
  localStorage.setItem('kumg_lang', code);
  document.documentElement.setAttribute('lang', code);
  kumgApplyTranslations();
}
function kumgT(key){
  const lang = kumgGetLang();
  const dict = KUMG_LANGS[lang]?.strings || KUMG_LANGS.en.strings;
  return dict[key] || KUMG_LANGS.en.strings[key] || key;
}
function kumgApplyTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = kumgT(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = kumgT(key);
  });
}

kumgApplyTranslations();