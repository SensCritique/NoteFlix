import { VideoType } from '../enum/VideoType'

export type BrowserExtensionProduct = {
  name?: string
  rating?: number
  platformId: string
  url?: string
  type?: VideoType
}

export type ApolloBrowserExtensionProduct = {
  rating?: number
  platformId: string
  slug?: string
  typeId?: number
  productId?: number
}
