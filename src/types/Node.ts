export interface Block {
  index: number
  data: string
}

export interface Node {
  online: boolean;
  name: string;
  url: string;
  loading: boolean;
  loadingBlocks?: boolean;
  blocks?: Block[];
}
