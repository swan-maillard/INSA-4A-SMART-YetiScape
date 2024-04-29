export default interface AbstractDocument {
  toFirestore(id?: string): { [key: string]: unknown };
}
