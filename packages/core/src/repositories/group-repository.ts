import type { Group } from "../entities/group";
import type { Member } from "../entities/member";

export interface GroupRepository {
  findById(id: string): Promise<Group | null>;
  findByIdWithMembers(id: string): Promise<{ group: Group; members: Member[] } | null>;
  save(group: Group): Promise<Group>;
  delete(id: string): Promise<void>;
}
