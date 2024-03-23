import { IsNull, Not } from "typeorm";

export function getDeletedAtWhereClausule( allowDeleted: boolean = false ) {
  return !allowDeleted ? { deletedAt: Not(IsNull()) } : {};
}