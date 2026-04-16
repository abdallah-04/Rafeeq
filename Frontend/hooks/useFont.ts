import { useTranslation } from 'react-i18next';
import { typography } from '@/constants';

/**
 * Returns the correct font-family strings for the active language.
 * Use this in components that set fontFamily inline (not via the shared Text component).
 *
 * Example:
 *   const font = useFont()
 *   <Text style={{ fontFamily: font.bold }}>Hello</Text>
 */
export function useFont() {
    const { i18n } = useTranslation();
    return i18n.language === 'ar'
        ? typography.fontFamilyAr
        : typography.fontFamily;
}
