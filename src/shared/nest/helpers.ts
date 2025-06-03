import { hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { DocumentType } from '@jkt/enums';

/**
 * generateSalt
 *
 * @param factor number
 */
// export const generateSalt = (factor: number): Promise<string> => {
//   return genSalt(factor);
// };

/**
 * generateRandomString
 *
 * @param size number
 * @returns string
 */
export const generateRandomString = (size: number): string => {
  return randomBytes(size).toString('hex');
};

/**
 * toHash
 *
 * @param {*} pass
 *
 * password hashing
 */
export const toHash = async (pass: string): Promise<string> => {
  return hash(pass, 10);
};

/**
 * checkHash
 *
 * @param {*} plain
 * @param {*} encrypted
 *
 * compare password hash with plain text
 */
export const checkHash = (
  plain: string,
  encrypted: string,
): Promise<boolean> => {
  return compare(plain, encrypted);
};

export const uuid = () => {
  return uuidv4();
};

// export const generateBarcodeString = (prefix = 'B') => {
//   const uuid = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
//   return `${prefix}${uuid}`;
// };

// export const generateUUIDByNumber = (input: number) => {
//   const namespace = 'd47e2f42-3fcd-11eb-adc1-0242ac120002';
//   const uuid = uuidv5(input.toString(), namespace);
//   return uuid;
// };

// export const generateUUIDByEmail = (email: string): string => {
//   const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
//   return uuidv5(email.toLowerCase().trim(), namespace);
// };

// export const nameFromSlug = (slug: string) => {
//   return slug.indexOf('-') !== -1
//     ? slug
//         .split('-')
//         .map((s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`)
//         .join(' ')
//     : `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
// };

// export const getPage = (pageQuery: string): number => {
//   const pageNum: number = pageQuery ? parseInt(pageQuery) : 1;

//   return pageNum ? pageNum : 1;
// };

// export const getLimit = (limit: number, pageSize?: string): number => {
//   if (!pageSize) {
//     return limit;
//   }

//   return parseInt(pageSize);
// };

// export const hmacSha256 = (
//   key: string,
//   str: string,
//   type: BinaryToTextEncoding = 'binary',
// ) => {
//   return createHmac('sha256', key).update(str).digest(type);
// };

// export const generateOTP = (length = 6) => {
//   const min = Math.pow(10, length - 1);
//   const max = Math.pow(10, length);
//   return Math.floor(Math.random() * (max - min) + min);
// };

export const getDocumentType = (type: string): DocumentType => {
  if (type.includes('image')) {
    return DocumentType.IMAGE;
  }

  if (type.includes('video')) {
    return DocumentType.VIDEO;
  }

  if (type.includes('audio')) {
    return DocumentType.AUDIO;
  }

  return DocumentType.FILE;
};
