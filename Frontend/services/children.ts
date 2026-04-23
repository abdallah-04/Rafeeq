/**
 * services/children.ts
 * DEPRECATED — all callers migrated to services/api.tsx.
 * Re-exports from api.tsx for backward compatibility.
 */
export { apiGetChildren as listChildren, apiGetChild as getChild, apiLinkChild as addChild } from './api';
export type { ChildResponse as Child } from './api';