

export enum DocumentType {
  IMAGE = 'IMAGE',
  GIF = 'GIF',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  ALBUM = 'ALBUM',
  PROJECT = 'PROJECT',
  FILE = 'FILE',
}

export type VideoThumbnail = {
  name: string;
  path: string;
  mimetype: string;
  width: number;
  height: number;
  size: number;
};

export type VideoTrailer = VideoThumbnail & {
  duration: number;
};

export type UploadedDocument = Omit<
  VideoTrailer,
  'width' | 'height' | 'duration'
> & {
  id: string;
  type: DocumentType;
  width: number | null;
  height: number | null;
  duration: number | null;
  videoThumbnail?: VideoThumbnail;
  videoTrailer?: VideoTrailer;
  videoTrailerThumbnail?: VideoThumbnail;
  meta?: any;
};

export type DocumentFile = {
  id: string;
  thumb: string;
  selected?: boolean;
  showSelection?: boolean;
  fileName: string;
  // collaborators: Collaborator[];
  type: DocumentType;
  height: number;
  width: number;
  margin?: number;
  createdAt: string;
  updatedAt: string;
  originalId: string | null;
  albumId: string | null;
  ownerId: string;
  description: string | null;
  tags: string[] | null;
  mimetype: string;
  size: number;
  storage: string | null;
  path: string;
  duration: string | null;
  liveThumbnail: boolean;
  coverId: string | null;
  thumbnails: string[];
};
