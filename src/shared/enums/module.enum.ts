export enum ModuleType {
  USER = 'USER',
  ROLE = 'ROLE',
  DOCUMENT = 'DOCUMENT',
}

export const ModuleOptions = Object.values(ModuleType).map((module) => ({
  label: module,
  value: module,
}));
