interface WorkResource {
  id: number;
  translations: Translations;
  title: string;
  slug: string;
  description: string;
  published_at: string | Date;
  attachment?: Attachment[];
  link_video: string;
  category: Category,
  optimize_attachment_url: string | null,
  attachment_url: string,
  video_link: string | null
}

interface Attachment {
  id: number;
  path: string;
  mime_type: string;
  size: number;
  attachmentable_type: string;
  attachmentable_id: number;
  type: string;
  user_id: number;
  meta: any;
  translation: any;
  created_at: string;
  updated_at: string;
  url: string;
}

interface Category {
  id: number;
  translations: Translations;
  title: TitleTranslations;
  slug: string;
  description: string;
  published_at: Date;
  attachment?: Attachment[];
}

interface TitleTranslations {
  en: string,
  ko: string
}

interface Translations {
  title: Record<string, string>;
  slug: Record<string, string>;
  description: Record<string, string>;
}

export type { WorkResource, Attachment, TitleTranslations };