
export interface PropData {
  id: string,
  label: string,
  parentId: string
}

export interface RenderData extends PropData {
  level: number
}

export interface IdIndexMapping {
  [p: string]: number
}

export interface IdChildrenMapping {
  [p: string]: PropData[]
}