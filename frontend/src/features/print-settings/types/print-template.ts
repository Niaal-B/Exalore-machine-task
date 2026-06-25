export interface PrintTemplateSetting {
  headerImageUrl: string | null
  footerImageUrl: string | null
  primaryColor: string
  updatedAt: string
}

export interface PrintTemplateSettingApiResponse {
  header_image_url: string | null
  footer_image_url: string | null
  primary_color: string
  updated_at: string
}
