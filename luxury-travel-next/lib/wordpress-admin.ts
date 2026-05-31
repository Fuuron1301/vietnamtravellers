export type WordPressAdminConfig = {
  adminUrl: string | null;
  apiUrl: string | null;
  source: 'WORDPRESS_ADMIN_URL' | 'WORDPRESS_API_URL' | 'missing';
};

function cleanUrl(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : null;
}

export function getWordPressAdminConfig(): WordPressAdminConfig {
  const explicitAdminUrl = cleanUrl(process.env.WORDPRESS_ADMIN_URL);
  const apiUrl = cleanUrl(process.env.WORDPRESS_API_URL);

  if (explicitAdminUrl) {
    return {
      adminUrl: `${explicitAdminUrl}/`,
      apiUrl,
      source: 'WORDPRESS_ADMIN_URL'
    };
  }

  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      const wpJsonIndex = parsed.pathname.indexOf('/wp-json');
      parsed.pathname = wpJsonIndex >= 0 ? parsed.pathname.slice(0, wpJsonIndex) || '/' : '/';
      parsed.search = '';
      parsed.hash = '';
      const baseUrl = cleanUrl(parsed.toString());
      return {
        adminUrl: baseUrl ? `${baseUrl}/wp-admin/` : null,
        apiUrl,
        source: 'WORDPRESS_API_URL'
      };
    } catch {
      return {
        adminUrl: null,
        apiUrl,
        source: 'missing'
      };
    }
  }

  return {
    adminUrl: null,
    apiUrl: null,
    source: 'missing'
  };
}
