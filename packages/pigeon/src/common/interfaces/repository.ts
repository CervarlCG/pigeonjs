export interface FindOptions {
  allowDeleted?: boolean;
}

export interface DeleteOptions {
  hardDelete?: boolean;
}

export interface RemoveOptions {
  soft?: boolean;
  children?: boolean;
}
