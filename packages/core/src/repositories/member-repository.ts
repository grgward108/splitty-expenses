import type { Member } from "../entities/member";

export interface MemberRepository {
  findById(id: string): Promise<Member | null>;
  findByGroupId(groupId: string): Promise<Member[]>;
  save(member: Member): Promise<Member>;
  saveMany(members: Member[]): Promise<Member[]>;
  delete(id: string): Promise<void>;
}
