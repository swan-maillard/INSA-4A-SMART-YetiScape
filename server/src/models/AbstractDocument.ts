export default interface AbstractDocument {
  id: string;
  toFirestore(): { [key: string]: unknown };
}
