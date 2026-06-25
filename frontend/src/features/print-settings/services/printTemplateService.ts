import { apiClient } from "@/lib/api-client"
import type {
  PrintTemplateSetting,
  PrintTemplateSettingApiResponse,
} from "@/features/print-settings/types/print-template"

function mapPrintTemplate(
  data: PrintTemplateSettingApiResponse,
): PrintTemplateSetting {
  return {
    headerImageUrl: data.header_image_url,
    footerImageUrl: data.footer_image_url,
    primaryColor: data.primary_color,
    updatedAt: data.updated_at,
  }
}

export async function getPrintTemplate(): Promise<PrintTemplateSetting> {
  const response = await apiClient.get<PrintTemplateSettingApiResponse>(
    "/api/print-template/",
  )
  return mapPrintTemplate(response.data)
}

export async function updatePrintTemplate(files: {
  headerImage?: File
  footerImage?: File
  primaryColor: string
}): Promise<PrintTemplateSetting> {
  const formData = new FormData()
  if (files.headerImage) formData.append("header_image", files.headerImage)
  if (files.footerImage) formData.append("footer_image", files.footerImage)
  formData.append("primary_color", files.primaryColor)

  const response = await apiClient.patch<PrintTemplateSettingApiResponse>(
    "/api/print-template/",
    formData,
  )
  return mapPrintTemplate(response.data)
}
